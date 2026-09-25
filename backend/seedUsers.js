import dotenv from 'dotenv';
dotenv.config({ path: '../.env' }); 

import sequelize from './src/config/db.js';
import User from './src/models/userModel.js';
import bcrypt from 'bcrypt';

async function seedOneMillionUsers() {
  try {
    // 1. Connect to PostgreSQL
    await sequelize.authenticate();
    console.log("Synchronizing database tables...");
    await sequelize.sync({ force:true }); // Creates the "users" table safely
    console.log("Database tables ready.");
    
    // 2. High-Traffic Optimization: Hash the password ONCE outside the loop.
    const plainPassword = "TestPassword123!";
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    console.log("Password pre-hashed. Starting bulk insert...");

    const TOTAL_USERS = 1000000;
    const BATCH_SIZE = 10000; // Insert in chunks of 10k so Node doesn't run out of memory
    let batch = [];

    const startTime = Date.now();

    for (let i = 1; i <= TOTAL_USERS; i++) {
      batch.push({
        username: `testuser_${i}`,
        password: hashedPassword
      });

      // When the batch reaches 10,000 records, dump it into Postgres asynchronously
      if (batch.length === BATCH_SIZE || i === TOTAL_USERS) {
        await User.bulkCreate(batch, { hooks: false, logging: false });
        
        const percentage = ((i / TOTAL_USERS) * 100).toFixed(0);
        console.log(`Progress: ${i} / ${TOTAL_USERS} users injected (${percentage}%)`);
        
        batch = []; // Clear the memory stack for the next batch
      }
    }

    const endTime = Date.now();
    const totalTimeSeconds = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log(`\n🎉 SUCCESS! 1,000,000 mock users injected into PostgreSQL in ${totalTimeSeconds} seconds.`);
    console.log(`All accounts have the password: "${plainPassword}"`);
    console.log(`Usernames range from "testuser_1" to "testuser_1000000"`);
    
    process.exit(0);

  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seedOneMillionUsers();
