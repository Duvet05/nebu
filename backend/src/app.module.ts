import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { ThrottlerModule } from '@nestjs/throttler';
import { JwtModule } from '@nestjs/jwt';
import { redisStore } from 'cache-manager-redis-yet';

// Configuration
import { databaseConfig } from './config/database.config';
import { authConfig } from './config/auth.config';
import { redisConfig } from './config/redis.config';
import { smtpConfig } from './config/smtp.config';
import { emailConfig } from './config/email.config';
import { applicationConfig } from './config/application.config';
import { paymentsConfig } from './config/payments.config';
import cloudinaryConfig from './config/cloudinary.config';

// Modules
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AdminModule } from './admin/admin.module';
import { HealthModule } from './common/health.module';
import { NotificationsModule } from './notifications/notifications.module';
import { EmailModule } from './email/email.module';
import { SecurityModule } from './security/security.module';
import { QueueModule } from './queue/queue.module';
import { SearchModule } from './search/search.module';
import { CompanyModule } from './company/company.module';
import { LiveKitModule } from './livekit/livekit.module';
import { IoTModule } from './iot/iot.module';
import { VoiceModule } from './voice/voice.module';
import { ToysModule } from './toys/toys.module';
import { DynamicModulesConfig } from './config/dynamic-modules.config';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        databaseConfig,
        authConfig,
        redisConfig,
        smtpConfig,
        emailConfig,
        applicationConfig,
        paymentsConfig,
        cloudinaryConfig,
      ],
      envFilePath: ['.env.local', '.env'],
    }),

    // Database - Direct configuration to ensure synchronization works
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: () => ({
        type: 'postgres' as const,
        host: process.env.DATABASE_HOST!,
        port: parseInt(process.env.DATABASE_PORT || '5432', 10),
        username: process.env.DATABASE_USERNAME!,
        password: process.env.DATABASE_PASSWORD!,
        database: process.env.DATABASE_NAME!,
        entities: [], // Let autoLoadEntities handle this
        synchronize: process.env.NODE_ENV !== 'production', // Auto-sync in development only
        logging: process.env.NODE_ENV === 'development',
        ssl: process.env.DATABASE_SSL === 'true' ? {
          rejectUnauthorized: process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== 'false',
        } : false,
        autoLoadEntities: true, // This SHOULD work with webpack
        retryAttempts: 3,
        retryDelay: 3000,
        maxQueryExecutionTime: 10000,
        connectTimeoutMS: 10000,
        acquireTimeoutMS: 10000,
        timeout: 10000,
      }),
    }),

    // Redis Cache
    CacheModule.registerAsync({
      imports: [ConfigModule],
      isGlobal: true,
      useFactory: async (configService: ConfigService) => ({
        store: redisStore,
        socket: {
          host: configService.get<string>('redis.host'),
          port: configService.get<number>('redis.port'),
        },
        password: configService.get<string>('redis.password'),
        ttl: configService.get<number>('redis.ttl'),
      }),
      inject: [ConfigService],
    }),

    // Rate Limiting
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000, // 1 second
        limit: 10, // 10 requests per second
      },
      {
        name: 'medium',
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
      {
        name: 'long',
        ttl: 3600000, // 1 hour
        limit: 1000, // 1000 requests per hour
      },
    ]),

    // JWT Module (Global)
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('auth.jwtSecret'),
        signOptions: {
          expiresIn: configService.get<string>('auth.jwtExpiresIn'),
        },
      }),
      inject: [ConfigService],
      global: true,
    }),

    // Core Modules (always loaded)
    AuthModule,
    UsersModule,
    AdminModule,
    HealthModule,
    EmailModule,
    SecurityModule,
    QueueModule,
    SearchModule,
    CompanyModule,
    LiveKitModule,
    IoTModule,
    VoiceModule,
    ToysModule,
    NotificationsModule,

    // Dynamic Modules (loaded based on feature flags)
    DynamicModulesConfig.forRoot(new ConfigService()),
  ],
})
export class AppModule {}
