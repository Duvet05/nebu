import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../entities/role.entity';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { PaginationDto } from '../../common/dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const role = this.roleRepository.create(createRoleDto);
    return this.roleRepository.save(role);
  }

  async findAll(paginationDto: PaginationDto): Promise<[Role[], number]> {
    return this.roleRepository.findAndCount({
      skip: paginationDto.skip,
      take: paginationDto.take,
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Role | null> {
    return this.roleRepository.findOne({ where: { id } });
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const role = await this.findOne(id);
    if (!role) {
      throw new NotFoundException(`Rol con ID ${id} no encontrado`);
    }
    await this.roleRepository.update(id, updateRoleDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const role = await this.findOne(id);
    if (!role) {
      throw new NotFoundException(`Rol con ID ${id} no encontrado`);
    }
    await this.roleRepository.delete(id);
  }
}
