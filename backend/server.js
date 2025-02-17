// File: backend/server.js

import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import logsRouter from './routes/logs.js';

// Import models
import User from './models/User.js';
import Room from './models/Room.js';
import Issue from './models/Issue.js';
import Log from './models/Log.js';
import IssueTitle from './models/IssueTitle.js';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: [process.env.FRONTEND_URL || 'http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));
app.use(express.json());

// MongoDB connection with retry logic
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hotel_management', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid token' });
      }
      req.user = decoded;
      next();
    });
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ message: 'Authentication error' });
  }
};

// Admin Middleware
const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(500).json({ message: 'Server error checking admin status' });
  }
};

// PIN verification middleware
const verifyPin = async (req, res, next) => {
  const pin = req.headers['x-view-pin'];
  
  if (!pin) {
    return res.status(401).json({ message: 'PIN required' });
  }

  const VALID_PIN = '47123';
  
  if (pin === VALID_PIN) {
    next();
  } else {
    res.status(401).json({ message: 'Invalid PIN' });
  }
};

// Basic health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// PIN Authentication
app.post('/api/auth/pin', (req, res) => {
  const { pin } = req.body;
  if (pin && pin.trim() === '47123') {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, message: 'Invalid PIN' });
  }
});

// PIN verification endpoint
app.post('/api/verify-pin', (req, res) => {
  const { pin } = req.body;
  
  const VALID_PIN = '47123';
  
  if (pin === VALID_PIN) {
    res.json({ message: 'PIN verified' });
  } else {
    res.status(401).json({ message: 'Invalid PIN' });
  }
});

