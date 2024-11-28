import express from 'express';
import { body, param, validationResult } from 'express-validator';
import { Provider } from '../models/Provider';
import { User, UserRole } from '../models/User';
import { authenticateToken, authorizeRole } from '../middleware/auth';

const router = express.Router();

// Validation middleware
const providerValidation = [
  body('name').trim().notEmpty().withMessage('Provider name is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('certifications').isArray(),
  body('contact.phone').optional().matches(/^\+?[\d\s-]+$/),
  body('contact.email').optional().isEmail(),
  body('contact.website').optional().isURL()
];

// Get all providers (public)
router.get('/', async (req, res) => {
  try {
    const providers = await Provider.find({ approved: true })
      .populate('services')
      .sort('-createdAt');
    res.json(providers);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get provider by ID (public)
router.get('/:id', param('id').isMongoId(), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const provider = await Provider.findById(req.params.id)
      .populate('services')
      .populate('userId', '-passwordHash');
      
    if (!provider) {
      return res.status(404).json({ error: 'Provider not found' });
    }

    res.json(provider);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create provider profile (authenticated provider only)
router.post('/', 
  authenticateToken,
  authorizeRole(UserRole.PROVIDER),
  providerValidation,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const existingProvider = await Provider.findOne({ userId: req.user.id });
      if (existingProvider) {
        return res.status(400).json({ error: 'Provider profile already exists' });
      }

      const provider = new Provider({
        userId: req.user.id,
        ...req.body
      });

      await provider.save();

      // Update user's profileComplete status
      await User.findByIdAndUpdate(req.user.id, { profileComplete: true });

      res.status(201).json(provider);
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
});

// Update provider profile (authenticated provider only)
router.put('/:id',
  authenticateToken,
  authorizeRole(UserRole.PROVIDER),
  providerValidation,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const provider = await Provider.findOne({
        _id: req.params.id,
        userId: req.user.id
      });

      if (!provider) {
        return res.status(404).json({ error: 'Provider not found' });
      }

      Object.assign(provider, req.body);
      await provider.save();

      res.json(provider);
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
});

// Admin routes
router.put('/:id/approve',
  authenticateToken,
  authorizeRole(UserRole.ADMIN),
  async (req, res) => {
    try {
      const provider = await Provider.findByIdAndUpdate(
        req.params.id,
        { approved: true },
        { new: true }
      );

      if (!provider) {
        return res.status(404).json({ error: 'Provider not found' });
      }

      res.json(provider);
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
});

router.put('/:id/feature',
  authenticateToken,
  authorizeRole(UserRole.ADMIN),
  async (req, res) => {
    try {
      const provider = await Provider.findByIdAndUpdate(
        req.params.id,
        { featured: req.body.featured },
        { new: true }
      );

      if (!provider) {
        return res.status(404).json({ error: 'Provider not found' });
      }

      res.json(provider);
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
});

export default router;