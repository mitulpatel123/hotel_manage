import mongoose from 'mongoose';

const logSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: ['create', 'update', 'delete']
  },
  target: {
    type: String,
    enum: ['room', 'category', 'issue'],
    required: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
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

// Add this to help with debugging
logSchema.post('save', function(doc) {
  console.log('Log saved:', {
    action: doc.action,
    details: doc.details,
    createdAt: doc.createdAt
  });
});

const Log = mongoose.model('Log', logSchema);

export default Log;