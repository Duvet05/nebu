import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { User } from '../users/entities/user.entity';
import { AuthService } from './services/auth.service';
import { TokenValidationService } from './services/token-validation.service';
import { AuthController } from './controllers/auth.controller';
import { AuthFrontendController } from './controllers/auth-frontend.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { FeaturesConfig } from '../config/features.config';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    EmailModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const expiresIn = configService.get<string>('auth.jwtExpiresIn') || '1h';
        return {
          secret: configService.get<string>('auth.jwtSecret'),
          signOptions: {
            expiresIn: expiresIn as any, // Cast needed for compatibility with @nestjs/jwt v11
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, TokenValidationService, JwtStrategy, FeaturesConfig],
  controllers: [AuthController, AuthFrontendController],
  exports: [AuthService, TokenValidationService, JwtStrategy, FeaturesConfig, PassportModule],
})
export class AuthModule {}
