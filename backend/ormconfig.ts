import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

export default new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  username: process.env.DATABASE_USERNAME || 'nebu_user',
  password: process.env.DATABASE_PASSWORD || 'nebu_password_2024!',
  database: process.env.DATABASE_NAME || 'nebu_db',
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/database/migrations/*.ts'],
  migrationsTableName: 'migrations_history',
  synchronize: true, // TypeORM crea/actualiza tablas automáticamente desde entities
  logging: process.env.NODE_ENV === 'development',
});
