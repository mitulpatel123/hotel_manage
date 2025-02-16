import mongoose from 'mongoose';

const issueTitleSchema = new mongoose.Schema({
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add this to ensure title is always populated
issueTitleSchema.pre('find', function() {
  this.populate('roomId');
});

issueTitleSchema.pre('findOne', function() {
  this.populate('roomId');
});

// Virtual for populating issues
issueTitleSchema.virtual('issues', {
  ref: 'Issue',
  localField: '_id',
  foreignField: 'titleId'
});

// Always include virtuals
issueTitleSchema.set('toJSON', { virtuals: true });
issueTitleSchema.set('toObject', { virtuals: true });

export default mongoose.model('IssueTitle', issueTitleSchema);
