import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import sequelize from './config/db.js';
import redisClient from './config/redisClient.js'

const PORT = process.env.PORT || 5000;
const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000', 
  credentials: true 
})); 

app.use(express.json()); 
app.use(cookieParser());

// Base Test Route
app.get('/', (req, res) => {
  res.send('Backend Server is Online!');
});

app.get('/api/test', (req, res) => {
  res.json({ message: "Hello from the backend server!" });
});

// Start Server

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    await sequelize.sync({ alter: true });  //remove alter:true after deployment
    
    console.log('Database tables synchronized.');

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error('Unable to connect to database:', error);
    process.exit(1); // Stop the app if the database connection fails
  }
};

startServer();