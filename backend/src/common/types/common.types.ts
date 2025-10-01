import { Request } from 'express';
import { User } from '../../users/entities/user.entity';

/**
 * Enhanced request interface with user information
 */
export interface AuthenticatedRequest extends Request {
  user: User;
}

/**
 * OAuth provider data interface
 */
export interface OAuthProviderData {
  provider: string;
  providerId: string;
  email: string;
  name: string;
  avatar?: string;
  profile?: OAuthProfile;
}

/**
 * OAuth profile data interface
 */
export interface OAuthProfile {
  id: string;
  email: string;
  name: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
  locale?: string;
  verified_email?: boolean;
  [key: string]: unknown;
}

/**
 * Token validation event details interface
 */
export interface TokenValidationEventDetails {
  tokenType?: 'access' | 'refresh';
  isExpired?: boolean;
  errorType?: string;
  userAgent?: string;
  ipAddress?: string;
  [key: string]: unknown;
}

/**
 * API response wrapper interface
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: string;
}

/**
 * Pagination parameters interface
 */
export interface PaginationParams {
  page: number;
  limit: number;
  offset?: number;
}

/**
 * Paginated response interface
 */
export interface PaginatedResponse<T = unknown> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Search parameters interface
 */
export interface SearchParams extends PaginationParams {
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  filters?: Record<string, unknown>;
}

/**
 * Audit log entry interface
 */
export interface AuditLogEntry {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  details: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
}

/**
 * File upload result interface
 */
export interface FileUploadResult {
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  url: string;
  path: string;
}

/**
 * Email template variables interface
 */
export interface EmailTemplateVariables {
  [key: string]: string | number | boolean | Date;
}

/**
 * Notification data interface
 */
export interface NotificationData {
  [key: string]: string | number | boolean | Date | Record<string, unknown>;
}

/**
 * WebSocket message interface
 */
export interface WebSocketMessage<T = unknown> {
  type: string;
  payload: T;
  timestamp: string;
  userId?: string;
}

/**
 * Analytics event data interface
 */
export interface AnalyticsEventData {
  eventType: string;
  userId?: string;
  sessionId?: string;
  properties: Record<string, unknown>;
  timestamp: Date;
}

/**
 * Database query options interface
 */
export interface DatabaseQueryOptions {
  relations?: string[];
  select?: string[];
  where?: Record<string, unknown>;
  order?: Record<string, 'ASC' | 'DESC'>;
  skip?: number;
  take?: number;
}

/**
 * Validation error details interface
 */
export interface ValidationErrorDetails {
  field: string;
  message: string;
  value?: unknown;
  constraint?: string;
}

/**
 * Service operation result interface
 */
export interface ServiceOperationResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  validationErrors?: ValidationErrorDetails[];
}

/**
 * Cache options interface
 */
export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  key?: string;
  tags?: string[];
}

/**
 * Queue job data interface
 */
export interface QueueJobData<T = unknown> {
  jobId: string;
  type: string;
  data: T;
  priority?: number;
  delay?: number;
  attempts?: number;
}
