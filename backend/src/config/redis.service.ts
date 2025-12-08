import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis;
  private isConnected = false;
  private connectionAttempts = 0;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const host = this.configService.get<string>('REDIS_HOST', 'localhost');
    const port = this.configService.get<number>('REDIS_PORT', 6379);
    const password = this.configService.get<string>('REDIS_PASSWORD');

    const redisConfig: any = {
      host,
      port,
      keyPrefix: this.configService.get<string>('REDIS_KEY_PREFIX', 'nebu:'),
      retryStrategy: (times) => {
        this.connectionAttempts = times;
        const delay = Math.min(times * 50, 2000);
        
        // Log retry attempts as warnings, not errors
        if (times <= 5) {
          this.logger.log(`Redis connection attempt ${times}, retrying in ${delay}ms...`);
        } else if (times === 10) {
          this.logger.warn(`Redis connection taking longer than expected (${times} attempts)`);
        }
        
        return delay;
      },
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      connectTimeout: 10000,
    };

    // Only add password if it's not empty
    if (password && password.trim() !== '') {
      redisConfig.password = password;
    }

    this.client = new Redis(redisConfig);

    this.client.on('connect', () => {
      this.logger.log(`Redis connected to ${host}:${port}`);
    });

    this.client.on('ready', () => {
      this.isConnected = true;
      if (this.connectionAttempts > 0) {
        this.logger.log(`Redis connection established after ${this.connectionAttempts} attempts`);
      }
      this.connectionAttempts = 0;
    });

    this.client.on('error', (error) => {
      // Durante el inicio (primeros intentos), tratamos timeouts como logs normales
      if (!this.isConnected && this.connectionAttempts <= 3 && error.message.includes('ETIMEDOUT')) {
        this.logger.log(`Redis connecting... (timeout during initial connection is normal)`);
      } else if (!this.isConnected && error.message.includes('ETIMEDOUT')) {
        this.logger.warn(`Redis connection timeout: ${error.message}`);
      } else {
        // Errores reales (no de conexión inicial) se registran como errores
        this.logger.error(`Redis error: ${error.message}`);
      }
    });

    this.client.on('close', () => {
      if (this.isConnected) {
        this.logger.warn('Redis connection closed');
        this.isConnected = false;
      }
    });

    this.client.on('reconnecting', () => {
      this.logger.log('Redis reconnecting...');
    });
  }

  async onModuleDestroy() {
    await this.client.quit();
    this.logger.log('Redis connection closed gracefully');
  }

  /**
   * Get value by key
   */
  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  /**
   * Set value with optional TTL (seconds)
   */
  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await this.client.setex(key, ttl, value);
    } else {
      await this.client.set(key, value);
    }
  }

  /**
   * Delete key
   */
  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  /**
   * Delete keys by pattern
   */
  async delPattern(pattern: string): Promise<void> {
    const keys = await this.client.keys(pattern);
    if (keys.length > 0) {
      await this.client.del(...keys);
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }

  /**
   * Set expiration time (seconds)
   */
  async expire(key: string, seconds: number): Promise<void> {
    await this.client.expire(key, seconds);
  }

  /**
   * Get TTL of a key
   */
  async ttl(key: string): Promise<number> {
    return this.client.ttl(key);
  }

  /**
   * Increment value
   */
  async incr(key: string): Promise<number> {
    return this.client.incr(key);
  }

  /**
   * Decrement value
   */
  async decr(key: string): Promise<number> {
    return this.client.decr(key);
  }

  /**
   * Get multiple keys
   */
  async mget(...keys: string[]): Promise<(string | null)[]> {
    return this.client.mget(...keys);
  }

  /**
   * Set multiple keys
   */
  async mset(keyValues: Record<string, string>): Promise<void> {
    const args: string[] = [];
    for (const [key, value] of Object.entries(keyValues)) {
      args.push(key, value);
    }
    await this.client.mset(...args);
  }

  /**
   * Flush all keys (use with caution)
   */
  async flushAll(): Promise<void> {
    await this.client.flushall();
    this.logger.warn('Redis: All keys flushed');
  }

  /**
   * Get Redis client for advanced operations
   */
  getClient(): Redis {
    return this.client;
  }
}
