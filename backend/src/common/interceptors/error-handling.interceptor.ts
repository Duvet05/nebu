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

        // Handle database errors (PostgreSQL)
        if (error.code) {
          const constraintName = error.constraint || '';
          const detail = error.detail || '';

          switch (error.code) {
            case '23505': { // Unique constraint violation
              const field = this.extractFieldFromConstraint(constraintName, detail);
              return throwError(
                () => new HttpException(
                  field
                    ? `El ${field} ya está en uso. Por favor, utilice otro valor.`
                    : 'El recurso ya existe. Por favor, verifique los datos ingresados.',
                  HttpStatus.CONFLICT
                )
              );
            }

            case '23503': // Foreign key constraint violation
              return throwError(
                () => new HttpException(
                  'No se puede completar la operación porque hay registros relacionados que dependen de este recurso.',
                  HttpStatus.CONFLICT
                )
              );

            case '23502': { // Not null constraint violation
              const missingField = this.extractFieldFromError(error);
              return throwError(
                () => new HttpException(
                  missingField
                    ? `El campo '${missingField}' es obligatorio.`
                    : 'Faltan campos obligatorios. Por favor, complete todos los campos requeridos.',
                  HttpStatus.BAD_REQUEST
                )
              );
            }

            case '23514': // Check constraint violation
              return throwError(
                () => new HttpException(
                  'Los datos no cumplen con las restricciones de validación del sistema.',
                  HttpStatus.BAD_REQUEST
                )
              );

            case '22001': // String data right truncation
              return throwError(
                () => new HttpException(
                  'Uno o más campos exceden la longitud máxima permitida.',
                  HttpStatus.BAD_REQUEST
                )
              );

            case '22P02': // Invalid text representation
              return throwError(
                () => new HttpException(
                  'El formato de los datos es inválido. Verifique que los tipos de datos sean correctos.',
                  HttpStatus.BAD_REQUEST
                )
              );

            case '42P01': // Undefined table
              this.logger.error(`Database table not found: ${error.message}`);
              return throwError(
                () => new HttpException(
                  'Error de configuración de la base de datos.',
                  HttpStatus.INTERNAL_SERVER_ERROR
                )
              );

            case '08006': // Connection failure
            case '08001': // Unable to connect
              this.logger.error(`Database connection error: ${error.message}`);
              return throwError(
                () => new HttpException(
                  'Error de conexión con la base de datos. Por favor, intente nuevamente.',
                  HttpStatus.SERVICE_UNAVAILABLE
                )
              );

            case '57014': // Query canceled
              return throwError(
                () => new HttpException(
                  'La operación fue cancelada debido al tiempo de espera. Por favor, intente con filtros más específicos.',
                  HttpStatus.REQUEST_TIMEOUT
                )
              );

            default:
              this.logger.error(`Unhandled database error code ${error.code}: ${error.message}`);
              return throwError(
                () => new HttpException(
                  'Error al procesar la solicitud en la base de datos.',
                  HttpStatus.INTERNAL_SERVER_ERROR
                )
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
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'apiKey', 'secretKey', 'privateKey'];
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  /**
   * Extract field name from PostgreSQL constraint name or detail message
   */
  private extractFieldFromConstraint(constraintName: string, detail: string): string | null {
    // Try to extract from detail message like: "Key (email)=(user@example.com) already exists."
    const detailMatch = detail.match(/Key \(([^)]+)\)/);
    if (detailMatch) {
      return this.translateFieldName(detailMatch[1]);
    }

    // Try to extract from constraint name like: "users_email_key"
    const constraintMatch = constraintName.match(/_([^_]+)_(?:key|unique|idx)$/);
    if (constraintMatch) {
      return this.translateFieldName(constraintMatch[1]);
    }

    return null;
  }

  /**
   * Extract field name from generic database error
   */
  private extractFieldFromError(error: any): string | null {
    const message = error.message || '';

    // Try to extract column name from error message
    const columnMatch = message.match(/column "([^"]+)"/);
    if (columnMatch) {
      return this.translateFieldName(columnMatch[1]);
    }

    return null;
  }

  /**
   * Translate database field names to user-friendly Spanish names
   */
  private translateFieldName(field: string): string {
    const translations: Record<string, string> = {
      'email': 'correo electrónico',
      'username': 'nombre de usuario',
      'phone': 'teléfono',
      'dni': 'DNI',
      'ruc': 'RUC',
      'name': 'nombre',
      'firstName': 'nombre',
      'first_name': 'nombre',
      'lastName': 'apellido',
      'last_name': 'apellido',
      'password': 'contraseña',
      'title': 'título',
      'slug': 'identificador',
      'sku': 'código de producto',
      'serial': 'número de serie',
      'serial_number': 'número de serie',
    };

    return translations[field] || field;
  }
}
