// Load environment variables
import "dotenv/config";

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize from './db.js';
//// import './models/user.js';

const PORT = process.env.PORT || 5000;
const app = express();

// Middleware
app.use(cors());          // Allows your frontend to connect
app.use(express.json());  // Allows your server to accept JSON data (like login info)

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
    // Step 1: Test the connection
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Step 2: Build/sync the tables
    // Use { alter: true } during development so it safely updates tables if you edit your models
    await sequelize.sync({ alter: true });
    console.log('Database tables synchronized.');

    // Step 3: Start the server only after the DB is fully ready
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error('Unable to connect to database:', error);
    process.exit(1); // Stop the app if the database connection fails
  }
};

startServer();