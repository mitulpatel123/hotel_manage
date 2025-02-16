import express from 'express';
import { authenticateToken, isAdmin } from '../middleware/auth.js';
import Log from '../models/Log.js';
import User from '../models/User.js';

const router = express.Router();

// Get all logs (admin only)
router.get('/', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { action, user, startDate, endDate } = req.query;
    
    let query = {};
    
    // Apply filters
    if (action) query.action = action;
    if (user) {
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

    console.log('Fetching logs with query:', JSON.stringify(query, null, 2));
    
    const logs = await Log.find(query)
      .sort({ createdAt: -1 })
      .populate('userId', 'username')
      .lean();

    console.log('Found logs:', logs.length);
    console.log('Sample log:', JSON.stringify(logs[0], null, 2));
    
    const formattedLogs = logs.map(log => ({
      _id: log._id,
      action: log.action,
      details: log.details,
      performedBy: {
        _id: log.userId?._id || null,
        username: log.userId?.username || 'System'
      },
      timestamp: log.createdAt
    }));
    
    res.json(formattedLogs);
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ 
      message: 'Failed to fetch logs',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router; 