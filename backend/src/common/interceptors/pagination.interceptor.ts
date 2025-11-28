import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request } from 'express';
import { PaginationDto } from '../dto/pagination.dto';
import { PaginatedResponseDto } from '../dto/paginated-response.dto';
import { PAGINATE_KEY } from '../decorators/paginate.decorator';

@Injectable()
export class PaginationInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const isPaginated = this.reflector.getAllAndOverride<boolean>(
      PAGINATE_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Si el endpoint no está marcado con @Paginate(), no hacer nada
    if (!isPaginated) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<Request>();

    // Extraer parámetros de paginación de la query string
    const page = parseInt(request.query.page as string) || 1;
    const limit = Math.min(
      parseInt(request.query.limit as string) || 10,
      100, // Máximo 100
    );

    const paginationDto = new PaginationDto();
    paginationDto.page = page;
    paginationDto.limit = limit;

    // Agregar paginationDto al request para que los servicios puedan accederlo
    (request as any).pagination = paginationDto;

    return next.handle().pipe(
      map((data) => {
        // Si el servicio ya retornó un objeto paginado, devolverlo tal cual
        if (data && data.meta && data.data) {
          return data;
        }

        // Si el servicio retornó un array con formato [data, total]
        if (Array.isArray(data) && data.length === 2 && typeof data[1] === 'number') {
          return new PaginatedResponseDto(data[0], data[1], page, limit);
        }

        // Si es un array simple, paginarlo (sin total conocido)
        if (Array.isArray(data)) {
          return new PaginatedResponseDto(data, data.length, page, limit);
        }

        // Si no es array, retornar tal cual
        return data;
      }),
    );
  }
}
