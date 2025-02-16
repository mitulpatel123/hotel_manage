import mongoose from 'mongoose';

const issueSchema = new mongoose.Schema({
  titleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'IssueTitle',
    required: true
  },
  description: {
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

export default mongoose.model('Issue', issueSchema);