import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';

import { User, UserRole, UserStatus } from '../entities/user.entity';
import { UpdateUserDto } from '../dto/update-user.dto';
import { CreateUserDto } from '../dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email, username, password } = createUserDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: [{ email }, ...(username ? [{ username }] : [])],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw new ConflictException('Ya existe un usuario con este email');
      }
      if (existingUser.username === username) {
        throw new ConflictException('Ya existe un usuario con este nombre de usuario');
      }
    }

    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return this.userRepository.save(user);
  }

  async findAll(
    page = 1,
    limit = 10,
    includeDeleted = false
  ): Promise<{ users: User[]; total: number; pages: number }> {
    const queryBuilder = this.userRepository.createQueryBuilder('user');

    // Filter out deleted users unless explicitly requested
    if (!includeDeleted) {
      queryBuilder.where('user.status != :deletedStatus', { deletedStatus: UserStatus.DELETED });
    }

    const [users, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('user.createdAt', 'DESC')
      .getManyAndCount();

    return {
      users,
      total,
      pages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['toys'],
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { username } });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    // Check for conflicts if email or username is being updated
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.findByEmail(updateUserDto.email);
      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('Ya existe un usuario con este email');
      }
    }

    if (updateUserDto.username && updateUserDto.username !== user.username) {
      const existingUser = await this.findByUsername(updateUserDto.username);
      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('Ya existe un usuario con este nombre de usuario');
      }
    }

    // Hash password if provided
    if (updateUserDto.password) {
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, saltRounds);
    }

    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);

    // Soft delete - change user status to DELETED
    user.status = UserStatus.DELETED;

    // Set deleted timestamp in metadata
    if (!user.metadata) {
      user.metadata = {};
    }
    user.metadata.deletedAt = new Date().toISOString();

    await this.userRepository.save(user);
  }

  async restore(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id, status: UserStatus.DELETED },
    });

    if (!user) {
      throw new NotFoundException('Usuario eliminado no encontrado');
    }

    // Restore user to active status
    user.status = UserStatus.ACTIVE;

    // Remove deleted timestamp from metadata
    if (user.metadata?.deletedAt) {
      delete user.metadata.deletedAt;
    }

    return this.userRepository.save(user);
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.userRepository.update(id, {
      lastLoginAt: new Date(),
    });
  }

  async updateAvatar(id: string, avatarUrl: string): Promise<User> {
    const user = await this.findOne(id);
    user.avatar = avatarUrl;
    return this.userRepository.save(user);
  }

  async promoteToInstructor(id: string): Promise<User> {
    const user = await this.findOne(id);

    // Check if user is already an instructor or admin
    if (user.role === UserRole.INSTRUCTOR || user.role === UserRole.ADMIN) {
      throw new ConflictException('Usuario ya tiene rol de instructor o superior');
    }

    // Promote user to instructor
    user.role = UserRole.INSTRUCTOR;
    user.status = UserStatus.ACTIVE;

    // Update metadata with promotion information
    if (!user.metadata) {
      user.metadata = {};
    }
    user.metadata.promotedToInstructorAt = new Date().toISOString();

    return this.userRepository.save(user);
  }

  async suspendUser(id: string, reason?: string): Promise<User> {
    const user = await this.findOne(id);

    // Check if user is already suspended
    if (user.status === UserStatus.SUSPENDED) {
      throw new ConflictException('Usuario ya está suspendido');
    }

    // Suspend user
    user.status = UserStatus.SUSPENDED;

    // Update metadata with suspension information
    if (!user.metadata) {
      user.metadata = {};
    }
    user.metadata.suspendedAt = new Date().toISOString();
    if (reason) {
      user.metadata.suspensionReason = reason;
    }

    return this.userRepository.save(user);
  }

  async reactivateUser(id: string): Promise<User> {
    const user = await this.findOne(id);

    // Check if user is suspended or deleted
    if (user.status !== UserStatus.SUSPENDED && user.status !== UserStatus.DELETED) {
      throw new ConflictException('Usuario no está suspendido o eliminado');
    }

    // Reactivate user
    user.status = UserStatus.ACTIVE;

    // Update metadata with reactivation information
    if (!user.metadata) {
      user.metadata = {};
    }
    user.metadata.reactivatedAt = new Date().toISOString();

    // Remove suspension/deletion information
    if (user.metadata.suspensionReason) {
      delete user.metadata.suspensionReason;
    }
    if (user.metadata.suspendedAt) {
      delete user.metadata.suspendedAt;
    }
    if (user.metadata.deletedAt) {
      delete user.metadata.deletedAt;
    }

    return this.userRepository.save(user);
  }
}
