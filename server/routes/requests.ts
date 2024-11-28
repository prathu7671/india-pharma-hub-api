import express from 'express';
import { body, param, validationResult } from 'express-validator';
import { Request, RequestStatus } from '../models/Request';
import { Provider } from '../models/Provider';
import { Service } from '../models/Service';
import { UserRole } from '../models/User';
import { authenticateToken, authorizeRole } from '../middleware/auth';

const router = express.Router();

// Validation middleware
const requestValidation = [
  body('serviceId').isMongoId().withMessage('Valid service ID is required'),
  body('details').isObject().withMessage('Request details are required'),
  body('timeline').optional().trim(),
  body('budget').optional().trim()
];

const quoteValidation = [
  body('amount').isNumeric().withMessage('Quote amount is required'),
  body('currency').isString().withMessage('Currency is required'),
  body('validUntil').isISO8601().withMessage('Valid until date is required'),
  body('details').isString().withMessage('Quote details are required')
];

// Get requests for current user (buyer or provider)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const query = req.user.role === UserRole.PROVIDER
      ? { providerId: (await Provider.findOne({ userId: req.user.id }))._id }
      : { buyerId: req.user.id };

    const requests = await Request.find(query)
      .populate('buyerId', '-passwordHash')
      .populate('providerId')
      .populate('serviceId')
      .sort('-createdAt');

    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get request by ID
router.get('/:id', 
  authenticateToken,
  param('id').isMongoId(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const request = await Request.findById(req.params.id)
        .populate('buyerId', '-passwordHash')
        .populate('providerId')
        .populate('serviceId');

      if (!request) {
        return res.status(404).json({ error: 'Request not found' });
      }

      // Check if user has access to this request
      if (req.user.role === UserRole.PROVIDER) {
        const provider = await Provider.findOne({ userId: req.user.id });
        if (request.providerId.toString() !== provider._id.toString()) {
          return res.status(403).json({ error: 'Access denied' });
        }
      } else if (request.buyerId.toString() !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      res.json(request);
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
});

// Create request (buyer only)
router.post('/',
  authenticateToken,
  authorizeRole(UserRole.BUYER),
  requestValidation,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const service = await Service.findById(req.body.serviceId)
        .populate('providerId');
      
      if (!service) {
        return res.status(404).json({ error: 'Service not found' });
      }

      const request = new Request({
        buyerId: req.user.id,
        providerId: service.providerId,
        serviceId: service._id,
        details: req.body.details,
        timeline: req.body.timeline,
        budget: req.body.budget
      });

      await request.save();
      res.status(201).json(request);
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
});

// Submit quote (provider only)
router.post('/:id/quote',
  authenticateToken,
  authorizeRole(UserRole.PROVIDER),
  quoteValidation,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const provider = await Provider.findOne({ userId: req.user.id });
      const request = await Request.findById(req.params.id);

      if (!request) {
        return res.status(404).json({ error: 'Request not found' });
      }

      if (request.providerId.toString() !== provider._id.toString()) {
        return res.status(403).json({ error: 'Access denied' });
      }

      if (request.status !== RequestStatus.PENDING) {
        return res.status(400).json({ error: 'Request is not in pending state' });
      }

      request.quote = req.body;
      request.status = RequestStatus.QUOTED;
      await request.save();

      res.json(request);
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
});

// Accept/Reject quote (buyer only)
router.put('/:id/status',
  authenticateToken,
  authorizeRole(UserRole.BUYER),
  body('status').isIn([RequestStatus.ACCEPTED, RequestStatus.REJECTED]),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const request = await Request.findOne({
        _id: req.params.id,
        buyerId: req.user.id
      });

      if (!request) {
        return res.status(404).json({ error: 'Request not found' });
      }

      if (request.status !== RequestStatus.QUOTED) {
        return res.status(400).json({ error: 'Request is not in quoted state' });
      }

      request.status = req.body.status;
      await request.save();

      res.json(request);
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
});

// Add message to request
router.post('/:id/messages',
  authenticateToken,
  body('content').trim().notEmpty(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const request = await Request.findById(req.params.id);
      if (!request) {
        return res.status(404).json({ error: 'Request not found' });
      }

      // Check if user has access to this request
      if (req.user.role === UserRole.PROVIDER) {
        const provider = await Provider.findOne({ userId: req.user.id });
        if (request.providerId.toString() !== provider._id.toString()) {
          return res.status(403).json({ error: 'Access denied' });
        }
      } else if (request.buyerId.toString() !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      request.messages.push({
        sender: req.user.id,
        content: req.body.content
      });

      await request.save();
      res.json(request);
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
});

export default router;