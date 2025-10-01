import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserStatus } from '../../users/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { TokenValidationEventDetails } from '../../common/types/common.types';

export interface TokenValidationResult {
  isValid: boolean;
  isExpired: boolean;
  user?: User;
  error?: string;
  tokenType?: 'access' | 'refresh';
}

export interface DecodedToken {
  sub: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
  tokenType?: 'access' | 'refresh';
}

@Injectable()
export class TokenValidationService {
  private readonly logger = new Logger(TokenValidationService.name);

  constructor(
    private jwtService: JwtService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private configService: ConfigService
  ) {}

  /**
   * Validates a JWT token with comprehensive error handling
   */
  async validateToken(
    token: string,
    tokenType: 'access' | 'refresh' = 'access'
  ): Promise<TokenValidationResult> {
    try {
      // First, decode without verification to check expiration
      const decoded = this.decodeTokenWithoutVerification(token);

      if (!decoded) {
        return {
          isValid: false,
          isExpired: false,
          error: 'Token malformado',
        };
      }

      // Check if token is expired
      const now = Math.floor(Date.now() / 1000);
      const isExpired = decoded.exp < now;

      if (isExpired) {
        this.logger.warn(`Token expirado para usuario ${decoded.sub}`);
        return {
          isValid: false,
          isExpired: true,
          error: 'Token expirado',
        };
      }

      // Verify token signature and structure
      const verifiedPayload = this.jwtService.verify(token);

      // Validate token type if specified
      if (tokenType && verifiedPayload.tokenType && verifiedPayload.tokenType !== tokenType) {
        return {
          isValid: false,
          isExpired: false,
          error: `Token tipo incorrecto. Esperado: ${tokenType}, recibido: ${verifiedPayload.tokenType}`,
        };
      }

      // Validate user exists and is active
      const user = await this.validateUser(verifiedPayload.sub);
      if (!user) {
        return {
          isValid: false,
          isExpired: false,
          error: 'Usuario no encontrado',
        };
      }

      // Check if user is active
      if (user.status !== UserStatus.ACTIVE) {
        return {
          isValid: false,
          isExpired: false,
          error: 'Usuario inactivo',
        };
      }

      return {
        isValid: true,
        isExpired: false,
        user,
        tokenType: verifiedPayload.tokenType || 'access',
      };
    } catch (error) {
      this.logger.error('Error validando token:', error);

      if (error.name === 'TokenExpiredError') {
        return {
          isValid: false,
          isExpired: true,
          error: 'Token expirado',
        };
      }

      if (error.name === 'JsonWebTokenError') {
        return {
          isValid: false,
          isExpired: false,
          error: 'Token inválido',
        };
      }

      if (error.name === 'NotBeforeError') {
        return {
          isValid: false,
          isExpired: false,
          error: 'Token no válido aún',
        };
      }

      return {
        isValid: false,
        isExpired: false,
        error: 'Error interno validando token',
      };
    }
  }

  /**
   * Validates refresh token with additional security checks
   */
  async validateRefreshToken(refreshToken: string): Promise<TokenValidationResult> {
    const result = await this.validateToken(refreshToken, 'refresh');

    if (!result.isValid) {
      return result;
    }

    // Additional checks for refresh tokens
    const decoded = this.decodeTokenWithoutVerification(refreshToken);
    if (decoded) {
      // Check if refresh token is not too old (max 7 days)
      const maxAge = 7 * 24 * 60 * 60; // 7 days in seconds
      const now = Math.floor(Date.now() / 1000);

      if (decoded.iat && now - decoded.iat > maxAge) {
        return {
          isValid: false,
          isExpired: true,
          error: 'Refresh token demasiado antiguo',
        };
      }
    }

    return result;
  }

  /**
   * Extracts token from Authorization header
   */
  extractTokenFromHeader(authHeader: string): string | null {
    if (!authHeader) {
      return null;
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }

    return parts[1];
  }

  /**
   * Checks if token is close to expiration (within 1 hour)
   */
  isTokenNearExpiration(token: string): boolean {
    try {
      const decoded = this.decodeTokenWithoutVerification(token);
      if (!decoded) {
        return false;
      }

      const now = Math.floor(Date.now() / 1000);
      const oneHour = 60 * 60; // 1 hour in seconds

      return decoded.exp - now < oneHour;
    } catch {
      return false;
    }
  }

  /**
   * Gets token expiration time in seconds
   */
  getTokenExpiration(token: string): number | null {
    try {
      const decoded = this.decodeTokenWithoutVerification(token);
      return decoded ? decoded.exp : null;
    } catch {
      return null;
    }
  }

  /**
   * Creates a secure access token with proper claims
   */
  createAccessToken(user: User): string {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tokenType: 'access',
      iat: Math.floor(Date.now() / 1000),
    };

    return this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('auth.jwtExpiresIn', '1h'),
    });
  }

  /**
   * Creates a secure refresh token with proper claims
   */
  createRefreshToken(user: User): string {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tokenType: 'refresh',
      iat: Math.floor(Date.now() / 1000),
    };

    return this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('auth.refreshTokenExpiresIn', '7d'),
    });
  }

  /**
   * Validates that user exists and is accessible
   */
  private async validateUser(userId: string): Promise<User | null> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
        select: ['id', 'email', 'firstName', 'lastName', 'role', 'status', 'emailVerified'],
      });

      return user;
    } catch (error) {
      this.logger.error(`Error validando usuario ${userId}:`, error);
      return null;
    }
  }

  /**
   * Decodes token without verification (for expiration checks)
   */
  private decodeTokenWithoutVerification(token: string): DecodedToken | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }

      const payload = parts[1];
      const decoded = Buffer.from(payload, 'base64url').toString('utf8');
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  }

  /**
   * Logs token validation events for security monitoring
   */
  private logTokenEvent(
    event: string,
    userId?: string,
    details?: TokenValidationEventDetails
  ): void {
    this.logger.log({
      event,
      userId,
      timestamp: new Date().toISOString(),
      ...details,
    });
  }
}
