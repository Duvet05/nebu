import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../services/auth.service';
import { TokenValidationService } from '../services/token-validation.service';
import { AuthenticatedRequest } from '../../common/types/common.types';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
    private tokenValidationService: TokenValidationService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false, // We handle expiration in our validation service
      secretOrKey: configService.get<string>('auth.jwtSecret'),
      passReqToCallback: true, // Allow access to request for token extraction
    });
  }

  async validate(
    req: AuthenticatedRequest,
    payload: { sub: string; email: string; role: string }
  ): Promise<User> {
    try {
      // Extract token from request for additional validation
      const authHeader = req.headers.authorization;
      const token = this.tokenValidationService.extractTokenFromHeader(authHeader);

      if (!token) {
        throw new UnauthorizedException('Token no proporcionado');
      }

      // Use enhanced token validation
      const validationResult = await this.tokenValidationService.validateToken(token, 'access');

      if (!validationResult.isValid) {
        if (validationResult.isExpired) {
          throw new UnauthorizedException('Token expirado');
        }
        throw new UnauthorizedException(validationResult.error || 'Token inválido');
      }

      // Validate user with auth service
      const user = await this.authService.validateUser(payload.sub);
      if (!user) {
        throw new UnauthorizedException('Usuario no encontrado');
      }

      return user;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Error validando token');
    }
  }
}
