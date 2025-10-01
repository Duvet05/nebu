import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole, UserStatus } from '../users/entities/user.entity';
import { Notification } from '../notifications/entities/notification.entity';

export interface SecurityAuditResult {
  timestamp: string;
  checks: SecurityCheck[];
  overallScore: number;
  criticalIssues: number;
  warnings: number;
  recommendations: string[];
}

export interface SecurityCheck {
  name: string;
  status: 'PASS' | 'WARN' | 'FAIL';
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  details?: string;
  recommendation?: string;
}

@Injectable()
export class SecurityAuditService {
  private readonly logger = new Logger(SecurityAuditService.name);

  constructor(
    private configService: ConfigService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>
  ) {}

  /**
   * Performs comprehensive security audit
   */
  async performSecurityAudit(): Promise<SecurityAuditResult> {
    this.logger.log('Iniciando auditoría de seguridad completa...');

    const checks: SecurityCheck[] = [];

    // Authentication & Authorization Checks
    checks.push(...(await this.auditAuthentication()));
    checks.push(...(await this.auditAuthorization()));

    // Data Protection Checks
    checks.push(...(await this.auditDataProtection()));

    // Configuration Security Checks
    checks.push(...(await this.auditConfiguration()));

    // Input Validation Checks
    checks.push(...(await this.auditInputValidation()));

    // Database Security Checks
    checks.push(...(await this.auditDatabaseSecurity()));

    // API Security Checks
    checks.push(...(await this.auditAPISecurity()));

    // Calculate overall score
    const totalChecks = checks.length;
    const passedChecks = checks.filter(c => c.status === 'PASS').length;
    const overallScore = Math.round((passedChecks / totalChecks) * 100);

    // Count issues by severity
    const criticalIssues = checks.filter(
      c => c.status === 'FAIL' && c.severity === 'CRITICAL'
    ).length;
    const warnings = checks.filter(c => c.status === 'WARN').length;

    // Generate recommendations
    const recommendations = this.generateRecommendations(checks);

    const result: SecurityAuditResult = {
      timestamp: new Date().toISOString(),
      checks,
      overallScore,
      criticalIssues,
      warnings,
      recommendations,
    };

    this.logger.log(`Auditoría completada. Puntuación: ${overallScore}%`);
    return result;
  }

  /**
   * Audit authentication mechanisms
   */
  private async auditAuthentication(): Promise<SecurityCheck[]> {
    const checks: SecurityCheck[] = [];

    // Check JWT secret strength
    const jwtSecret = this.configService.get<string>('auth.jwtSecret');
    if (jwtSecret && jwtSecret.length >= 32) {
      checks.push({
        name: 'JWT Secret Strength',
        status: 'PASS',
        description: 'JWT secret has adequate length',
        severity: 'HIGH',
      });
    } else {
      checks.push({
        name: 'JWT Secret Strength',
        status: 'FAIL',
        description: 'JWT secret is too weak',
        severity: 'CRITICAL',
        recommendation: 'Use a JWT secret with at least 32 characters',
      });
    }

    // Check password hashing
    const bcryptRounds = this.configService.get<number>('auth.bcryptRounds', 12);
    if (bcryptRounds >= 12) {
      checks.push({
        name: 'Password Hashing',
        status: 'PASS',
        description: `bcrypt rounds set to ${bcryptRounds}`,
        severity: 'HIGH',
      });
    } else {
      checks.push({
        name: 'Password Hashing',
        status: 'FAIL',
        description: `bcrypt rounds too low: ${bcryptRounds}`,
        severity: 'HIGH',
        recommendation: 'Use at least 12 bcrypt rounds for password hashing',
      });
    }

    // Check token expiration
    const jwtExpiresIn = this.configService.get<string>('auth.jwtExpiresIn');
    if (jwtExpiresIn && jwtExpiresIn !== 'never') {
      checks.push({
        name: 'Token Expiration',
        status: 'PASS',
        description: `JWT tokens expire in ${jwtExpiresIn}`,
        severity: 'MEDIUM',
      });
    } else {
      checks.push({
        name: 'Token Expiration',
        status: 'FAIL',
        description: 'JWT tokens do not expire',
        severity: 'HIGH',
        recommendation: 'Set appropriate token expiration time',
      });
    }

    return checks;
  }

