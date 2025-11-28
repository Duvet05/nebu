import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Privilege } from '../entities/privilege.entity';
import { CreatePrivilegeDto } from '../dto/create-privilege.dto';
import { UpdatePrivilegeDto } from '../dto/update-privilege.dto';
import { PaginationDto, PaginatedResponseDto } from '../../common/dto';

@Injectable()
export class PrivilegesService {
  constructor(
    @InjectRepository(Privilege)
    private readonly privilegeRepository: Repository<Privilege>,
  ) {}

  async create(createPrivilegeDto: CreatePrivilegeDto): Promise<Privilege> {
    const privilege = this.privilegeRepository.create(createPrivilegeDto);
    return this.privilegeRepository.save(privilege);
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginatedResponseDto<Privilege>> {
    const [data, totalItems] = await this.privilegeRepository.findAndCount({
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

  async findOne(id: string): Promise<Privilege | null> {
    return this.privilegeRepository.findOne({ where: { id } });
  }

  async update(id: string, updatePrivilegeDto: UpdatePrivilegeDto): Promise<Privilege> {
    await this.privilegeRepository.update(id, updatePrivilegeDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.privilegeRepository.delete(id);
  }
}
