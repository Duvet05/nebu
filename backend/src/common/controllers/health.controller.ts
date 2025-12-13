import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import axios from 'axios';
import { Public } from '../../auth/decorators/public.decorator';

@Injectable()
export class HealthService {
  constructor(
    private configService: ConfigService,
    @InjectDataSource()
    private dataSource: DataSource,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache
  ) {}

  async getHealthStatus() {
    const startTime = Date.now();

    try {
      const healthData = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'nebu-backend',
        version: '1.0.0',
        environment: this.configService.get<string>('NODE_ENV'),
        uptime: Math.floor(process.uptime()),
        memory: this.getMemoryMetrics(),
        checks: {
          database: await this.checkDatabase(),
          redis: await this.checkRedis(),
          chromadb: await this.checkChromaDB(),
          configuration: this.checkConfiguration(),
          external: await this.checkExternalServices(),
        },
        performance: {
          responseTime: 0, // Se calculará al final
          pid: process.pid,
          platform: process.platform,
          nodeVersion: process.version,
        },
      };

      // Calcular tiempo de respuesta
      healthData.performance.responseTime = Date.now() - startTime;

      // Determinar estado general
      const failedChecks = Object.values(healthData.checks).filter(
        check => typeof check === 'object' && check.status !== 'ok'
      ).length;

      if (failedChecks > 0) {
        healthData.status = 'degraded';
      }

      // Verificar umbrales críticos
      // Note: Node.js heap usage at 80-90% is normal - the heap grows dynamically as needed
      // Only mark as critical if heap is extremely high (>95%) or response time is too slow
      if (healthData.memory.heapUsedPercent > 95 || healthData.performance.responseTime > 5000) {
        healthData.status = 'critical';
      }

      return healthData;
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        service: 'nebu-backend',
        error: error instanceof Error ? error.message : 'Unknown error',
        uptime: Math.floor(process.uptime()),
        performance: {
          responseTime: Date.now() - startTime,
        },
      };
    }
  }

  private getMemoryMetrics() {
    const memUsage = process.memoryUsage();
    const totalHeap = memUsage.heapTotal;
    const usedHeap = memUsage.heapUsed;

    return {
      heapUsed: Math.round((usedHeap / 1024 / 1024) * 100) / 100, // MB
      heapTotal: Math.round((totalHeap / 1024 / 1024) * 100) / 100, // MB
      heapUsedPercent: Math.round((usedHeap / totalHeap) * 100),
      external: Math.round((memUsage.external / 1024 / 1024) * 100) / 100, // MB
      rss: Math.round((memUsage.rss / 1024 / 1024) * 100) / 100, // MB
      arrayBuffers: Math.round((memUsage.arrayBuffers / 1024 / 1024) * 100) / 100, // MB
    };
  }

  private async checkDatabase() {
    try {
      await this.dataSource.query('SELECT 1');
      const options = this.dataSource.options as any;
      return {
        status: 'ok',
        connected: true,
        type: options.type,
        host: options.host || 'localhost',
      };
    } catch (error) {
      return {
        status: 'error',
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown database error',
      };
    }
  }

  private async checkRedis() {
    try {
      await this.cacheManager.set('health:test', 'ok', 10000);
      const result = await this.cacheManager.get('health:test');

      return {
        status: result === 'ok' ? 'ok' : 'error',
        connected: result === 'ok',
        host: this.configService.get<string>('redis.host'),
        port: this.configService.get<number>('redis.port'),
      };
    } catch (error) {
      return {
        status: 'error',
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown Redis error',
      };
    }
  }

  private async checkChromaDB() {
    try {
      const chromaHost = this.configService.get<string>('CHROMADB_HOST', 'chromadb');
      const chromaPort = this.configService.get<number>('CHROMADB_PORT', 8000);
      const chromaUrl = `http://${chromaHost}:${chromaPort}`;

      const response = await axios.get(`${chromaUrl}/api/v2/heartbeat`, {
        timeout: 3000,
      });

      return {
        status: response.status === 200 ? 'ok' : 'error',
        connected: response.status === 200,
        host: chromaHost,
        port: chromaPort,
        url: chromaUrl,
      };
    } catch (error) {
      return {
        status: 'warning', // Warning porque ChromaDB no es crítico para el backend
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown ChromaDB error',
        note: 'ChromaDB is optional - backend can run without it',
      };
    }
  }

  private checkConfiguration() {
    const criticalConfigs = ['database.host', 'database.database', 'auth.jwtSecret', 'redis.host'];

    const missingConfigs = criticalConfigs.filter(config => !this.configService.get(config));

    return {
      status: missingConfigs.length === 0 ? 'ok' : 'error',
      missing: missingConfigs,
      total: criticalConfigs.length,
      configured: criticalConfigs.length - missingConfigs.length,
    };
  }

  private async checkExternalServices() {
    const checks = {
      smtp: !!this.configService.get('smtp.host'),
      culqi: !!(
        this.configService.get('CULQI_SECRET_KEY') &&
        this.configService.get('CULQI_PUBLIC_KEY')
      ),
      frontend: await this.checkFrontend(),
    };

    const failedServices = Object.entries(checks)
      .filter(([_, status]) => !status)
      .map(([name, _]) => name);

    return {
      status: failedServices.length === 0 ? 'ok' : 'error',
      failed: failedServices,
      checks,
    };
  }

  private async checkFrontend() {
    try {
      const frontendUrl = this.configService.get('FRONTEND_URL');
      if (!frontendUrl) return false;

      // Use container name for internal Docker network communication
      const internalUrl = frontendUrl.replace('localhost:3000', 'frontend:3000');
      
      const response = await axios.get(`${internalUrl}/api/health`, {
        timeout: 5000,
      });
      
      return response.status === 200;
    } catch {
      return false;
    }
  }

  async getReadinessStatus() {
    try {
      const checks = {
        database: await this.checkDatabase(),
        redis: await this.checkRedis(),
        configuration: this.checkConfiguration(),
      };

      const isReady = Object.values(checks).every(check => check.status === 'ok');

      return {
        status: isReady ? 'ready' : 'not-ready',
        timestamp: new Date().toISOString(),
        service: 'nebu-backend',
        checks,
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        service: 'nebu-backend',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  getLivenessStatus() {
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      pid: process.pid,
    };
  }
}

@Controller('health')
@Public()
export class HealthController {
  constructor(private healthService: HealthService) {}

  @Get()
  async getHealth() {
    return this.healthService.getHealthStatus();
  }

  @Get('readiness')
  async getReadiness() {
    return this.healthService.getReadinessStatus();
  }

  @Get('liveness')
  getLiveness() {
    return this.healthService.getLivenessStatus();
  }
}
