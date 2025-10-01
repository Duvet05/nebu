import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { User } from '../users/entities/user.entity';
import { AuthService } from './services/auth.service';
import { EmailService } from './services/email.service';
import { TokenValidationService } from './services/token-validation.service';
import { AuthController } from './controllers/auth.controller';
import { NextAuthController } from './controllers/nextauth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { FeaturesConfig } from '../config/features.config';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('auth.jwtSecret'),
        signOptions: {
          expiresIn: configService.get<string>('auth.jwtExpiresIn'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, EmailService, TokenValidationService, JwtStrategy, FeaturesConfig],
  controllers: [AuthController, NextAuthController],
  exports: [AuthService, TokenValidationService, JwtStrategy, FeaturesConfig, PassportModule],
})
export class AuthModule {}
