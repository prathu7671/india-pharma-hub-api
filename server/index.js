import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import { authenticateToken } from './middleware/auth.js';
import Provider from './models/Provider.js';
import Quote from './models/Quote.js';

dotenv.config();

const app = express();
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use(cors());
app.use(express.json());

// Auth routes
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/providers', authenticateToken);
app.use('/api/quotes', authenticateToken);

// Provider routes
app.post('/api/providers', async (req, res) => {
  try {
    const provider = new Provider({
      ...req.body,
      userId: req.user.id
    });
    await provider.save();
    res.json(provider);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/providers', async (req, res) => {
  try {
    const providers = await Provider.find({ isActive: true });
    res.json(providers);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Quote routes
app.post('/api/quotes', async (req, res) => {
  try {
    const quote = new Quote({
      ...req.body,
      buyerId: req.user.id
    });
    await quote.save();
    res.json(quote);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/quotes', async (req, res) => {
  try {
    const quotes = await Quote.find({
      $or: [{ buyerId: req.user.id }, { sellerId: req.user.id }]
    }).populate('providerId');
    res.json(quotes);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));