import { NestFactory, Reflector } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ClassSerializerInterceptor, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { ErrorHandlingInterceptor } from './common/interceptors/error-handling.interceptor';
import { QueryOptimizationInterceptor } from './common/interceptors/query-optimization.interceptor';
import { PaginationInterceptor } from './common/interceptors/pagination.interceptor';
import { ValidationSanitizationPipe } from './common/pipes/validation-sanitization.pipe';
import { getCorsOrigins } from './config/cors.config';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const logger = new Logger('Bootstrap');

  const iotMode = process.env.IOT_ALLOW_ALL_ORIGINS === 'true';

  app.enableCors({
    origin: getCorsOrigins(),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'User-Agent'
    ],
    credentials: !iotMode,
    optionsSuccessStatus: 200,
  });

  // Security headers via Helmet (CSP gestionada en Traefik)
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
      crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
      hsts: false, // Deshabilitar HSTS para permitir HTTP en dispositivos IoT
      xPoweredBy: false as any,
    })
  );

  // Log CORS configuration in development
  if (process.env.NODE_ENV !== 'production') {
    logger.log('CORS Configuration:');
    logger.log(`NODE_ENV: ${process.env.NODE_ENV}`);
    logger.log(`FRONTEND_URL: ${process.env.FRONTEND_URL}`);
    logger.log(`DOMAIN: ${process.env.DOMAIN}`);
  }

  // Global validation pipe with sanitization
  app.useGlobalPipes(new ValidationSanitizationPipe());

  // Global interceptors
  const reflector = app.get(Reflector);
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(reflector),
    new PaginationInterceptor(reflector),
    new ErrorHandlingInterceptor(),
    new QueryOptimizationInterceptor()
  );

  // API prefix
  app.setGlobalPrefix('api/v1');

  // Swagger documentation
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Nebu Mobile API')
      .setDescription('API completa para Nebu Mobile - IoT y Voice Agent Platform')
      .setVersion('1.0')
      .addTag('auth', 'Autenticación y autorización')
      .addTag('users', 'Gestión de usuarios')
      .addTag('iot', 'Gestión de dispositivos IoT')
      .addTag('voice', 'Agente de voz y audio')
      .addTag('livekit', 'Comunicación tiempo real')
      .addTag('ai', 'Servicios de inteligencia artificial')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  // Configurar archivos estáticos para uploads
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
    maxAge: '1d',
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);

  logger.log('🚀 Nebu Mobile Backend iniciado!');
  logger.log(`📚 API Docs: http://localhost:${port}/api/docs`);
  logger.log(`💚 Health Check: http://localhost:${port}/health`);

  // Run seeders automatically after app initialization
  // Only when using synchronize mode (not migrations)
  const useMigrations = process.env.DB_USE_MIGRATIONS === 'true';
  const autoSeed = process.env.AUTO_SEED === 'true';

  if (autoSeed && !useMigrations) {
    logger.log('🌱 Auto-seeding enabled (synchronize mode), running seeders...');
    try {
      const { execSync } = await import('child_process');
      execSync('npm run seed', { stdio: 'inherit' });
      logger.log('✅ Seeders completed successfully');
    } catch (error) {
      logger.warn('⚠️  Seeders failed (data may already exist). See:', error);
    }
  } else if (useMigrations) {
    logger.log('ℹ️  Using migrations mode - seeders skipped (run manually if needed)');
  }
}

bootstrap();
