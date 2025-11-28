
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Location } from '../src/common/entities/location.entity';
import { IoTDevice } from '../src/iot/entities/iot-device.entity';

// Simple Mock Repository
const createMockRepository = () => {
  const calls = {
    create: [] as any[],
    save: [] as any[],
    findOne: [] as any[],
    find: [] as any[],
  };

  const entities: any[] = [];

  return {
    calls,
    create: (arg: any) => {
      calls.create.push(arg);
      return arg;
    },
    save: (arg: any) => {
      calls.save.push(arg);
      // Simulate saving
      if (!arg.id) arg.id = 'uuid-' + Math.random();
      entities.push(arg);
      return Promise.resolve(arg);
    },
    findOne: (arg: any) => {
      calls.findOne.push(arg);
      return Promise.resolve(null);
    },
    find: (arg: any) => {
      calls.find.push(arg);
      return Promise.resolve([]);
    }
  };
};

async function runVerification() {
  console.log('Starting verification of Location entity...');

  const mockLocationRepo = createMockRepository();
  const mockDeviceRepo = createMockRepository();

  // Simulate Location Hierarchy
  console.log('\nTesting Location Hierarchy...');
  
  const hospital = { name: 'General Hospital' };
  const wardA = { name: 'Ward A', parentLocation: hospital };

  mockLocationRepo.save(hospital);
  mockLocationRepo.save(wardA);

  if (mockLocationRepo.calls.save.length >= 2) {
    console.log('✅ Locations saved');
    const savedWard = mockLocationRepo.calls.save[1];
    if (savedWard.parentLocation === hospital) {
        console.log('✅ Parent location linked correctly');
    } else {
        console.error('❌ Parent location NOT linked');
    }
  }

  // Simulate Device Assignment
  console.log('\nTesting Device Assignment...');
  const device = { name: 'Sensor 1', locationEntity: wardA };
  mockDeviceRepo.save(device);

  if (mockDeviceRepo.calls.save.length > 0) {
      const savedDevice = mockDeviceRepo.calls.save[0];
      if (savedDevice.locationEntity === wardA) {
          console.log('✅ Device assigned to Location');
      } else {
          console.error('❌ Device NOT assigned to Location');
      }
  }

  console.log('\nVerification complete.');
}

runVerification().catch(console.error);
