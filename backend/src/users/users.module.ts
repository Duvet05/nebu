import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from './entities/user.entity';
import { Person } from './entities/person.entity';
import { Privilege } from './entities/privilege.entity';
import { Role } from './entities/role.entity';
import { UsersService } from './services/users.service';
import { UsersController } from './controllers/users.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, Person, Privilege, Role])],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
