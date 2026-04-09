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

    // Automatically drop legacy index if it exists to prevent E11000 duplicate key errors
    try {
      const db = mongoose.connection.db;
      const collections = await db.collections();
      const studentsCol = collections.find(c => c.collectionName === 'students');
      if (studentsCol) {
        const indexes = await studentsCol.indexes();
        if (indexes.find(i => i.name === 'enrollmentId_1')) {
          await studentsCol.dropIndex('enrollmentId_1');
          console.log('Dropped legacy enrollmentId_1 index from students collection');
        }
      }
    } catch (indexError) {
      console.log('Could not verify/drop legacy index:', indexError.message);
    }

  } catch (error) {
    console.error('MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
