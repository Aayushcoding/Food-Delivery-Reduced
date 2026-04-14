////config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/food-delivery';
  const conn = await mongoose.connect(uri);

    console.log(`✅ MongoDB connected: ${conn.connection.host}`);

    // ── Drop the old single-field email unique index if it still exists.
    // This is needed because the User model now uses a compound [email, role]
    // index instead of a unique email index. Without dropping the old index,
    // MongoDB will reject same-email registrations with different roles.
    try {
      const usersCollection = conn.connection.db.collection('users');
      const indexes = await usersCollection.indexes();
      const hasOldEmailIndex = indexes.some(
        (idx) => idx.name === 'email_1' && idx.unique === true
      );
      if (hasOldEmailIndex) {
        await usersCollection.dropIndex('email_1');
        console.log('🔧 Dropped old unique email index — compound [email+role] index now active.');
      }
    } catch (indexErr) {
      // Not fatal — index may not exist on fresh installs
      console.warn('⚠️  Index cleanup skipped:', indexErr.message);
    }

  } catch (error) {
    console.error(`❌ MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;