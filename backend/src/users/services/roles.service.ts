import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../entities/role.entity';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { PaginationDto, PaginatedResponseDto } from '../../common/dto';

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

  async findAll(paginationDto: PaginationDto): Promise<PaginatedResponseDto<Role>> {
    const [data, totalItems] = await this.roleRepository.findAndCount({
      skip: paginationDto.skip,
      take: paginationDto.take,
      order: { createdAt: 'DESC' },
    });

    return new PaginatedResponseDto(
      data,
      totalItems,
      paginationDto.page,
      paginationDto.limit,
    );
  }

  async findOne(id: string): Promise<Role | null> {
    return this.roleRepository.findOne({ where: { id } });
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    await this.roleRepository.update(id, updateRoleDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.roleRepository.delete(id);
  }
}
