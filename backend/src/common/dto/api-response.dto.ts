import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseDto<T = any> {
  @ApiProperty({ description: 'Indica si la operación fue exitosa' })
  success: boolean;

  @ApiProperty({ description: 'Datos de la respuesta' })
  data?: T;

  @ApiProperty({ description: 'Mensaje de éxito o información adicional', required: false })
  message?: string;

  @ApiProperty({ description: 'Mensaje de error', required: false })
  error?: string;

  @ApiProperty({ description: 'Código de error específico', required: false })
  errorCode?: string;

  @ApiProperty({ description: 'Metadatos adicionales', required: false })
  meta?: {
    timestamp: string;
    requestId?: string;
    path?: string;
    method?: string;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };

  constructor(partial: Partial<ApiResponseDto<T>>) {
    Object.assign(this, partial);
    this.meta = {
      timestamp: new Date().toISOString(),
      ...this.meta,
    };
  }

  static success<T>(data: T, message?: string): ApiResponseDto<T> {
    return new ApiResponseDto({
      success: true,
      data,
      message,
    });
  }

  static error(error: string, errorCode?: string): ApiResponseDto {
    return new ApiResponseDto({
      success: false,
      error,
      errorCode,
    });
  }

  static paginated<T>(
    data: T[],
    page: number,
    limit: number,
    total: number,
    message?: string
  ): ApiResponseDto<T[]> {
    return new ApiResponseDto({
      success: true,
      data,
      message,
      meta: {
        timestamp: new Date().toISOString(),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  }
}
