export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export class PaginatedResponseDto<T> {
  data: T[];
  meta: PaginationMeta;

  constructor(data: T[], totalItems: number, page: number, limit: number) {
    this.data = data;
    this.meta = {
      page,
      limit,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      hasNextPage: page < Math.ceil(totalItems / limit),
      hasPreviousPage: page > 1,
    };
  }
}
