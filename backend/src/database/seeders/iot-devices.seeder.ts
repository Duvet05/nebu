import { DataSource } from 'typeorm';
import { Logger } from '@nestjs/common';
import { IoTDevice } from '../../iot/entities/iot-device.entity';

const logger = new Logger('IoTDeviceSeeder');

/**
 * Seeder de dispositivos IoT de prueba
 * Crea dispositivos IoT con device_id para testing
 */
export async function seedIoTDevices(dataSource: DataSource): Promise<void> {
  const iotDeviceRepository = dataSource.getRepository(IoTDevice);

  try {
    // Verificar si ya existen dispositivos IoT
    const existingCount = await iotDeviceRepository.count();
    if (existingCount > 0) {
      logger.warn(`Ya existen ${existingCount} dispositivos IoT. Saltando seed inicial.`);
      return;
    }

    logger.log('🌱 Creando dispositivos IoT de prueba...');

    // Crear dispositivos IoT de prueba con device_id (se deriva automáticamente de macAddress)
    const macAddresses = [
      'AA:BB:CC:DD:EE:FF',
      '11:22:33:44:55:66',
      'AA:BB:CC:DD:EE:01',
      'AA:BB:CC:DD:EE:02',
      'AA:BB:CC:DD:EE:03',
    ];

    const devicesData = [
      {
        name: 'ESP32 Dev Board 1',
        deviceId: IoTDevice.deriveDeviceIdFromMac(macAddresses[0]),  // ESP32_AABBCCDDEEFF
        macAddress: macAddresses[0],
        deviceType: 'controller' as const,
        status: 'offline' as const,
        batteryLevel: 100,
        signalStrength: -45,
      },
      {
        name: 'ESP32 Dev Board 2',
        deviceId: IoTDevice.deriveDeviceIdFromMac(macAddresses[1]),  // ESP32_112233445566
        macAddress: macAddresses[1],
        deviceType: 'controller' as const,
        status: 'offline' as const,
        batteryLevel: 85,
        signalStrength: -52,
      },
      {
        name: 'ESP32 Dev Board 3',
        deviceId: IoTDevice.deriveDeviceIdFromMac(macAddresses[2]),  // ESP32_AABBCCDDEE01
        macAddress: macAddresses[2],
        deviceType: 'controller' as const,
        status: 'offline' as const,
        batteryLevel: 92,
        signalStrength: -38,
      },
      {
        name: 'ESP32 Dev Board 4',
        deviceId: IoTDevice.deriveDeviceIdFromMac(macAddresses[3]),  // ESP32_AABBCCDDEE02
        macAddress: macAddresses[3],
        deviceType: 'sensor' as const,
        status: 'offline' as const,
        batteryLevel: 78,
        signalStrength: -58,
      },
      {
        name: 'ESP32 Dev Board 5',
        deviceId: IoTDevice.deriveDeviceIdFromMac(macAddresses[4]),  // ESP32_AABBCCDDEE03
        macAddress: macAddresses[4],
        deviceType: 'controller' as const,
        status: 'offline' as const,
        batteryLevel: 95,
        signalStrength: -42,
      },
    ];

    let createdCount = 0;
    for (const deviceData of devicesData) {
      const device = iotDeviceRepository.create(deviceData);
      await iotDeviceRepository.save(device);
      logger.log(`✅ Dispositivo IoT "${deviceData.name}" creado con device_id: ${deviceData.deviceId}`);
      createdCount++;
    }

    logger.log(`✅ ${createdCount} dispositivos IoT de prueba creados exitosamente`);

  } catch (error) {
    logger.error('❌ Error creando dispositivos IoT:', error);
    throw error;
  }
}
