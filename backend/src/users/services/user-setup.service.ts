import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { UserSetup } from '../entities/user-setup.entity';
import { User } from '../entities/user.entity';
import {
  CreateUserSetupDto,
  UpdateUserPreferencesDto,
  UserSetupResponseDto,
} from '../dto/user-setup.dto';

@Injectable()
export class UserSetupService {
  constructor(
    @InjectRepository(UserSetup)
    private userSetupRepository: Repository<UserSetup>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private dataSource: DataSource,
  ) {}

  /**
   * Guardar configuración del Setup Wizard (operación atómica)
   */
  async createSetup(
    userId: string,
    createSetupDto: CreateUserSetupDto,
  ): Promise<UserSetupResponseDto> {
    // Usar transacción para garantizar atomicidad
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Verificar que el usuario existe
      const user = await queryRunner.manager.findOne(User, {
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      // 2. Verificar si ya existe una configuración
      let userSetup = await queryRunner.manager.findOne(UserSetup, {
        where: { userId },
      });

      if (userSetup) {
        // Actualizar configuración existente
        Object.assign(userSetup, {
          profile: createSetupDto.profile,
          language: createSetupDto.preferences.language,
          theme: createSetupDto.preferences.theme,
          hapticFeedback: createSetupDto.preferences.hapticFeedback,
          autoSave: createSetupDto.preferences.autoSave,
          analytics: createSetupDto.preferences.analytics,
          pushNotifications: createSetupDto.notifications.push,
          reminders: createSetupDto.notifications.reminders,
          voiceNotifications: createSetupDto.notifications.voice,
          updates: createSetupDto.notifications.updates,
          marketing: createSetupDto.notifications.marketing,
          quietHoursStart: createSetupDto.notifications.quietHoursStart,
          quietHoursEnd: createSetupDto.notifications.quietHoursEnd,
          voiceEnabled: createSetupDto.voice.enabled,
          voiceModel: createSetupDto.voice.voiceModel,
          speechRate: createSetupDto.voice.speechRate,
          setupCompleted: true,
          setupCompletedAt: new Date(),
        });
      } else {
        // Crear nueva configuración
        userSetup = queryRunner.manager.create(UserSetup, {
          userId,
          profile: createSetupDto.profile,
          language: createSetupDto.preferences.language,
          theme: createSetupDto.preferences.theme,
          hapticFeedback: createSetupDto.preferences.hapticFeedback,
          autoSave: createSetupDto.preferences.autoSave,
          analytics: createSetupDto.preferences.analytics,
          pushNotifications: createSetupDto.notifications.push,
          reminders: createSetupDto.notifications.reminders,
          voiceNotifications: createSetupDto.notifications.voice,
          updates: createSetupDto.notifications.updates,
          marketing: createSetupDto.notifications.marketing,
          quietHoursStart: createSetupDto.notifications.quietHoursStart,
          quietHoursEnd: createSetupDto.notifications.quietHoursEnd,
          voiceEnabled: createSetupDto.voice.enabled,
          voiceModel: createSetupDto.voice.voiceModel,
          speechRate: createSetupDto.voice.speechRate,
          setupCompleted: true,
          setupCompletedAt: new Date(),
        });
      }

      await queryRunner.manager.save(UserSetup, userSetup);

      // Commit de la transacción
      await queryRunner.commitTransaction();

      return {
        success: true,
        message: 'Setup configuration saved successfully',
        setupCompleted: true,
      };
    } catch (error) {
      // Rollback en caso de error
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Liberar conexión
      await queryRunner.release();
    }
  }

  /**
   * Obtener configuración del usuario
   */
  async getSetup(userId: string): Promise<UserSetup> {
    // Verificar que el usuario existe
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Buscar configuración existente
    let userSetup = await this.userSetupRepository.findOne({
      where: { userId },
    });

    // Si no existe, crear una configuración por defecto
    if (!userSetup) {
      userSetup = this.userSetupRepository.create({
        userId,
        setupCompleted: false,
      });
      await this.userSetupRepository.save(userSetup);
    }

    return userSetup;
  }

  /**
   * Actualizar preferencias del usuario
   */
  async updatePreferences(
    userId: string,
    updatePreferencesDto: UpdateUserPreferencesDto,
  ): Promise<UserSetup> {
    // Obtener o crear configuración
    let userSetup = await this.userSetupRepository.findOne({
      where: { userId },
    });

    if (!userSetup) {
      // Verificar que el usuario existe
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      // Crear configuración por defecto
      userSetup = this.userSetupRepository.create({
        userId,
        setupCompleted: false,
      });
    }

    // Actualizar solo los campos proporcionados
    Object.assign(userSetup, updatePreferencesDto);

    return this.userSetupRepository.save(userSetup);
  }
}
