import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SecurityAuditService } from './security-audit.service';
import { SecurityController } from './controllers/security.controller';
import { User } from '../users/entities/user.entity';
import { Notification } from '../notifications/entities/notification.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Notification])],
  controllers: [SecurityController],
  providers: [SecurityAuditService],
  exports: [SecurityAuditService],
})
export class SecurityModule {}
