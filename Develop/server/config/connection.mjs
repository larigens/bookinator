import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config(); // To use environment variables.

mongoose.set('strictQuery', false);

// Wrap Mongoose around local connection to MongoDB.
mongoose.connect(process.env.MONGODB_URI || process.env.MONGODB_LOCAL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Export connection 
export default mongoose.connection;