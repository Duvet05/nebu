import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Activity } from '../entities/activity.entity';
import {
  CreateActivityDto,
  ActivityFiltersDto,
  ActivityListResponseDto,
} from '../dto/activity.dto';

@Injectable()
export class ActivityService {
  private readonly logger = new Logger(ActivityService.name);

  constructor(
    @InjectRepository(Activity)
    private activityRepository: Repository<Activity>,
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
}
