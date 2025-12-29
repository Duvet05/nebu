import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Inject,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { createHash } from 'crypto';
import {
  DUPLICATE_REQUEST_KEY,
  DuplicateRequestOptions,
} from '../decorators/duplicate-request.decorator';
import { ApiException } from '../exceptions/api.exception';

@Injectable()
export class DuplicateRequestGuard implements CanActivate {
  private readonly logger = new Logger(DuplicateRequestGuard.name);

  constructor(
    private reflector: Reflector,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const options = this.reflector.get<DuplicateRequestOptions>(
      DUPLICATE_REQUEST_KEY,
      context.getHandler(),
    );

    if (!options) {
      return true; // No duplicate check needed
    }

    const request = context.switchToHttp().getRequest();
    const { body, user, ip, method, url } = request;

    // Generate unique key for this request
    const key = this.generateRequestKey(body, user, ip, method, url, options.fields);

    // Check if this request was already processed
    const existingRequest = await this.cacheManager.get(key);

    if (existingRequest) {
      this.logger.warn(
        `Duplicate request detected: ${method} ${url} from ${ip || 'unknown'} (user: ${user?.id || 'anonymous'})`,
      );

      throw ApiException.duplicateRequest(options.message);
    }

    // Store the request key with TTL
    await this.cacheManager.set(key, {
      timestamp: Date.now(),
      userId: user?.id,
      ip,
    }, options.ttl * 1000);

    return true;
  }

  /**
   * Generate a unique key for the request based on body content and metadata
   */
  private generateRequestKey(
    body: any,
    user: any,
    ip: string,
    method: string,
    url: string,
    fields?: string[],
  ): string {
    let dataToHash: any = {};

    if (fields && fields.length > 0) {
      // Use only specified fields
      fields.forEach(field => {
        if (body && body[field] !== undefined) {
          dataToHash[field] = body[field];
        }
      });
    } else {
      // Use entire body
      dataToHash = body || {};
    }

    // Include user ID if authenticated
    if (user?.id) {
      dataToHash._userId = user.id;
    } else {
      // Include IP for anonymous requests
      dataToHash._ip = ip;
    }

    // Include method and URL
    dataToHash._method = method;
    dataToHash._url = url;

    // Create hash
    const hash = createHash('sha256')
      .update(JSON.stringify(dataToHash))
      .digest('hex');

    return `duplicate_request:${hash}`;
  }
}
