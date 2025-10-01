import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FeaturesConfig {
  constructor(private configService: ConfigService) {}

  // Analytics feature
  get isAnalyticsEnabled(): boolean {
    return this.configService.get<string>('ENABLE_ANALYTICS') === 'true';
  }

  // WebSocket feature
  get isWebSocketEnabled(): boolean {
    return this.configService.get<string>('ENABLE_WEBSOCKET') === 'true';
  }

  // Chat feature
  get isChatEnabled(): boolean {
    return this.configService.get<string>('ENABLE_CHAT') === 'true';
  }

  // Notifications feature
  get isNotificationsEnabled(): boolean {
    return this.configService.get<string>('ENABLE_NOTIFICATIONS') === 'true';
  }

  // Email notifications feature
  get isEmailNotificationsEnabled(): boolean {
    return this.configService.get<string>('ENABLE_EMAIL_NOTIFICATIONS') === 'true';
  }

  // OAuth feature
  get isOAuthEnabled(): boolean {
    return this.configService.get<string>('ENABLE_OAUTH') === 'true';
  }

  // Stripe payments feature
  get isStripeEnabled(): boolean {
    return this.configService.get<string>('ENABLE_STRIPE') === 'true';
  }

  // Get all features as an object
  getAllFeatures() {
    return {
      analytics: this.isAnalyticsEnabled,
      websocket: this.isWebSocketEnabled,
      chat: this.isChatEnabled,
      notifications: this.isNotificationsEnabled,
      emailNotifications: this.isEmailNotificationsEnabled,
      oauth: this.isOAuthEnabled,
      stripe: this.isStripeEnabled,
    };
  }
}
