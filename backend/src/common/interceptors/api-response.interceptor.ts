import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponseDto } from '../dto/api-response.dto';

@Injectable()
export class ApiResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponseDto<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponseDto<T>> {
    return next.handle().pipe(
      map((data) => {
        // If data is already in ApiResponseDto format, return as is
        if (data && typeof data === 'object' && 'success' in data) {
          return data as ApiResponseDto<T>;
        }

        // Transform successful responses
        return ApiResponseDto.success(data, this.getSuccessMessage(context));
      }),
    );
  }

  private getSuccessMessage(context: ExecutionContext): string {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const url = request.url;

    // Customize success messages based on endpoint
    if (url.includes('/auth/login')) {
      return 'Inicio de sesión exitoso';
    }
    if (url.includes('/auth/register')) {
      return 'Usuario registrado exitosamente';
    }
    if (url.includes('/auth/logout')) {
      return 'Sesión cerrada exitosamente';
    }
    if (url.includes('/auth/verify')) {
      return 'Verificación de autenticación completada';
    }
    if (url.includes('/users')) {
      if (method === 'GET') return 'Usuarios obtenidos exitosamente';
      if (method === 'POST') return 'Usuario creado exitosamente';
      if (method === 'PUT' || method === 'PATCH') return 'Usuario actualizado exitosamente';
      if (method === 'DELETE') return 'Usuario eliminado exitosamente';
    }
    if (method === 'GET') {
      return 'Datos obtenidos exitosamente';
    }
    if (method === 'POST') {
      return 'Recurso creado exitosamente';
    }
    if (method === 'PUT' || method === 'PATCH') {
      return 'Recurso actualizado exitosamente';
    }
    if (method === 'DELETE') {
      return 'Recurso eliminado exitosamente';
    }

    return 'Operación exitosa';
  }
}
