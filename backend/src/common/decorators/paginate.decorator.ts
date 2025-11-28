import { SetMetadata } from '@nestjs/common';

export const PAGINATE_KEY = 'paginate';

/**
 * Decorator to mark endpoints as paginable
 * When applied, the PaginationInterceptor will automatically handle pagination
 *
 * @example
 * @Get()
 * @Paginate()
 * findAll() {
 *   return this.service.findAll();
 * }
 */
export const Paginate = () => SetMetadata(PAGINATE_KEY, true);
