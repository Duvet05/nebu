import { DataSource } from 'typeorm';
import { Logger } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { User, UserRole, UserStatus } from '../../users/entities/user.entity';
import { Person, Gender, PersonStatus } from '../../users/entities/person.entity';
import { PersonName } from '../../users/entities/person-name.entity';

const logger = new Logger('UserSeeder');

/**
 * Seeder de usuarios de prueba
 * Crea usuarios con diferentes roles para testing
 */
export async function seedUsers(dataSource: DataSource): Promise<void> {
  const userRepository = dataSource.getRepository(User);
  const personRepository = dataSource.getRepository(Person);
  const personNameRepository = dataSource.getRepository(PersonName);

  try {
    // Verificar si ya existen usuarios
    const existingCount = await userRepository.count();
    if (existingCount > 0) {
      logger.warn(`Ya existen ${existingCount} usuarios. Saltando seed inicial.`);
      return;
    }

    logger.log('🌱 Creando usuarios de prueba...');

    const saltRounds = 12;

    // ==============================================
    // 1. USUARIO ADMIN
    // ==============================================
    const adminPasswordHash = await bcrypt.hash('Admin123', saltRounds);
    
    const adminPerson = personRepository.create({
      gender: Gender.UNKNOWN,
      status: PersonStatus.ACTIVE,
    });
    await personRepository.save(adminPerson);

    const adminName = personNameRepository.create({
      givenName: 'Admin',
      familyName: 'Sistema',
      person: adminPerson,
    });
    await personNameRepository.save(adminName);

    const admin = userRepository.create({
      systemId: 'ADMIN-001',
      username: 'admin',
      email: 'admin@nebu.com',
      password: adminPasswordHash,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      emailVerified: true,
      person: adminPerson,
    });
    await userRepository.save(admin);
    logger.log('✅ Usuario ADMIN creado (username: admin, password: Admin123)');

    // ==============================================
    // 2. USUARIO SUPPORT
    // ==============================================
    const supportPasswordHash = await bcrypt.hash('Support123', saltRounds);
    
    const supportPerson = personRepository.create({
      gender: Gender.MALE,
      status: PersonStatus.ACTIVE,
    });
    await personRepository.save(supportPerson);

    const supportName = personNameRepository.create({
      givenName: 'Carlos',
      familyName: 'Soporte',
      person: supportPerson,
    });
    await personNameRepository.save(supportName);

    const support = userRepository.create({
      systemId: 'SUPPORT-001',
      username: 'support',
      email: 'support@nebu.com',
      password: supportPasswordHash,
      role: UserRole.SUPPORT,
      status: UserStatus.ACTIVE,
      emailVerified: true,
      person: supportPerson,
    });
    await userRepository.save(support);
    logger.log('✅ Usuario SUPPORT creado (username: support, password: Support123)');

    // ==============================================
    // 3. USUARIOS CUSTOMER (3 ejemplos)
    // ==============================================
    const customers = [
      {
        systemId: 'CUSTOMER-001',
        username: 'maria.garcia',
        email: 'maria.garcia@example.com',
        password: 'Customer123',
        givenName: 'María',
        familyName: 'García',
        gender: Gender.FEMALE,
      },
      {
        systemId: 'CUSTOMER-002',
        username: 'juan.perez',
        email: 'juan.perez@example.com',
        password: 'Customer123',
        givenName: 'Juan',
        familyName: 'Pérez',
        gender: Gender.MALE,
      },
      {
        systemId: 'CUSTOMER-003',
        username: 'ana.lopez',
        email: 'ana.lopez@example.com',
        password: 'Customer123',
        givenName: 'Ana',
        familyName: 'López',
        gender: Gender.FEMALE,
      },
    ];

    for (const customerData of customers) {
      const passwordHash = await bcrypt.hash(customerData.password, saltRounds);
      
      const customerPerson = personRepository.create({
        gender: customerData.gender,
        status: PersonStatus.ACTIVE,
      });
      await personRepository.save(customerPerson);

      const customerName = personNameRepository.create({
        givenName: customerData.givenName,
        familyName: customerData.familyName,
        person: customerPerson,
      });
      await personNameRepository.save(customerName);

      const customer = userRepository.create({
        systemId: customerData.systemId,
        username: customerData.username,
        email: customerData.email,
        password: passwordHash,
        role: UserRole.CUSTOMER,
        status: UserStatus.ACTIVE,
        emailVerified: true,
        person: customerPerson,
      });
      await userRepository.save(customer);
      logger.log(`✅ Usuario CUSTOMER creado (username: ${customerData.username})`);
    }

    logger.log('✅ Usuarios de prueba creados exitosamente');
    logger.log('');
    logger.log('📋 CREDENCIALES DE PRUEBA:');
    logger.log('─────────────────────────────────────────────────────');
    logger.log('👤 ADMIN:');
    logger.log('   Username: admin');
    logger.log('   Email: admin@nebu.com');
    logger.log('   Password: Admin123');
    logger.log('');
    logger.log('🛠️  SUPPORT:');
    logger.log('   Username: support');
    logger.log('   Email: support@nebu.com');
    logger.log('   Password: Support123');
    logger.log('');
    logger.log('👥 CUSTOMERS:');
    customers.forEach((c) => {
      logger.log(`   Username: ${c.username} | Email: ${c.email} | Password: Customer123`);
    });
    logger.log('─────────────────────────────────────────────────────');

  } catch (error) {
    logger.error('❌ Error creando usuarios:', error);
    throw error;
  }
}