// Auth Routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// User Management Routes
app.get('/api/users', authenticateToken, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/users', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { username, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = new User({
      username,
      password: hashedPassword,
      role
    });

    await user.save();
    
    // Log the action
    await createLog(
      'create_user',
      `Created user: ${username} with role: ${role}`,
      req.user.id,
      'user',
      user._id,
      null // no roomId
    );

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/users/:id/password', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { password } = req.body;
    const userId = req.params.id;

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user's password
    await User.findByIdAndUpdate(userId, { password: hashedPassword });

    // Log the action
    await createLog(
      'update_password',
      `Updated password for user ID: ${userId}`,
      req.user.id,
      'user',
      userId,
      null
    );

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/users/:id/role', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    const userId = req.params.id;

    // Check if trying to change own role
    if (userId === req.user.id) {
      return res.status(400).json({ message: 'Cannot change your own role' });
    }

    // Update user's role
    await User.findByIdAndUpdate(userId, { role });

    // Log the action
    await createLog(
      'update_role',
      `Updated role to ${role} for user ID: ${userId}`,
      req.user.id,
      'user',
      userId,
      null
    );

    res.json({ message: 'Role updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/users/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const userId = req.params.id;

    // Check if trying to delete own account
    if (userId === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete the user
    await User.findByIdAndDelete(userId);

    // Log the action
    await createLog(
      'delete_user',
      `Deleted user: ${user.username}`,
      req.user.id,
      'user',
      userId,
      null
    );

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Room Management Routes
app.get('/api/rooms', async (req, res) => {
  try {
    const pin = req.headers['x-view-pin'];
    const authHeader = req.headers['authorization'];

    // If neither PIN nor auth token is provided, return 401
    if (!pin && !authHeader) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // If PIN is provided, verify it
    if (pin) {
      const VALID_PIN = '47123';
      if (pin !== VALID_PIN) {
        return res.status(401).json({ message: 'Invalid PIN' });
      }
    }

    // If auth token is provided, verify it
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: 'Invalid token' });
      }
      try {
        jwt.verify(token, process.env.JWT_SECRET);
      } catch (err) {
        return res.status(401).json({ message: 'Invalid token' });
      }
    }

    const rooms = await Room.find().sort('number');
    res.json(rooms);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/rooms/:roomId', async (req, res) => {
  try {
    const pin = req.headers['x-view-pin'];
    const authHeader = req.headers['authorization'];

    if (!pin && !authHeader) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (pin) {
      const VALID_PIN = '47123';
      if (pin !== VALID_PIN) {
        return res.status(401).json({ message: 'Invalid PIN' });
      }
    }

    if (authHeader) {
      const token = authHeader.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: 'Invalid token' });
      }
      try {
        jwt.verify(token, process.env.JWT_SECRET);
      } catch (err) {
        return res.status(401).json({ message: 'Invalid token' });
      }
    }

    const room = await Room.findById(req.params.roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.json(room);
  } catch (error) {
    console.error('Error fetching room:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/rooms/:roomId/titles', async (req, res) => {
  try {
    const pin = req.headers['x-view-pin'];
    const authHeader = req.headers['authorization'];

    if (!pin && !authHeader) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (pin) {
      const VALID_PIN = '47123';
      if (pin !== VALID_PIN) {
        return res.status(401).json({ message: 'Invalid PIN' });
      }
    }

    if (authHeader) {
      const token = authHeader.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: 'Invalid token' });
      }
      try {
        jwt.verify(token, process.env.JWT_SECRET);
      } catch (err) {
        return res.status(401).json({ message: 'Invalid token' });
      }
    }

    // First check if the room exists
    const room = await Room.findById(req.params.roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Then fetch titles with populated issues
    const titles = await IssueTitle.find({ roomId: req.params.roomId })
      .populate({
        path: 'issues',
        populate: { 
          path: 'createdBy',
          select: 'username'
        }
      });

    res.json(titles);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/rooms', authenticateToken, async (req, res) => {
  try {
    const { number, type } = req.body;

    // Validate required fields
    if (!number || !type) {
      return res.status(400).json({ message: 'Room number and type are required' });
    }

    // Check for duplicate room number
    const existingRoom = await Room.findOne({ number });
    if (existingRoom) {
      return res.status(400).json({ message: 'Room number already exists' });
    }

    const room = new Room({
      number,
      type,
      status: 'available'
    });

    await room.save();

    // Log the action
    await createLog(
      'create_room',
      `Added room ${number}`,
      req.user.id,
      'room',
      room._id,
      room._id
    );

    res.status(201).json(room);
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/rooms/:id', authenticateToken, async (req, res) => {
  try {
    const { number, type } = req.body;
    
    if (!/^\d{3}$/.test(number)) {
      return res.status(400).json({ message: 'Room number must be 3 digits' });
    }

    const room = await Room.findByIdAndUpdate(
      req.params.id,
      { 
        number,
        type,
        floor: Math.floor(parseInt(number) / 100)
      },
      { new: true }
    );

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Log room update
    await createLog(
      'update_room',
      `Updated room ${number}`,
      req.user.id,
      'room',
      room._id,
      room._id
    );

    res.json(room);
  } catch (error) {
    console.error('Error updating room:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/rooms/:id', authenticateToken, async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Log room deletion
    await createLog(
      'delete_room',
      `Deleted room ${room.number}`,
      req.user.id,
      'room',
      room._id,
      room._id
    );

    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    console.error('Error deleting room:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Issue Title Management Routes
app.get('/api/rooms/:roomId/titles', authenticateToken, async (req, res) => {
  try {
    const titles = await IssueTitle.find({ roomId: req.params.roomId })
      .populate('createdBy', 'username')
      .sort('-createdAt');
    res.json(titles);
  } catch (error) {
    console.error('Error fetching issue titles:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/rooms/:roomId/titles', authenticateToken, async (req, res) => {
  try {
    const { title } = req.body;
    const roomId = req.params.roomId;

    // Verify room exists
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    const issueTitle = new IssueTitle({
      roomId,
      title,
      createdBy: req.user.id
    });

    await issueTitle.save();

    const populatedTitle = await IssueTitle.findById(issueTitle._id)
      .populate('createdBy', 'username');

    res.status(201).json(populatedTitle);
  } catch (error) {
    console.error('Error creating issue title:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/rooms/:roomId/titles/:titleId', authenticateToken, async (req, res) => {
  try {
    const { title } = req.body;
    const updatedTitle = await IssueTitle.findByIdAndUpdate(
      req.params.titleId,
      { title },
      { new: true }
    ).populate('createdBy', 'username');

    if (!updatedTitle) {
      return res.status(404).json({ message: 'Title not found' });
    }

    res.json(updatedTitle);
  } catch (error) {
    console.error('Error updating issue title:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/rooms/:roomId/titles/:titleId', authenticateToken, async (req, res) => {
  try {
    // First verify the title exists and belongs to the room
    const title = await IssueTitle.findOne({
      _id: req.params.titleId,
      roomId: req.params.roomId
    });

    if (!title) {
      return res.status(404).json({ message: 'Title not found or does not belong to this room' });
    }

    // Delete all issues under this title first
    await Issue.deleteMany({ titleId: req.params.titleId });
    
    // Then delete the title
    await IssueTitle.findByIdAndDelete(req.params.titleId);

    // Log the action
    await createLog(
      'delete_title',
      `Deleted title "${title.title}" and its issues`,
      req.user.id,
      'category',
      req.params.titleId,
      req.params.roomId
    );

    res.json({ message: 'Title and associated issues deleted successfully' });
  } catch (error) {
    console.error('Error deleting issue title:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
    });
  }
});

// Issue Management Routes
app.get('/api/rooms/:roomId/titles/:titleId/issues', authenticateToken, async (req, res) => {
  try {
    const issues = await Issue.find({ titleId: req.params.titleId })
      .populate('createdBy', 'username')
      .sort('-createdAt');
    res.json(issues);
  } catch (error) {
    console.error('Error fetching issues:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/rooms/:roomId/titles/:titleId/issues', authenticateToken, async (req, res) => {
  try {
    const { description } = req.body;

    // Get room and title info
    const [room, issueTitle] = await Promise.all([
      Room.findById(req.params.roomId),
      IssueTitle.findById(req.params.titleId)
    ]);

    if (!room || !issueTitle) {
      return res.status(404).json({ message: 'Room or title not found' });
    }

    const issue = new Issue({
      titleId: req.params.titleId,
      description,
      createdBy: req.user.id
    });
    await issue.save();

    // Create detailed log
    await createLog(
      'create_issue',
      `Room ${room.number}: Created issue "${description}" under title "${issueTitle.title}"`,
      req.user.id,
      'issue',
      issue._id,
      room._id
    );

    res.status(201).json(issue);
  } catch (error) {
    console.error('Error creating issue:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/rooms/:roomId/titles/:titleId/issues/:issueId', authenticateToken, async (req, res) => {
  try {
    const { description } = req.body;

    // Get all required information
    const [room, issueTitle, currentIssue] = await Promise.all([
      Room.findById(req.params.roomId),
      IssueTitle.findById(req.params.titleId),
      Issue.findById(req.params.issueId)
    ]);

    if (!currentIssue || !room || !issueTitle) {
      return res.status(404).json({ message: 'Issue, room, or title not found' });
    }

    const updatedIssue = await Issue.findByIdAndUpdate(
      req.params.issueId,
      { description },
      { new: true }
    );

    // Create detailed log
    await createLog(
      'update_issue',
      `Room ${room.number}: Updated issue under "${issueTitle.title}" from "${currentIssue.description}" to "${description}"`,
      req.user.id,
      'issue',
      updatedIssue._id,
      room._id
    );

    res.json(updatedIssue);
  } catch (error) {
    console.error('Error updating issue:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/rooms/:roomId/titles/:titleId/issues/:issueId', authenticateToken, async (req, res) => {
  try {
    // Get all required information first
    const [room, issueTitle, issue] = await Promise.all([
      Room.findById(req.params.roomId),
      IssueTitle.findById(req.params.titleId),
      Issue.findById(req.params.issueId)
    ]);

    if (!issue || !room || !issueTitle) {
      return res.status(404).json({ message: 'Issue, room, or title not found' });
    }

    await Issue.findByIdAndDelete(req.params.issueId);

    // Create detailed log
    await createLog(
      'delete_issue',
      `Room ${room.number}: Deleted issue "${issue.description}" from title "${issueTitle.title}"`,
      req.user.id,
      'issue',
      issue._id,
      room._id
    );

    res.json({ message: 'Issue deleted successfully' });
  } catch (error) {
    console.error('Error deleting issue:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Logs Routes
app.use('/api/logs', logsRouter);

/**
 * CREATE LOG HELPER
 *
 * Now accepts additional arguments:
 *   - target: 'room' | 'category' | 'issue' | 'user'
 *   - targetId: a mongoose ObjectId
 *   - roomId: a mongoose ObjectId (or null)
 */
const createLog = async (action, details, userId, target, targetId, roomId) => {
  try {
    if (!userId) {
      // Silent fail or proper error handling without logging sensitive data
      return;
    }

    const log = new Log({
      action,
      target,
      targetId,
      roomId,
      userId,
      details,
      createdAt: new Date()
    });

    await log.save();
    return log;
  } catch (error) {
    // Log only non-sensitive error information
    console.error('Error creating log entry');
  }
};

// Connect to database and start server
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
