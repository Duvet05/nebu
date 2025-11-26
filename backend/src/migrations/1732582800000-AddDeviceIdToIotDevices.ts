import { MigrationInterface, QueryRunner, TableColumn, TableIndex } from 'typeorm';

export class AddDeviceIdToIotDevices1732582800000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Hacer macAddress nullable
    await queryRunner.changeColumn(
      'iot_devices',
      'macAddress',
      new TableColumn({
        name: 'macAddress',
        type: 'varchar',
        length: '32',
        isNullable: true,
        isUnique: true,
      })
    );

    // 2. Agregar columna deviceId
    await queryRunner.addColumn(
      'iot_devices',
      new TableColumn({
        name: 'deviceId',
        type: 'varchar',
        length: '64',
        isNullable: true,
        isUnique: true,
      })
    );

    // 3. Crear índice en deviceId
    await queryRunner.createIndex(
      'iot_devices',
      new TableIndex({
        name: 'IDX_IOT_DEVICES_DEVICE_ID',
        columnNames: ['deviceId'],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 1. Eliminar índice de deviceId
    await queryRunner.dropIndex('iot_devices', 'IDX_IOT_DEVICES_DEVICE_ID');

    // 2. Eliminar columna deviceId
    await queryRunner.dropColumn('iot_devices', 'deviceId');

    // 3. Revertir macAddress a NOT NULL
    await queryRunner.changeColumn(
      'iot_devices',
      'macAddress',
      new TableColumn({
        name: 'macAddress',
        type: 'varchar',
        length: '32',
        isNullable: false,
        isUnique: true,
      })
    );
  }
}
