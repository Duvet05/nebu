import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

import { AuthService } from '../services/auth.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { AuthResponseDto, RefreshTokenDto } from '../dto/auth-response.dto';
import { SocialLoginDto } from '../dto/social-login.dto';
import { Public } from '../decorators/public.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { User } from '../../users/entities/user.entity';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Registrar nuevo usuario' })
  @ApiResponse({
    status: 201,
    description: 'Usuario registrado exitosamente',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Usuario ya existe',
  })
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 requests per minute
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiResponse({
    status: 200,
    description: 'Login exitoso',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciales inválidas',
  })
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 requests per minute
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verificar email del usuario' })
  @ApiQuery({ name: 'token', description: 'Token de verificación' })
  @ApiResponse({
    status: 200,
    description: 'Email verificado exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Token inválido o expirado',
  })
  async verifyEmail(@Query('token') token: string): Promise<{ message: string }> {
    return this.authService.verifyEmail(token);
  }

  @Public()
  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reenviar email de verificación' })
  @ApiBody({ schema: { properties: { email: { type: 'string' } } } })
  @ApiResponse({
    status: 200,
    description: 'Email de verificación enviado',
  })
  @Throttle({ default: { limit: 3, ttl: 300000 } }) // 3 requests per 5 minutes
  async resendVerification(@Body('email') email: string): Promise<{ message: string }> {
    return this.authService.resendVerificationEmail(email);
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Solicitar restablecimiento de contraseña' })
  @ApiBody({ schema: { properties: { email: { type: 'string' } } } })
  @ApiResponse({
    status: 200,
    description: 'Email de restablecimiento enviado si el usuario existe',
  })
  @Throttle({ default: { limit: 3, ttl: 300000 } }) // 3 requests per 5 minutes
  async forgotPassword(@Body('email') email: string): Promise<{ message: string }> {
    return this.authService.requestPasswordReset(email);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restablecer contraseña' })
  @ApiBody({
    schema: {
      properties: {
        token: { type: 'string' },
        newPassword: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Contraseña restablecida exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Token inválido o expirado',
  })
  async resetPassword(
    @Body('token') token: string,
    @Body('newPassword') newPassword: string
  ): Promise<{ message: string }> {
    return this.authService.resetPassword(token, newPassword);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refrescar token de acceso' })
  @ApiResponse({
    status: 200,
    description: 'Token refrescado exitosamente',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Token de refresh inválido',
  })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto): Promise<AuthResponseDto> {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener información del usuario actual' })
  @ApiResponse({
    status: 200,
    description: 'Información del usuario',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado',
  })
  async getProfile(@CurrentUser() user: User): Promise<User> {
    return user;
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cerrar sesión' })
  @ApiResponse({
    status: 200,
    description: 'Sesión cerrada exitosamente',
  })
  async logout(): Promise<{ message: string }> {
    // In a real implementation, you might want to blacklist the JWT token
    // For now, we'll just return a success message
    return { message: 'Sesión cerrada exitosamente' };
  }

  @Public()
  @Get('verify')
  @ApiOperation({ summary: 'Verificar autenticación y obtener usuario actual' })
  @ApiResponse({
    status: 200,
    description: 'Usuario autenticado',
    schema: {
      type: 'object',
      properties: {
        authenticated: { type: 'boolean' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            name: { type: 'string' },
            avatar: { type: 'string' },
            role: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Usuario no autenticado',
  })
  async verify(@CurrentUser() user?: User): Promise<{
    authenticated: boolean;
    user?: {
      id: string;
      email: string;
      name: string;
      avatar?: string;
      role: string;
    };
  }> {
    if (!user) {
      return { authenticated: false };
    }

    return {
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.fullName || user.username,
        avatar: user.avatar,
        role: user.isAdmin ? 'admin' : user.isInstructor ? 'instructor' : 'student',
      },
    };
  }

  @Public()
  @Post('google')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Google Sign-In' })
  @ApiResponse({
    status: 200,
    description: 'Google login exitoso',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Token de Google inválido',
  })
  async googleLogin(@Body() body: { token: string }): Promise<AuthResponseDto> {
    return this.authService.googleLogin(body.token);
  }

  @Public()
  @Post('facebook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Facebook Login' })
  @ApiResponse({
    status: 200,
    description: 'Facebook login exitoso',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Token de Facebook inválido',
  })
  async facebookLogin(@Body() body: { token: string }): Promise<AuthResponseDto> {
    return this.authService.facebookLogin(body.token);
  }

  @Public()
  @Post('apple')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Apple Sign-In' })
  @ApiResponse({
    status: 200,
    description: 'Apple login exitoso',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Token de Apple inválido',
  })
  async appleLogin(@Body() body: { token: string }): Promise<AuthResponseDto> {
    return this.authService.appleLogin(body.token);
  }

  @Public()
  @Post('social')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login Social Genérico' })
  @ApiBody({ type: SocialLoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login social exitoso',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciales sociales inválidas',
  })
  async socialLogin(@Body() socialLoginDto: SocialLoginDto): Promise<AuthResponseDto> {
    return this.authService.socialLogin(socialLoginDto);
  }
}