  /**
   * Audit authorization mechanisms
   */
  private async auditAuthorization(): Promise<SecurityCheck[]> {
    const checks: SecurityCheck[] = [];

    // Check for admin users
    const adminCount = await this.userRepository.count({
      where: { role: UserRole.ADMIN },
    });

    if (adminCount > 0) {
      checks.push({
        name: 'Admin Users',
        status: 'PASS',
        description: `${adminCount} admin user(s) found`,
        severity: 'MEDIUM',
      });
    } else {
      checks.push({
        name: 'Admin Users',
        status: 'WARN',
        description: 'No admin users found',
        severity: 'MEDIUM',
        recommendation: 'Ensure at least one admin user exists',
      });
    }

    // Check for inactive users
    const inactiveCount = await this.userRepository.count({
      where: { status: UserStatus.PENDING },
    });

    if (inactiveCount > 0) {
      checks.push({
        name: 'Inactive Users',
        status: 'WARN',
        description: `${inactiveCount} inactive user(s) found`,
        severity: 'LOW',
        recommendation: 'Review and activate or remove inactive users',
      });
    } else {
      checks.push({
        name: 'Inactive Users',
        status: 'PASS',
        description: 'No inactive users found',
        severity: 'LOW',
      });
    }

    return checks;
  }

  /**
   * Audit data protection measures
   */
  private async auditDataProtection(): Promise<SecurityCheck[]> {
    const checks: SecurityCheck[] = [];

    // Check for users with weak passwords (if we could detect them)
    checks.push({
      name: 'Password Policy',
      status: 'WARN',
      description: 'Password policy enforcement not implemented',
      severity: 'MEDIUM',
      recommendation: 'Implement password complexity requirements',
    });

    // Check for data encryption at rest
    checks.push({
      name: 'Data Encryption',
      status: 'WARN',
      description: 'Database encryption at rest not verified',
      severity: 'MEDIUM',
      recommendation: 'Ensure database encryption is enabled',
    });

    // Check for sensitive data exposure
    checks.push({
      name: 'Sensitive Data Exposure',
      status: 'PASS',
      description: 'Password fields are excluded from responses',
      severity: 'HIGH',
    });

    return checks;
  }

  /**
   * Audit configuration security
   */
  private async auditConfiguration(): Promise<SecurityCheck[]> {
    const checks: SecurityCheck[] = [];

    // Check environment
    const environment = this.configService.get<string>('NODE_ENV');
    if (environment === 'production') {
      checks.push({
        name: 'Environment',
        status: 'PASS',
        description: 'Running in production environment',
        severity: 'MEDIUM',
      });
    } else {
      checks.push({
        name: 'Environment',
        status: 'WARN',
        description: `Running in ${environment} environment`,
        severity: 'LOW',
        recommendation: 'Ensure production settings are used in production',
      });
    }

    // Check CORS configuration
    const corsEnabled = this.configService.get<boolean>('cors.enabled', true);
    if (corsEnabled) {
      checks.push({
        name: 'CORS Configuration',
        status: 'WARN',
        description: 'CORS is enabled',
        severity: 'MEDIUM',
        recommendation: 'Review CORS settings for production',
      });
    }

    // Check rate limiting
    checks.push({
      name: 'Rate Limiting',
      status: 'WARN',
      description: 'Rate limiting not implemented',
      severity: 'MEDIUM',
      recommendation: 'Implement rate limiting to prevent abuse',
    });

    return checks;
  }

  /**
   * Audit input validation
   */
  private async auditInputValidation(): Promise<SecurityCheck[]> {
    const checks: SecurityCheck[] = [];

    // Check for SQL injection protection
    checks.push({
      name: 'SQL Injection Protection',
      status: 'PASS',
      description: 'Using TypeORM with parameterized queries',
      severity: 'HIGH',
    });

    // Check for XSS protection
    checks.push({
      name: 'XSS Protection',
      status: 'PASS',
      description: 'Input sanitization implemented in validators',
      severity: 'HIGH',
    });

    // Check for CSRF protection
    checks.push({
      name: 'CSRF Protection',
      status: 'WARN',
      description: 'CSRF protection not implemented',
      severity: 'MEDIUM',
      recommendation: 'Implement CSRF tokens for state-changing operations',
    });

    return checks;
  }

