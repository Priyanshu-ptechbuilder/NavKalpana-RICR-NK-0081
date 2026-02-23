const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = (process.env.MONGO_URI || process.env.MONGODB_URI || '').trim();
  if (!uri || (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://'))) {
    console.error('MongoDB Connection Error: MONGO_URI in .env must start with mongodb:// or mongodb+srv://');
    process.exit(1);
  }
  try {
    await mongoose.connect(uri);
    console.log('MongoDB Connected Successfully');
  } catch (error) {
    console.error('MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
