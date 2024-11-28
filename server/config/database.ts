import mongoose from 'mongoose';

const connectOptions: mongoose.ConnectOptions = {
  autoIndex: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  retryWrites: true,
  w: 'majority'
};

export const initializeDatabase = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    
    if (!MONGODB_URI) {
      throw new Error('MongoDB URI is not defined in environment variables');
    }

    await mongoose.connect(MONGODB_URI, connectOptions);
    
    console.log('MongoDB connected successfully');
    
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected successfully');
    });

  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
};