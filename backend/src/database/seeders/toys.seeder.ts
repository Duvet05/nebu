import { DataSource } from 'typeorm';
import { Logger } from '@nestjs/common';
import { Toy, ToyStatus } from '../../toys/entities/toy.entity';
import { User, UserRole } from '../../users/entities/user.entity';
import { ProductCatalog } from '../../toys/entities/product-catalog.entity';

const logger = new Logger('ToySeeder');

/**
 * Seeder de juguetes de prueba
 * Crea juguetes asignados a usuarios customer
 */
export async function seedToys(dataSource: DataSource): Promise<void> {
  const toyRepository = dataSource.getRepository(Toy);
  const userRepository = dataSource.getRepository(User);
  const productRepository = dataSource.getRepository(ProductCatalog);

  try {
    // Verificar si ya existen juguetes
    const existingCount = await toyRepository.count();
    if (existingCount > 0) {
      logger.warn(`Ya existen ${existingCount} juguetes. Saltando seed inicial.`);
      return;
    }

    logger.log('🌱 Creando juguetes de prueba...');

    // Obtener usuarios customer
    const customers = await userRepository.find({
      where: { role: UserRole.CUSTOMER },
      take: 3,
    });

    if (customers.length === 0) {
      logger.warn('No hay usuarios customer disponibles. Saltando seed de juguetes.');
      return;
    }

    // Obtener producto Nebu Dino si existe
    const nebuDinoProduct = await productRepository.findOne({
      where: { slug: 'nebu-dino' },
    });

    // Crear juguetes de prueba
    const toysData = [
      {
        name: 'Dino el Dinosaurio',
        model: 'Nebu Dino v1',
        manufacturer: 'Nebu Technologies',
        status: ToyStatus.ACTIVE,
        firmwareVersion: '1.2.3',
        batteryLevel: '85%',
        signalStrength: '-45dBm',
        capabilities: {
          voice: true,
          movement: true,
          lights: true,
          sensors: ['temperature', 'proximity', 'microphone'],
          aiFeatures: ['speech-recognition', 'emotion-detection', 'storytelling'],
        },
        settings: {
          volume: 70,
          brightness: 80,
          language: 'es',
          timezone: 'America/Lima',
          autoUpdate: true,
        },
        notes: 'Juguete principal del niño',
      },
      {
        name: 'Rex el Aventurero',
        model: 'Nebu Dino v1',
        manufacturer: 'Nebu Technologies',
        status: ToyStatus.CONNECTED,
        firmwareVersion: '1.2.3',
        batteryLevel: '92%',
        signalStrength: '-38dBm',
        capabilities: {
          voice: true,
          movement: true,
          lights: true,
          sensors: ['temperature', 'proximity', 'microphone'],
          aiFeatures: ['speech-recognition', 'emotion-detection', 'storytelling'],
        },
        settings: {
          volume: 80,
          brightness: 90,
          language: 'es',
          timezone: 'America/Lima',
          autoUpdate: true,
        },
        notes: 'Regalo de cumpleaños',
      },
      {
        name: 'Luna la Exploradora',
        model: 'Nebu Dino v1',
        manufacturer: 'Nebu Technologies',
        status: ToyStatus.DISCONNECTED,
        firmwareVersion: '1.2.2',
        batteryLevel: '45%',
        signalStrength: null,
        capabilities: {
          voice: true,
          movement: true,
          lights: true,
          sensors: ['temperature', 'proximity', 'microphone'],
          aiFeatures: ['speech-recognition', 'emotion-detection', 'storytelling'],
        },
        settings: {
          volume: 60,
          brightness: 70,
          language: 'es',
          timezone: 'America/Lima',
          autoUpdate: false,
        },
        notes: 'Pendiente de actualización de firmware',
      },
    ];

    let createdCount = 0;
    for (let i = 0; i < toysData.length && i < customers.length; i++) {
      const toyData = toysData[i];
      const customer = customers[i];

      const toy = toyRepository.create({
        ...toyData,
        user: customer,
        userId: customer.id,
        productCatalog: nebuDinoProduct,
        productCatalogId: nebuDinoProduct?.id,
        activatedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Últimos 30 días
        lastSeenAt: toyData.status !== ToyStatus.DISCONNECTED 
          ? new Date(Date.now() - Math.random() * 2 * 60 * 60 * 1000) // Últimas 2 horas
          : new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // Hace 5 días
        creator: customer,
      });

      await toyRepository.save(toy);
      logger.log(`✅ Juguete "${toyData.name}" creado para usuario ${customer.username}`);
      createdCount++;
    }

    logger.log(`✅ ${createdCount} juguetes de prueba creados exitosamente`);

  } catch (error) {
    logger.error('❌ Error creando juguetes:', error);
    throw error;
  }
}
