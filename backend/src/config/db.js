import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

// Initialize sequelize with env variables
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  String(process.env.DB_PASSWORD),  
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres', // Tells Sequelize PostgreSQL
    logging: false,       
    pool: {
      max: 50,          // Maximum number of active connection pipes to Postgres
      min: 10,          // Minimum number of idle connection pipes kept open
      acquire: 30000,   // Maximum time (ms) Sequelize will try to connect before throwing an error
      idle: 10000       // Time (ms) a connection can be idle before being released
    }
  }
);

export default sequelize;