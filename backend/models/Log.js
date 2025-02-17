// File: backend/models/Log.js

import mongoose from 'mongoose';

const logSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    // Only allow create / update / delete in DB
    enum: ['create', 'update', 'delete']
  },
  target: {
    type: String,
    // Add "user" as a valid target so user actions also pass validation
    enum: ['room', 'category', 'issue', 'user'],
    required: true
  },
  // These two no longer strictly required, because sometimes you are logging user actions
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  details: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Option 2: Minimal logging for development
logSchema.post('save', function(doc) {
  if (process.env.NODE_ENV !== 'production') {
    console.log('Log created:', {
      action: doc.action,
      target: doc.target,
      timestamp: doc.createdAt
    });
  }
});

const Log = mongoose.model('Log', logSchema);

export default Log;
