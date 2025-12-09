import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class ValidationSanitizationPipe implements PipeTransform<any> {
  private readonly logger = new Logger(ValidationSanitizationPipe.name);

  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    // Skip validation for undefined values (e.g., optional CurrentUser decorator)
    if (value === undefined || value === null) {
      return value;
    }

    // Sanitize string values
    value = this.sanitizeInput(value);

    const object = plainToClass(metatype, value);
    const errors = await validate(object);

    if (errors.length > 0) {
      const errorMessages = errors
        .map(error => Object.values(error.constraints || {}).join(', '))
        .join('; ');

      this.logger.warn(`Validation failed: ${errorMessages}`, {
        errors: errors.map(e => ({
          property: e.property,
          constraints: e.constraints,
        })),
        value: this.sanitizeForLogging(value),
      });

      throw new BadRequestException(`Validation failed: ${errorMessages}`);
    }

    return object;
  }

  private toValidate(metatype: Function): boolean {
    // Skip native types
    const types: Function[] = [String, Boolean, Number, Array, Object];
    if (types.includes(metatype)) {
      return false;
    }

    // Skip TypeORM entities - they should not be validated as DTOs
    // The User entity is passed by @CurrentUser() decorator
    if (metatype === User) {
      return false;
    }

    return true;
  }

  private sanitizeInput(value: any): any {
    if (typeof value === 'string') {
      // Basic XSS protection - remove script tags and dangerous attributes
      return value
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .replace(/javascript:/gi, '')
        .trim();
    }

    if (Array.isArray(value)) {
      return value.map(item => this.sanitizeInput(item));
    }

    if (value && typeof value === 'object') {
      const sanitized = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = this.sanitizeInput(val);
      }
      return sanitized;
    }

    return value;
  }

  private sanitizeForLogging(value: any): any {
    if (!value) return value;

    const sanitized = { ...value };

    // Remove sensitive fields from logging
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'ssn', 'creditCard'];
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });

    return sanitized;
  }
}
