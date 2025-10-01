import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiResponseDto } from '../dto/api-response.dto';
import { ApiException } from '../exceptions/api.exception';

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApiExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: HttpStatus;
    let message: string;
    let errorCode: string;
    let details: any;

    if (exception instanceof ApiException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse() as ApiResponseDto;
      message = exceptionResponse.error || 'Error desconocido';
      errorCode = exceptionResponse.errorCode || 'UNKNOWN_ERROR';
      details = exception.details;
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        message = (exceptionResponse as any).message || 'Error HTTP';
        errorCode = (exceptionResponse as any).errorCode || 'HTTP_ERROR';
        details = (exceptionResponse as any).details;
      } else {
        message = 'Error HTTP';
      }
      errorCode = errorCode || 'HTTP_ERROR';
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Error interno del servidor';
      errorCode = 'INTERNAL_ERROR';
    }

    // Log the error
    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${message}`,
      exception instanceof Error ? exception.stack : 'Unknown error',
    );

    // Create error response
    const errorResponse = ApiResponseDto.error(message, errorCode);
    if (details) {
      (errorResponse as any).details = details;
    }

    // Add request metadata
    errorResponse.meta = {
      timestamp: new Date().toISOString(),
      requestId: request.headers['x-request-id'] as string,
      path: request.url,
      method: request.method,
    };

    response.status(status).json(errorResponse);
  }
}
