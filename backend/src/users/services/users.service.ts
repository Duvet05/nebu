import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';

import { User, UserRole, UserStatus } from '../entities/user.entity';
import { Person } from '../entities/person.entity';
import { UpdateUserDto } from '../dto/update-user.dto';
import { CreateUserDto } from '../dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Person)
    private personRepository: Repository<Person>
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email, username, password, firstName, lastName } = createUserDto;

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

    // Create Person first
    const person = this.personRepository.create({
      firstName,
      lastName,
      email, // Person also has email
      // Add other person fields if available in DTO, or defaults
      // Auditing fields (creator would be the current user if we had context, for now null or system)
      // person.creator = currentUser; 
    });
    
    // Generate systemId (simple implementation for now, could be UUID or custom format)
    const systemId = `USR-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
      person: person,
      systemId: systemId,
      // Auditing
      // creator: currentUser
    });

    return this.userRepository.save(user);
  }

  async findAll(
    page = 1,
    limit = 10,
    includeDeleted = false
  ): Promise<{ users: User[]; total: number; pages: number }> {
    const queryBuilder = this.userRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.person', 'person');

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
      relations: ['toys', 'person'],
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ 
      where: { email },
      relations: ['person']
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({ 
      where: { username },
      relations: ['person']
    });
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

    // Handle Person updates
    if (user.person) {
      if (updateUserDto.firstName) user.person.firstName = updateUserDto.firstName;
      if (updateUserDto.lastName) user.person.lastName = updateUserDto.lastName;
      // Handle other fields that moved to Person
      // Note: The setters in User entity might handle this if we just assign to user, 
      // but Object.assign below might bypass setters if it just copies properties.
      // However, updateUserDto is a plain object.
      // Let's explicitly update person fields to be safe.
    }

    // Remove fields that shouldn't be directly assigned to User if they are now on Person
    // to avoid "column not found" errors if TypeORM tries to save them to User table.
    // But since we removed them from User entity, TypeORM shouldn't try to save them unless they are in the object.
    // The setters in User entity are good for convenience, but here we are doing explicit update.
    
    // We can use the setters!
    Object.assign(user, updateUserDto); 
    // If updateUserDto has firstName, user.firstName setter will be called? 
    // No, Object.assign on a class instance with accessors behaves differently depending on target.
    // If target has a setter, it IS invoked.
    
    return this.userRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);

    // Soft delete - change user status to DELETED
    user.status = UserStatus.DELETED;
    
    // OpenMRS style: retire user
    user.retired = true;
    user.dateRetired = new Date();
    user.retireReason = 'Deleted via API';
    // user.retiredBy = currentUser;

    // OpenMRS style: void person
    if (user.person) {
        user.person.voided = true;
        user.person.dateVoided = new Date();
        user.person.voidReason = 'User deleted';
        // user.person.voidedBy = currentUser;
    }

    // Set deleted timestamp in metadata (keeping for backward compatibility)
    if (!user.metadata) {
      user.metadata = {};
    }
    user.metadata.deletedAt = new Date().toISOString();

    await this.userRepository.save(user);
  }

  async restore(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id, status: UserStatus.DELETED },
      relations: ['person']
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
    user.avatar = avatarUrl; // Uses setter to update person.metadata.avatar
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
