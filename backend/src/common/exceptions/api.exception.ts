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

  static tooManyRequests(message: string = 'Demasiadas solicitudes. Por favor, intente más tarde.', errorCode = 'TOO_MANY_REQUESTS', details?: any) {
    return new ApiException(message, HttpStatus.TOO_MANY_REQUESTS, errorCode, details);
  }

  static duplicateRequest(message: string = 'Solicitud duplicada detectada. Por favor, espere antes de volver a intentar.', errorCode = 'DUPLICATE_REQUEST') {
    return new ApiException(message, HttpStatus.TOO_MANY_REQUESTS, errorCode);
  }

  static unprocessableEntity(message: string, errorCode = 'UNPROCESSABLE_ENTITY', details?: any) {
    return new ApiException(message, HttpStatus.UNPROCESSABLE_ENTITY, errorCode, details);
  }

  static gone(message: string = 'El recurso ya no está disponible', errorCode = 'GONE') {
    return new ApiException(message, HttpStatus.GONE, errorCode);
  }

  static preconditionFailed(message: string = 'No se cumplieron las condiciones previas', errorCode = 'PRECONDITION_FAILED', details?: any) {
    return new ApiException(message, HttpStatus.PRECONDITION_FAILED, errorCode, details);
  }

  static payloadTooLarge(message: string = 'El tamaño de la solicitud excede el límite permitido', errorCode = 'PAYLOAD_TOO_LARGE') {
    return new ApiException(message, HttpStatus.PAYLOAD_TOO_LARGE, errorCode);
  }

  static methodNotAllowed(message: string = 'Método HTTP no permitido para este endpoint', errorCode = 'METHOD_NOT_ALLOWED') {
    return new ApiException(message, HttpStatus.METHOD_NOT_ALLOWED, errorCode);
  }

  static requestTimeout(message: string = 'La solicitud ha excedido el tiempo de espera', errorCode = 'REQUEST_TIMEOUT') {
    return new ApiException(message, HttpStatus.REQUEST_TIMEOUT, errorCode);
  }

  static notAcceptable(message: string = 'El servidor no puede generar una respuesta aceptable', errorCode = 'NOT_ACCEPTABLE') {
    return new ApiException(message, HttpStatus.NOT_ACCEPTABLE, errorCode);
  }

  static insufficientStorage(message: string = 'Almacenamiento insuficiente', errorCode = 'INSUFFICIENT_STORAGE') {
    return new ApiException(message, HttpStatus.INSUFFICIENT_STORAGE, errorCode);
  }
}
