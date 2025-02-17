import express from 'express';
import { authenticateToken, isAdmin } from '../middleware/auth.js';
import Log from '../models/Log.js';
import User from '../models/User.js';

const router = express.Router();

// GET /api/logs - Admin only
router.get('/', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { action, user, startDate, endDate } = req.query;
    const query = {};

    // Optional filters:
    if (action) {
      query.action = action;
    }
    if (user) {
      // Filter by matching username
      const userRegex = new RegExp(user, 'i');
      const matchingUsers = await User.find({ username: userRegex }).select('_id');
      const userIds = matchingUsers.map(u => u._id);
      query.userId = { $in: userIds };
    }
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        query.createdAt.$lte = endDateTime;
      }
    }

    // Populate only the 'username' field from userId
    const logs = await Log.find(query)
      .sort({ createdAt: -1 })
      .populate('userId', 'username')
      .lean();

    // Return only the fields we care about
    const formattedLogs = logs.map(log => ({
      _id: log._id, // or remove if you don't want the log's own MongoDB ID
      action: log.action, // e.g. "create" / "update" / "delete"
      details: log.details, // e.g. "Deleted issue 'Broken A/C' from 'HVAC'"
      performedBy: {
        username: log.userId?.username || 'System'
      },
      timestamp: log.createdAt
    }));

    res.json(formattedLogs);
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ message: 'Failed to fetch logs' });
  }
});

export default router;