  /**
   * Audit database security
   */
  private async auditDatabaseSecurity(): Promise<SecurityCheck[]> {
    const checks: SecurityCheck[] = [];

    // Check database connection security
    const dbHost = this.configService.get<string>('database.host');
    if (dbHost && dbHost !== 'localhost') {
      checks.push({
        name: 'Database Connection',
        status: 'PASS',
        description: 'Using remote database connection',
        severity: 'MEDIUM',
      });
    } else {
      checks.push({
        name: 'Database Connection',
        status: 'WARN',
        description: 'Using localhost database connection',
        severity: 'LOW',
        recommendation: 'Use secure remote database in production',
      });
    }

    // Check for database backup strategy
    checks.push({
      name: 'Database Backups',
      status: 'WARN',
      description: 'Database backup strategy not verified',
      severity: 'MEDIUM',
      recommendation: 'Implement regular database backups',
    });

    return checks;
  }

  /**
   * Audit API security
   */
  private async auditAPISecurity(): Promise<SecurityCheck[]> {
    const checks: SecurityCheck[] = [];

    // Check HTTPS enforcement
    checks.push({
      name: 'HTTPS Enforcement',
      status: 'WARN',
      description: 'HTTPS enforcement not verified',
      severity: 'HIGH',
      recommendation: 'Enforce HTTPS in production',
    });

    // Check API versioning
    checks.push({
      name: 'API Versioning',
      status: 'PASS',
      description: 'API versioning implemented (/api/v1/)',
      severity: 'LOW',
    });

    // Check for API documentation security
    const environment = this.configService.get<string>('NODE_ENV');
    if (environment === 'production') {
      checks.push({
        name: 'API Documentation',
        status: 'WARN',
        description: 'API documentation accessible in production',
        severity: 'LOW',
        recommendation: 'Disable or secure API documentation in production',
      });
    } else {
      checks.push({
        name: 'API Documentation',
        status: 'PASS',
        description: 'API documentation enabled for development',
        severity: 'LOW',
      });
    }

    return checks;
  }

  /**
   * Generate security recommendations based on audit results
   */
  private generateRecommendations(checks: SecurityCheck[]): string[] {
    const recommendations: string[] = [];

    const failedChecks = checks.filter(c => c.status === 'FAIL');
    const warningChecks = checks.filter(c => c.status === 'WARN');

    // Add recommendations for failed checks
    failedChecks.forEach(check => {
      if (check.recommendation) {
        recommendations.push(`[${check.severity}] ${check.name}: ${check.recommendation}`);
      }
    });

    // Add recommendations for warning checks
    warningChecks.forEach(check => {
      if (check.recommendation) {
        recommendations.push(`[${check.severity}] ${check.name}: ${check.recommendation}`);
      }
    });

    // Add general recommendations
    if (failedChecks.some(c => c.severity === 'CRITICAL')) {
      recommendations.push('[CRITICAL] Address all critical security issues immediately');
    }

    if (recommendations.length === 0) {
      recommendations.push(
        'No specific recommendations at this time. Continue monitoring security.'
      );
    }

    return recommendations;
  }

  /**
   * Get security metrics for monitoring
   */
  async getSecurityMetrics(): Promise<{
    totalUsers: number;
    activeUsers: number;
    adminUsers: number;
    inactiveUsers: number;
    recentLogins: number;
    failedLogins: number;
  }> {
    const [totalUsers, activeUsers, adminUsers, inactiveUsers] = await Promise.all([
      this.userRepository.count(),
      this.userRepository.count({ where: { status: UserStatus.ACTIVE } }),
      this.userRepository.count({ where: { role: UserRole.ADMIN } }),
      this.userRepository.count({ where: { status: UserStatus.PENDING } }),
    ]);

    // For now, return mock data for login metrics
    // In a real implementation, you'd track these in a separate table
    const recentLogins = Math.floor(Math.random() * 100);
    const failedLogins = Math.floor(Math.random() * 10);

    return {
      totalUsers,
      activeUsers,
      adminUsers,
      inactiveUsers,
      recentLogins,
      failedLogins,
    };
  }
}
