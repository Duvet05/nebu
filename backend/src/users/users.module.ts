import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from './entities/user.entity';
import { Person } from './entities/person.entity';
import { PersonName } from './entities/person-name.entity';
import { PersonAttribute } from './entities/person-attribute.entity';
import { PersonAttributeType } from './entities/person-attribute-type.entity';
import { Privilege } from './entities/privilege.entity';
import { Role } from './entities/role.entity';
import { UsersService } from './services/users.service';
import { UsersController } from './controllers/users.controller';
import { PersonsService } from './services/persons.service';
import { PersonsController } from './controllers/persons.controller';
import { PrivilegesService } from './services/privileges.service';
import { PrivilegesController } from './controllers/privileges.controller';
import { RolesService } from './services/roles.service';
import { RolesController } from './controllers/roles.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, Person, PersonName, PersonAttribute, PersonAttributeType, Privilege, Role])],
  providers: [UsersService, PersonsService, PrivilegesService, RolesService],
  controllers: [UsersController, PersonsController, PrivilegesController, RolesController],
  exports: [UsersService, PersonsService, PrivilegesService, RolesService],
})
export class UsersModule {}
