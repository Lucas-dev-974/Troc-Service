import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { Offer } from '../entities/Offer';
import { User } from '../entities/User';

config();

export const AppDataSource = new DataSource({
  type: 'better-sqlite3',
  database: process.env.DB_PATH || 'database.sqlite',
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  entities: [User, Offer],
  migrations: ['src/migrations/**/*.ts'],
  subscribers: ['src/subscribers/**/*.ts'],
});

