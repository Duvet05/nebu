import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

import { AuthService } from '../services/auth.service';
import { Public } from '../decorators/public.decorator';

@ApiTags('NextAuth Integration')
@Controller('nextauth')
export class NextAuthController {
  private readonly logger = new Logger(NextAuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('signin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Autenticación para NextAuth.js' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string' },
        password: { type: 'string' },
      },
      required: ['email', 'password'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Autenticación exitosa',
    schema: {
      type: 'object',
      properties: {
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
    description: 'Credenciales inválidas',
  })
  async signIn(@Body() credentials: { email: string; password: string }) {
    try {
      const result = await this.authService.login({
        email: credentials.email,
        password: credentials.password,
      });

      return {
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.firstName + ' ' + result.user.lastName,
          avatar: result.user.avatar,
          role: result.user.role,
        },
      };
    } catch {
      throw new UnauthorizedException('Credenciales inválidas');
    }
  }

  @Public()
  @Post('signup')
  @ApiOperation({ summary: 'Registro para NextAuth.js' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string' },
        password: { type: 'string' },
        firstName: { type: 'string' },
        lastName: { type: 'string' },
      },
      required: ['email', 'password', 'firstName', 'lastName'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Usuario registrado exitosamente',
  })
  async signUp(
    @Body() userData: { email: string; password: string; firstName: string; lastName: string }
  ) {
    const result = await this.authService.register({
      email: userData.email,
      password: userData.password,
      firstName: userData.firstName,
      lastName: userData.lastName,
    });

    return {
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.firstName + ' ' + result.user.lastName,
        avatar: result.user.avatar,
        role: result.user.role,
      },
    };
  }

  @Public()
  @Post('oauth')
  @ApiOperation({ summary: 'Autenticación OAuth para GitHub/Google' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        provider: { type: 'string', enum: ['github', 'google'] },
        providerId: { type: 'string' },
        email: { type: 'string' },
        name: { type: 'string' },
        avatar: { type: 'string' },
        profile: { type: 'object' },
      },
      required: ['provider', 'providerId', 'email', 'name'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Usuario OAuth autenticado/creado exitosamente',
  })
  async oauthSignIn(
    @Body()
    oauthData: {
      provider: string;
      providerId: string;
      email: string;
      name: string;
      avatar?: string;
      profile?: any;
    }
  ) {
    try {
      const result = await this.authService.handleOAuthUser(oauthData);

      return {
        user: {
          id: result.id,
          email: result.email,
          name: result.fullName || result.username,
          avatar: result.avatar,
          role: result.isAdmin ? 'admin' : result.isInstructor ? 'instructor' : 'student',
        },
      };
    } catch (error) {
      this.logger.error('OAuth authentication error:', error);
      throw new UnauthorizedException(
        `Error en autenticación OAuth: ${error.message || 'Error desconocido'}`
      );
    }
  }

  @Public()
  @Get('session')
  @ApiOperation({ summary: 'Obtener sesión actual para NextAuth.js' })
  @ApiResponse({
    status: 200,
    description: 'Información de sesión',
  })
  async getSession() {
    // This endpoint will be handled by NextAuth.js middleware
    // Just return basic structure for documentation
    return {
      user: null,
      expires: null,
    };
  }
}
