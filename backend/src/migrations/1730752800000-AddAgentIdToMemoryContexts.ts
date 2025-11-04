import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey, TableIndex } from 'typeorm';

export class AddAgentIdToMemoryContexts1730752800000 implements MigrationInterface {
  name = 'AddAgentIdToMemoryContexts1730752800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Agregar columna agentId
    await queryRunner.addColumn(
      'memory_contexts',
      new TableColumn({
        name: 'agentId',
        type: 'uuid',
        isNullable: true,
      })
    );

    // Crear índice simple para agentId
    await queryRunner.createIndex(
      'memory_contexts',
      new TableIndex({
        name: 'IDX_memory_contexts_agentId',
        columnNames: ['agentId'],
      })
    );

    // Crear índice compuesto para userId + agentId + memoryType
    await queryRunner.createIndex(
      'memory_contexts',
      new TableIndex({
        name: 'IDX_memory_contexts_userId_agentId_memoryType',
        columnNames: ['userId', 'agentId', 'memoryType'],
      })
    );

    // Agregar foreign key constraint
    await queryRunner.createForeignKey(
      'memory_contexts',
      new TableForeignKey({
        name: 'FK_memory_contexts_agentId',
        columnNames: ['agentId'],
        referencedTableName: 'agents',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar foreign key
    await queryRunner.dropForeignKey('memory_contexts', 'FK_memory_contexts_agentId');

    // Eliminar índice compuesto
    await queryRunner.dropIndex('memory_contexts', 'IDX_memory_contexts_userId_agentId_memoryType');

    // Eliminar índice simple
    await queryRunner.dropIndex('memory_contexts', 'IDX_memory_contexts_agentId');

    // Eliminar columna
    await queryRunner.dropColumn('memory_contexts', 'agentId');
  }
}
