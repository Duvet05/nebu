import { DynamicModule, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FeaturesConfig } from './features.config';

// Import all modules that can be conditionally loaded
// import { WebSocketModule } from '../websocket/websocket.module';
import { NotificationsModule } from '../notifications/notifications.module';

/**
 * Dynamic module loader that respects feature flags
 * This allows modules to be conditionally loaded based on environment variables
 */
@Module({})
export class DynamicModulesConfig {
  static forRoot(configService: ConfigService): DynamicModule {
    const featuresConfig = new FeaturesConfig(configService);
    const imports = [];

    // Conditionally load modules based on feature flags
    // if (featuresConfig.isWebSocketEnabled) {
    //   imports.push(WebSocketModule);
    // }

    if (featuresConfig.isNotificationsEnabled) {
      imports.push(NotificationsModule);
    }

    return {
      module: DynamicModulesConfig,
      imports,
      providers: [FeaturesConfig],
      exports: [FeaturesConfig],
    };
  }
}
