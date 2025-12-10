import { Controller, Post, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { exec } from 'child_process';
import { promisify } from 'util';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';

const execAsync = promisify(exec);

@ApiTags('internal')
@Controller('internal')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class InternalController {
  /**
   * Endpoint interno para ejecutar migrations de TypeORM manualmente
   * Útil para triggers externos o re-ejecución manual
   */
  @Post('run-migrations')
  @HttpCode(HttpStatus.OK)
  async runMigrations() {
    try {
      const { stdout, stderr } = await execAsync('npm run migration:run');

      return {
        success: true,
        output: stdout,
        errors: stderr || null,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        output: error.stdout,
        errors: error.stderr,
      };
    }
  }

  /**
   * Endpoint interno para revertir la última migration
   * Usar con precaución
   */
  @Post('revert-migration')
  @HttpCode(HttpStatus.OK)
  async revertMigration() {
    try {
      const { stdout, stderr } = await execAsync('npm run migration:revert');

      return {
        success: true,
        output: stdout,
        errors: stderr || null,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        output: error.stdout,
        errors: error.stderr,
      };
    }
  }

  /**
   * Endpoint interno para ver el estado de las migrations
   */
  @Post('migrations-status')
  @HttpCode(HttpStatus.OK)
  async migrationsStatus() {
    try {
      const { stdout, stderr } = await execAsync('npm run migration:show');

      return {
        success: true,
        output: stdout,
        errors: stderr || null,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        output: error.stdout,
        errors: error.stderr,
      };
    }
  }
}
