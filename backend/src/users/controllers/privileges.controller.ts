import { Controller, Get, Post, Body, Param, Patch, Delete, Query } from '@nestjs/common';
import { PrivilegesService } from '../services/privileges.service';
import { CreatePrivilegeDto } from '../dto/create-privilege.dto';
import { UpdatePrivilegeDto } from '../dto/update-privilege.dto';
import { PaginationDto } from '../../common/dto';

@Controller('privileges')
export class PrivilegesController {
  constructor(private readonly privilegesService: PrivilegesService) {}

  @Post()
  create(@Body() createPrivilegeDto: CreatePrivilegeDto) {
    return this.privilegesService.create(createPrivilegeDto);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.privilegesService.findAll(paginationDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.privilegesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePrivilegeDto: UpdatePrivilegeDto) {
    return this.privilegesService.update(id, updatePrivilegeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.privilegesService.remove(id);
  }
}
