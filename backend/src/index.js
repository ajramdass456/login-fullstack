import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

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
app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});
