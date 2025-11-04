import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeToysUserAndDeviceNullable1730850000000 implements MigrationInterface {
  name = 'MakeToysUserAndDeviceNullable1730850000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Primero, eliminar las foreign keys existentes si existen
    const table = await queryRunner.getTable('toys');

    // Buscar y eliminar FK de userId si existe
    const userIdFk = table?.foreignKeys.find(fk => fk.columnNames.indexOf('userId') !== -1);
    if (userIdFk) {
      await queryRunner.dropForeignKey('toys', userIdFk);
    }

    // Buscar y eliminar FK de iotDeviceId si existe
    const iotDeviceFk = table?.foreignKeys.find(fk => fk.columnNames.indexOf('iotDeviceId') !== -1);
    if (iotDeviceFk) {
      await queryRunner.dropForeignKey('toys', iotDeviceFk);
    }

    // Modificar columnas para permitir NULL
    await queryRunner.query(`
      ALTER TABLE "toys"
      ALTER COLUMN "userId" DROP NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "toys"
      ALTER COLUMN "iotDeviceId" DROP NOT NULL
    `);

    // Recrear las foreign keys con ON DELETE SET NULL
    await queryRunner.query(`
      ALTER TABLE "toys"
      ADD CONSTRAINT "FK_toys_userId"
      FOREIGN KEY ("userId")
      REFERENCES "users"("id")
      ON DELETE SET NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "toys"
      ADD CONSTRAINT "FK_toys_iotDeviceId"
      FOREIGN KEY ("iotDeviceId")
      REFERENCES "iot_devices"("id")
      ON DELETE SET NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar las foreign keys nuevas
    await queryRunner.dropForeignKey('toys', 'FK_toys_userId');
    await queryRunner.dropForeignKey('toys', 'FK_toys_iotDeviceId');

    // Revertir las columnas a NOT NULL (esto fallará si hay valores NULL)
    await queryRunner.query(`
      ALTER TABLE "toys"
      ALTER COLUMN "userId" SET NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "toys"
      ALTER COLUMN "iotDeviceId" SET NOT NULL
    `);

    // Recrear las foreign keys con ON DELETE CASCADE
    await queryRunner.query(`
      ALTER TABLE "toys"
      ADD CONSTRAINT "FK_toys_userId"
      FOREIGN KEY ("userId")
      REFERENCES "users"("id")
      ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "toys"
      ADD CONSTRAINT "FK_toys_iotDeviceId"
      FOREIGN KEY ("iotDeviceId")
      REFERENCES "iot_devices"("id")
      ON DELETE CASCADE
    `);
  }
}
