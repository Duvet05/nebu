import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule,
    // AdminJS will be loaded conditionally to avoid ESM issues
  ],
  providers: [
    {
      provide: 'ADMIN_CONFIG',
      useFactory: (configService: ConfigService) => ({
        enabled: configService.get<string>('ADMIN_ENABLED') === 'true',
        email: configService.get<string>('ADMIN_EMAIL') || 'admin@nebu.academy',
        password: configService.get<string>('ADMIN_PASSWORD') || 'admin123',
      }),
      inject: [ConfigService],
    },
  ],
  exports: ['ADMIN_CONFIG'],
})
export class AdminModule {
  // AdminJS will be loaded dynamically when needed
  // This prevents ESM import issues during startup
}
