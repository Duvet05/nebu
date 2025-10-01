import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorHandlingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ErrorHandlingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError(error => {
        const request = context.switchToHttp().getRequest();
        const { method, url, body, user } = request;

        // Log error with context
        this.logger.error(`Error in ${method} ${url}: ${error.message}`, {
          error: error.message,
          stack: error.stack,
          userId: user?.id,
          body: this.sanitizeBody(body),
          timestamp: new Date().toISOString(),
        });

        // Handle different error types
        if (error instanceof HttpException) {
          return throwError(() => error);
        }

        // Handle database errors
        if (error.code) {
          switch (error.code) {
            case '23505': // Unique constraint violation
              return throwError(
                () => new HttpException('El recurso ya existe', HttpStatus.CONFLICT)
              );
            case '23503': // Foreign key constraint violation
              return throwError(
                () =>
                  new HttpException(
                    'No se puede eliminar el recurso porque está siendo utilizado',
                    HttpStatus.CONFLICT
                  )
              );
            case '23502': // Not null constraint violation
              return throwError(
                () => new HttpException('Faltan campos requeridos', HttpStatus.BAD_REQUEST)
              );
            default:
              return throwError(
                () =>
                  new HttpException('Error interno del servidor', HttpStatus.INTERNAL_SERVER_ERROR)
              );
          }
        }

        // Handle validation errors
        if (error.name === 'ValidationError') {
          return throwError(
            () => new HttpException('Datos de entrada inválidos', HttpStatus.BAD_REQUEST)
          );
        }

        // Default error
        return throwError(
          () => new HttpException('Error interno del servidor', HttpStatus.INTERNAL_SERVER_ERROR)
        );
      })
    );
  }

  private sanitizeBody(body: any): any {
    if (!body) return body;

    const sanitized = { ...body };

    // Remove sensitive fields
    const sensitiveFields = ['password', 'token', 'secret', 'key'];
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });

    return sanitized;
  }
}
