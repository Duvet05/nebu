import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class QueryOptimizationInterceptor implements NestInterceptor {
  private readonly logger = new Logger(QueryOptimizationInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const startTime = Date.now();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;

        // Log slow queries (> 1000ms)
        if (duration > 1000) {
          this.logger.warn(`Slow query detected: ${method} ${url} took ${duration}ms`, {
            method,
            url,
            duration,
            timestamp: new Date().toISOString(),
          });
        }

        // Log all queries in development
        if (process.env.NODE_ENV === 'development') {
          this.logger.debug(`Query executed: ${method} ${url} in ${duration}ms`);
        }
      })
    );
  }
}
