import express from 'express';
import { body, param, validationResult } from 'express-validator';
import { Service } from '../models/Service';
import { Provider } from '../models/Provider';
import { UserRole } from '../models/User';
import { authenticateToken, authorizeRole } from '../middleware/auth';

const router = express.Router();

// Validation middleware
const serviceValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('subcategory').optional().trim(),
  body('pricing').optional().isObject(),
  body('timeline').optional().trim(),
  body('requirements').optional().isArray()
];

// Get all services (public)
router.get('/', async (req, res) => {
  try {
    const { category, subcategory } = req.query;
    const query: any = {};

    if (category) query.category = category;
    if (subcategory) query.subcategory = subcategory;

    const services = await Service.find(query)
      .populate('providerId')
      .sort('-createdAt');
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get service by ID (public)
router.get('/:id', param('id').isMongoId(), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const service = await Service.findById(req.params.id)
      .populate('providerId');
      
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    res.json(service);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create service (authenticated provider only)
router.post('/',
  authenticateToken,
  authorizeRole(UserRole.PROVIDER),
  serviceValidation,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const provider = await Provider.findOne({ userId: req.user.id });
      if (!provider) {
        return res.status(404).json({ error: 'Provider profile not found' });
      }

      const service = new Service({
        ...req.body,
        providerId: provider._id
      });

      await service.save();

      // Add service to provider's services array
      provider.services.push(service._id);
      await provider.save();

      res.status(201).json(service);
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
});

// Update service (authenticated provider only)
router.put('/:id',
  authenticateToken,
  authorizeRole(UserRole.PROVIDER),
  serviceValidation,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const provider = await Provider.findOne({ userId: req.user.id });
      if (!provider) {
        return res.status(404).json({ error: 'Provider profile not found' });
      }

      const service = await Service.findOne({
        _id: req.params.id,
        providerId: provider._id
      });

      if (!service) {
        return res.status(404).json({ error: 'Service not found' });
      }

      Object.assign(service, req.body);
      await service.save();

      res.json(service);
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
});

// Delete service (authenticated provider only)
router.delete('/:id',
  authenticateToken,
  authorizeRole(UserRole.PROVIDER),
  async (req, res) => {
    try {
      const provider = await Provider.findOne({ userId: req.user.id });
      if (!provider) {
        return res.status(404).json({ error: 'Provider profile not found' });
      }

      const service = await Service.findOneAndDelete({
        _id: req.params.id,
        providerId: provider._id
      });

      if (!service) {
        return res.status(404).json({ error: 'Service not found' });
      }

      // Remove service from provider's services array
      provider.services = provider.services.filter(
        (s) => s.toString() !== req.params.id
      );
      await provider.save();

      res.json({ message: 'Service deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
});

export default router;