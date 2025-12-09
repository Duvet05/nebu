import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserStatus } from '../../users/entities/user.entity';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { AuthResponseDto, AuthUserDto } from '../dto/auth-response.dto';
import { EmailService } from '../../email/services/email.service';
import { OAuthProviderData } from '../../common/types/common.types';
import { SocialLoginDto } from '../dto/social-login.dto';
import { TokenValidationService } from './token-validation.service';

interface OAuthVerificationResult {
  email: string;
  name: string;
  picture?: string;
  emailVerified?: boolean;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private emailService: EmailService,
    private configService: ConfigService,
    private tokenValidationService: TokenValidationService
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, password, firstName, lastName, username, preferredLanguage } = registerDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: [{ email }, ...(username ? [{ username }] : [])],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw new ConflictException('Ya existe un usuario con este email');
      }
      if (existingUser.username === username) {
        throw new ConflictException('Ya existe un usuario con este nombre de usuario');
      }
    }

    // Hash password
    const saltRounds = this.configService.get<number>('auth.bcryptRounds');
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Generate email verification token
    const emailVerificationToken = this.generateVerificationToken();

    // Generate username if not provided
    const generatedUsername = username || this.generateUsername(email, firstName, lastName);

    // Create user
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      username: generatedUsername,
      preferredLanguage: preferredLanguage || 'es',
      emailVerificationToken,
      status: this.isEmailVerificationRequired() ? UserStatus.PENDING : UserStatus.ACTIVE,
      emailVerified: !this.isEmailVerificationRequired(), // Solo verificar automáticamente en desarrollo
    });

    const savedUser = await this.userRepository.save(user);

    // Send verification email only if required
    if (this.isEmailVerificationRequired()) {
      try {
        await this.emailService.sendVerificationEmail(savedUser.email, emailVerificationToken);
      } catch (error) {
        // Log error but don't fail registration if email fails
        this.logger.warn(`Failed to send verification email to ${savedUser.email}: ${error.message}`);
        // If email fails, auto-verify the user to allow them to continue
        savedUser.emailVerified = true;
        savedUser.status = UserStatus.ACTIVE;
        await this.userRepository.save(savedUser);
      }
    }

    // Generate tokens
    const tokens = await this.generateTokens(savedUser);

    return {
      ...tokens,
      user: this.mapToAuthUser(savedUser),
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    // Determine if input is email or username
    const isEmail = email.includes('@');
    
    // Find user by email or username with all necessary relations
    const user = await this.userRepository.findOne({
      where: isEmail ? { email } : { username: email },
      relations: ['person', 'person.names'],
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Check if account is active
    if (user.status === UserStatus.SUSPENDED) {
      throw new UnauthorizedException('Cuenta suspendida. Contacta al soporte.');
    }

    if (user.status === UserStatus.DELETED) {
      throw new UnauthorizedException('Cuenta eliminada');
    }

    // Update last login
    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      ...tokens,
      user: this.mapToAuthUser(user),
    };
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: { emailVerificationToken: token },
    });

    if (!user) {
      throw new BadRequestException('Token de verificación inválido o expirado');
    }

    // Update user status
    user.emailVerified = true;
    user.emailVerificationToken = null;
    user.status = UserStatus.ACTIVE;

    await this.userRepository.save(user);

    return { message: 'Email verificado exitosamente' };
  }

  async resendVerificationEmail(email: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (user.emailVerified) {
      throw new BadRequestException('El email ya está verificado');
    }

    // Generate new verification token
    const emailVerificationToken = this.generateVerificationToken();
    user.emailVerificationToken = emailVerificationToken;

    await this.userRepository.save(user);
    await this.emailService.sendVerificationEmail(user.email, emailVerificationToken);

    return { message: 'Email de verificación enviado' };
  }

  async requestPasswordReset(email: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists or not
      return {
        message: 'Si el email existe, recibirás instrucciones para restablecer tu contraseña',
      };
    }

    // Generate password reset token
    const resetToken = this.generateVerificationToken();
    const resetExpires = new Date();
    resetExpires.setHours(resetExpires.getHours() + 1); // 1 hour expiry

    user.passwordResetToken = resetToken;
    user.passwordResetExpires = resetExpires;

    await this.userRepository.save(user);
    await this.emailService.sendPasswordResetEmail(user.email, resetToken);

    return {
      message: 'Si el email existe, recibirás instrucciones para restablecer tu contraseña',
    };
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: {
        passwordResetToken: token,
      },
    });

    if (!user || !user.passwordResetExpires || user.passwordResetExpires < new Date()) {
      throw new BadRequestException('Token de restablecimiento inválido o expirado');
    }

    // Hash new password
    const saltRounds = this.configService.get<number>('auth.bcryptRounds');
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update user
    user.password = hashedPassword;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;

    await this.userRepository.save(user);

    return { message: 'Contraseña restablecida exitosamente' };
  }

  async refreshToken(refreshToken: string): Promise<AuthResponseDto> {
    try {
      // Use enhanced token validation service
      const tokenValidationService = new (
        await import('./token-validation.service')
      ).TokenValidationService(this.jwtService, this.userRepository, this.configService);

      const validationResult = await tokenValidationService.validateRefreshToken(refreshToken);

      if (!validationResult.isValid) {
        if (validationResult.isExpired) {
          throw new UnauthorizedException('Token de actualización expirado');
        }
        throw new UnauthorizedException(
          validationResult.error || 'Token de actualización inválido'
        );
      }

      if (!validationResult.user) {
        throw new UnauthorizedException('Usuario no encontrado');
      }

      const tokens = await this.generateTokens(validationResult.user);

      return {
        ...tokens,
        user: this.mapToAuthUser(validationResult.user),
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Error procesando token de actualización');
    }
  }

  async validateUser(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['person', 'person.names'],
    });

    if (!user || user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Usuario no válido');
    }

    return user;
  }

  private async generateTokens(user: User): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }> {
    // Emitir tokens con tipo y secretos adecuados
    const accessToken = this.tokenValidationService.createAccessToken(user);
    const refreshToken = this.tokenValidationService.createRefreshToken(user);

    return {
      accessToken,
      refreshToken,
      expiresIn: this.getAccessTokenExpirySeconds(),
    };
  }

  private getAccessTokenExpirySeconds(): number {
    const exp = this.configService.get<string>('auth.jwtExpiresIn', '24h');
    // Soportar formatos como "60", "15m", "24h"
    const match = /^\s*(\d+)\s*([smhd])?\s*$/i.exec(exp);
    if (!match) return 24 * 60 * 60;
    const value = parseInt(match[1], 10);
    const unit = (match[2] || 's').toLowerCase();
    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 60 * 60;
      case 'd':
        return value * 24 * 60 * 60;
      default:
        return 24 * 60 * 60;
    }
  }

  private generateVerificationToken(): string {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15) +
      Date.now().toString(36)
    );
  }

  private mapToAuthUser(user: User): AuthUserDto {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      avatar: user.avatar,
      role: user.role,
      status: user.status,
      emailVerified: user.emailVerified,
      preferredLanguage: user.preferredLanguage,
      createdAt: user.createdAt,
      fullName: user.fullName,
    };
  }

  async handleOAuthUser(oauthData: OAuthProviderData): Promise<User> {
    const { provider, providerId, email, name, avatar } = oauthData;

    // Buscar usuario existente por email o por proveedor OAuth
    let user = await this.userRepository.findOne({
      where: [{ email }, { oauthProvider: provider, oauthId: providerId }],
    });

    if (user) {
      // Actualizar información OAuth si no existe
      if (!user.oauthProvider || !user.oauthId) {
        user.oauthProvider = provider;
        user.oauthId = providerId;
        user.emailVerified = true; // OAuth providers ya verifican el email

        if (avatar && !user.avatar) {
          user.avatar = avatar;
        }

        user = await this.userRepository.save(user);
      }

      // Actualizar último login
      user.lastLoginAt = new Date();
      await this.userRepository.save(user);

      return user;
    }

    // Crear nuevo usuario con OAuth
    const [firstName, ...lastNameParts] = name.split(' ');
    const lastName = lastNameParts.join(' ') || '';

    const newUser = this.userRepository.create({
      email,
      firstName,
      lastName,
      username: email.split('@')[0] + '_' + Date.now(), // Username único basado en email
      oauthProvider: provider,
      oauthId: providerId,
      avatar,
      emailVerified: true, // OAuth providers ya verifican el email
      status: UserStatus.ACTIVE,
      lastLoginAt: new Date(),
    });

    return await this.userRepository.save(newUser);
  }

  private generateUsername(email: string, firstName: string, lastName: string): string {
    // Generate username from email prefix + first letter of names
    const emailPrefix = email.split('@')[0];
    const firstInitial = firstName.charAt(0).toLowerCase();
    const lastInitial = lastName.charAt(0).toLowerCase();
    const timestamp = Date.now().toString().slice(-4); // Last 4 digits of timestamp

    return `${emailPrefix}_${firstInitial}${lastInitial}${timestamp}`;
  }

  private isEmailVerificationRequired(): boolean {
    // Check if email verification is explicitly enabled/disabled
    const emailVerificationEnabled = this.configService.get<string>('REQUIRE_EMAIL_VERIFICATION');
    
    // If explicitly set, use that value
    if (emailVerificationEnabled !== undefined) {
      return emailVerificationEnabled === 'true';
    }
    
    // Otherwise, check environment (disabled by default for easier development)
    const nodeEnv = this.configService.get<string>('NODE_ENV');
    return nodeEnv === 'production';
  }

  // Social Authentication Methods
  async socialLogin(socialLoginDto: SocialLoginDto): Promise<AuthResponseDto> {
    const { token, provider } = socialLoginDto;

    try {
      // Verificar token con el proveedor y obtener datos confiables (incluyendo providerId)
      const verification = await this.verifySocialToken(token, provider);

      if (!verification || !verification.email) {
        throw new UnauthorizedException('Invalid social token');
      }

      // Check if user exists
      let user = await this.userRepository.findOne({
        where: [
          { email: verification.email },
          { oauthProvider: provider, oauthId: verification.providerId },
        ],
      });

      if (!user) {
        // Create new user
        user = await this.createSocialUser(
          verification.email,
          verification.name,
          verification.picture,
          provider,
          verification.providerId
        );
      } else {
        // Update last login
        user.lastLoginAt = new Date();
        await this.userRepository.save(user);
      }

      // Generate tokens
      const tokens = await this.generateTokens(user);

      return {
        user: this.mapToAuthUser(user),
        ...tokens,
      };
    } catch (error) {
      this.logger.error(`Social login error: ${error.message}`, error.stack);
      throw new UnauthorizedException('Social login failed');
    }
  }

  async googleLogin(googleToken: string): Promise<AuthResponseDto> {
    // In production, verify token with Google API
    const userInfo = await this.verifyGoogleToken(googleToken);
    
    return this.socialLogin({
      token: googleToken,
      provider: 'google',
      email: userInfo.email,
      name: userInfo.name,
      avatar: userInfo.picture,
    });
  }

  async facebookLogin(facebookToken: string): Promise<AuthResponseDto> {
    // In production, verify token with Facebook API
    const userInfo = await this.verifyFacebookToken(facebookToken);
    
    return this.socialLogin({
      token: facebookToken,
      provider: 'facebook',
      email: userInfo.email,
      name: userInfo.name,
      avatar: userInfo.picture,
    });
  }

  async appleLogin(appleToken: string): Promise<AuthResponseDto> {
    // In production, verify token with Apple API
    const userInfo = await this.verifyAppleToken(appleToken);
    
    return this.socialLogin({
      token: appleToken,
      provider: 'apple',
      email: userInfo.email,
      name: userInfo.name || userInfo.email.split('@')[0],
      avatar: undefined,
    });
  }

  private async verifySocialToken(
    token: string,
    provider: string
  ): Promise<(OAuthVerificationResult & { providerId?: string }) | null> {
    try {
      switch (provider) {
        case 'google':
          return await this.verifyGoogleToken(token);
        case 'facebook':
          return await this.verifyFacebookToken(token);
        case 'apple':
          return await this.verifyAppleToken(token);
        default:
          return null;
      }
    } catch {
      return null;
    }
  }

  private async verifyGoogleToken(token: string): Promise<OAuthVerificationResult & { providerId?: string }> {
    // Verify token with Google's tokeninfo API
    // https://developers.google.com/identity/sign-in/web/backend-auth
    try {
      const response = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${token}`
      );

      if (!response.ok) {
        throw new UnauthorizedException('Invalid Google token');
      }

  const data = await response.json();

      // Verify the token audience matches your client ID
      const googleClientId = this.configService.get<string>('auth.googleClientId');
      if (googleClientId && data.aud !== googleClientId) {
        throw new UnauthorizedException('Google token audience mismatch');
      }

      return {
        email: data.email,
        name: data.name,
        picture: data.picture,
        emailVerified: data.email_verified,
        providerId: data.sub,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Google token verification failed: ${message}`);
      throw new UnauthorizedException(`Google token verification failed: ${message}`);
    }
  }

  private async verifyFacebookToken(token: string): Promise<OAuthVerificationResult & { providerId?: string }> {
    // Verify token with Facebook's Graph API
    // https://developers.facebook.com/docs/facebook-login/guides/advanced/confirm
    try {
      const appId = this.configService.get<string>('auth.facebookAppId');
      const appSecret = this.configService.get<string>('auth.facebookAppSecret');

      // First, verify the token with Facebook
      const debugResponse = await fetch(
        `https://graph.facebook.com/debug_token?input_token=${token}&access_token=${appId}|${appSecret}`
      );

      if (!debugResponse.ok) {
        throw new UnauthorizedException('Invalid Facebook token');
      }

      const debugData = await debugResponse.json();

      if (!debugData.data || !debugData.data.is_valid) {
        throw new UnauthorizedException('Facebook token is not valid');
      }

      if (debugData.data.app_id !== appId) {
        throw new UnauthorizedException('Facebook token app ID mismatch');
      }

      // Get user info
      const userResponse = await fetch(
        `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${token}`
      );

      if (!userResponse.ok) {
        throw new UnauthorizedException('Failed to get Facebook user info');
      }

  const userData = await userResponse.json();

      return {
        email: userData.email,
        name: userData.name,
        picture: userData.picture?.data?.url,
        providerId: userData.id,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Facebook token verification failed: ${message}`);
      throw new UnauthorizedException(`Facebook token verification failed: ${message}`);
    }
  }

  private async verifyAppleToken(token: string): Promise<OAuthVerificationResult & { providerId?: string }> {
    // Verify Apple's identity token
    // https://developer.apple.com/documentation/sign_in_with_apple/sign_in_with_apple_rest_api/verifying_a_user
    try {
      // Apple uses JWT tokens that need to be verified
  const decoded = this.jwtService.decode(token) as any;

      if (!decoded) {
        throw new UnauthorizedException('Invalid Apple token');
      }

      // Verify token issuer
      if (decoded.iss !== 'https://appleid.apple.com') {
        throw new UnauthorizedException('Invalid Apple token issuer');
      }

      // Verify audience matches your app's client ID
      const appleClientId = this.configService.get<string>('auth.appleClientId');
      if (appleClientId && decoded.aud !== appleClientId) {
        throw new UnauthorizedException('Apple token audience mismatch');
      }

      // Verify token expiration
      const now = Math.floor(Date.now() / 1000);
      if (decoded.exp && decoded.exp < now) {
        throw new UnauthorizedException('Apple token has expired');
      }

      // TODO: In production, also verify the token signature using Apple's public keys
      // Fetch from: https://appleid.apple.com/auth/keys

      return {
        email: decoded.email,
        name: decoded.email?.split('@')[0] || 'Apple User',
        emailVerified: decoded.email_verified === 'true',
        providerId: decoded.sub,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Apple token verification failed: ${message}`);
      throw new UnauthorizedException(`Apple token verification failed: ${message}`);
    }
  }

  private async createSocialUser(
    email: string,
    name: string,
    avatar: string | undefined,
    provider: string,
    oauthId: string,
  ): Promise<User> {
    const [firstName, ...lastNameParts] = name.split(' ');
    const lastName = lastNameParts.join(' ') || '';

    const newUser = this.userRepository.create({
      email,
      firstName,
      lastName,
      username: this.generateUsername(email, firstName, lastName),
      oauthProvider: provider,
      oauthId,
      avatar,
      emailVerified: true,
      status: UserStatus.ACTIVE,
      lastLoginAt: new Date(),
    });

    return await this.userRepository.save(newUser);
  }
}
