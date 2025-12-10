import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, DataSource } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Activity } from '../entities/activity.entity';
import {
  CreateActivityDto,
  ActivityFiltersDto,
  ActivityListResponseDto,
  MigrateActivitiesDto,
  MigrateActivitiesResponseDto,
} from '../dto/activity.dto';

@Injectable()
export class ActivityService {
  private readonly logger = new Logger(ActivityService.name);

  constructor(
    @InjectRepository(Activity)
    private activityRepository: Repository<Activity>,
    private dataSource: DataSource,
  ) {}

  /**
   * Crear nueva actividad
   */
  async create(createActivityDto: CreateActivityDto): Promise<Activity> {
    const activity = this.activityRepository.create({
      ...createActivityDto,
      timestamp: new Date(createActivityDto.timestamp),
    });

    const savedActivity = await this.activityRepository.save(activity);
    this.logger.log(`Activity created: ${savedActivity.type} for user ${savedActivity.userId}`);

    return savedActivity;
  }

  /**
   * Obtener actividades con filtros y paginación
   */
  async findAll(filters: ActivityFiltersDto): Promise<ActivityListResponseDto> {
    const {
      userId,
      toyId,
      type,
      startDate,
      endDate,
      limit = 50,
      page = 1,
    } = filters;

    const queryBuilder = this.activityRepository
      .createQueryBuilder('activity')
      .leftJoinAndSelect('activity.user', 'user')
      .leftJoinAndSelect('activity.toy', 'toy');

    // Filtro obligatorio por userId
    queryBuilder.where('activity.userId = :userId', { userId });

    // Filtros opcionales
    if (toyId) {
      queryBuilder.andWhere('activity.toyId = :toyId', { toyId });
    }

    if (type) {
      queryBuilder.andWhere('activity.type = :type', { type });
    }

    if (startDate) {
      queryBuilder.andWhere('activity.timestamp >= :startDate', {
        startDate: new Date(startDate),
      });
    }

    if (endDate) {
      queryBuilder.andWhere('activity.timestamp <= :endDate', {
        endDate: new Date(endDate),
      });
    }

    // Ordenar por timestamp descendente (más recientes primero)
    queryBuilder.orderBy('activity.timestamp', 'DESC');

    // Paginación
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const [activities, total] = await queryBuilder.getManyAndCount();

    return {
      activities,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * CRON JOB: Limpiar actividades antiguas (retención de 90 días)
   * Se ejecuta diariamente a las 3:00 AM
   */
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async cleanupOldActivities(): Promise<void> {
    const retentionDays = 90;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    this.logger.log(`🧹 Cleaning up activities older than ${cutoffDate.toISOString()}`);

    const result = await this.activityRepository.delete({
      timestamp: LessThan(cutoffDate),
    });

    if (result.affected && result.affected > 0) {
      this.logger.log(`✅ Deleted ${result.affected} old activities`);
    } else {
      this.logger.log('✅ No old activities to delete');
    }
  }

  /**
   * Obtener estadísticas de actividades por usuario
   */
  async getStatsByUser(userId: string): Promise<{
    totalActivities: number;
    byType: Record<string, number>;
    last24Hours: number;
    last7Days: number;
  }> {
    const totalActivities = await this.activityRepository.count({
      where: { userId },
    });

    // Actividades por tipo
    const activitiesByType = await this.activityRepository
      .createQueryBuilder('activity')
      .select('activity.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .where('activity.userId = :userId', { userId })
      .groupBy('activity.type')
      .getRawMany();

    const byType = activitiesByType.reduce((acc, item) => {
      acc[item.type] = parseInt(item.count);
      return acc;
    }, {} as Record<string, number>);

    // Últimas 24 horas
    const yesterday = new Date();
    yesterday.setHours(yesterday.getHours() - 24);

    const last24Hours = await this.activityRepository.count({
      where: {
        userId,
        timestamp: LessThan(yesterday),
      },
    });

    // Últimos 7 días
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);

    const last7Days = await this.activityRepository.count({
      where: {
        userId,
        timestamp: LessThan(lastWeek),
      },
    });

    return {
      totalActivities,
      byType,
      last24Hours,
      last7Days,
    };
  }

  /**
   * Migrar actividades de un usuario local (UUID temporal) a un usuario autenticado
   * Se usa cuando el usuario se registra o inicia sesión después de usar la app sin cuenta
   */
  async migrateActivities(
    migrateDto: MigrateActivitiesDto,
  ): Promise<MigrateActivitiesResponseDto> {
    const { localUserId, newUserId } = migrateDto;

    this.logger.log(
      `🔄 Starting activity migration from local user ${localUserId} to authenticated user ${newUserId}`,
    );

    // Verificar que localUserId y newUserId sean diferentes
    if (localUserId === newUserId) {
      this.logger.warn('⚠️  Local user ID and new user ID are the same, no migration needed');
      return {
        success: true,
        message: 'No migration needed - IDs are identical',
        migratedCount: 0,
        newUserId,
      };
    }

    // Usar transacción para garantizar atomicidad
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Contar actividades a migrar
      const activitiesToMigrate = await queryRunner.manager.count(Activity, {
        where: { userId: localUserId },
      });

      if (activitiesToMigrate === 0) {
        this.logger.log('ℹ️  No activities found for local user ID');
        await queryRunner.commitTransaction();
        return {
          success: true,
          message: 'No activities to migrate',
          migratedCount: 0,
          newUserId,
        };
      }

      this.logger.log(`📦 Found ${activitiesToMigrate} activities to migrate`);

      // 2. Actualizar todas las actividades del usuario local al nuevo usuario
      const result = await queryRunner.manager
        .createQueryBuilder()
        .update(Activity)
        .set({ userId: newUserId })
        .where('userId = :localUserId', { localUserId })
        .execute();

      const migratedCount = result.affected || 0;

      // 3. Commit de la transacción
      await queryRunner.commitTransaction();

      this.logger.log(
        `✅ Migration completed successfully: ${migratedCount} activities migrated from ${localUserId} to ${newUserId}`,
      );

      return {
        success: true,
        message: 'Activities migrated successfully',
        migratedCount,
        newUserId,
      };
    } catch (error) {
      // Rollback en caso de error
      await queryRunner.rollbackTransaction();
      this.logger.error(`❌ Migration failed: ${error.message}`, error.stack);
      throw error;
    } finally {
      // Liberar conexión
      await queryRunner.release();
    }
  }
}
