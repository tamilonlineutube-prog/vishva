const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✓ MongoDB connected successfully`);
    console.log(`  Host: ${conn.connection.host}`);
    console.log(`  Port: ${conn.connection.port}`);
    console.log(`  Database: ${conn.connection.name}`);

    return conn;
  } catch (error) {
    console.error(`✗ MongoDB connection failed`);
    console.error(`  Error: ${error.message}`);

    if (error.message.includes('ECONNREFUSED')) {
      console.error(`\n  💡 Tip: Make sure MongoDB is running:`);
      console.error(`     Windows: mongod`);
      console.error(`     Or use MongoDB Atlas connection string\n`);
    }

    process.exit(1);
  }
};

module.exports = connectDB;
