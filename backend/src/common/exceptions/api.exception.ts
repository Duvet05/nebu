import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponseDto } from '../dto/api-response.dto';

export class ApiException extends HttpException {
  public readonly errorCode: string;
  public readonly details?: any;

  constructor(
    message: string,
    status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
    errorCode?: string,
    details?: any,
  ) {
    const response = ApiResponseDto.error(message, errorCode);
    super(response, status);
    this.errorCode = errorCode || 'UNKNOWN_ERROR';
    this.details = details;
  }

  static badRequest(message: string, errorCode = 'BAD_REQUEST', details?: any) {
    return new ApiException(message, HttpStatus.BAD_REQUEST, errorCode, details);
  }

  static unauthorized(message: string = 'No autorizado', errorCode = 'UNAUTHORIZED') {
    return new ApiException(message, HttpStatus.UNAUTHORIZED, errorCode);
  }

  static forbidden(message: string = 'Acceso denegado', errorCode = 'FORBIDDEN') {
    return new ApiException(message, HttpStatus.FORBIDDEN, errorCode);
  }

  static notFound(message: string = 'Recurso no encontrado', errorCode = 'NOT_FOUND') {
    return new ApiException(message, HttpStatus.NOT_FOUND, errorCode);
  }

  static conflict(message: string, errorCode = 'CONFLICT', details?: any) {
    return new ApiException(message, HttpStatus.CONFLICT, errorCode, details);
  }

  static validationError(message: string, details?: any) {
    return new ApiException(message, HttpStatus.BAD_REQUEST, 'VALIDATION_ERROR', details);
  }

  static internalError(message: string = 'Error interno del servidor', errorCode = 'INTERNAL_ERROR') {
    return new ApiException(message, HttpStatus.INTERNAL_SERVER_ERROR, errorCode);
  }

  static serviceUnavailable(message: string = 'Servicio no disponible', errorCode = 'SERVICE_UNAVAILABLE') {
    return new ApiException(message, HttpStatus.SERVICE_UNAVAILABLE, errorCode);
  }
}
