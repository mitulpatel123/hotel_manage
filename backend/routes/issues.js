import Title from '../models/Title.js';
import Issue from '../models/Issue.js';
import Log from '../models/Log.js';
import Room from '../models/Room.js';
import IssueTitle from '../models/IssueTitle.js';

// Update issue
router.put('/rooms/:roomId/titles/:titleId/issues/:issueId', auth, async (req, res) => {
  try {
    const { description } = req.body;
    
    // Get all required information
    const [room, issueTitle, currentIssue] = await Promise.all([
      Room.findById(req.params.roomId),
      IssueTitle.findById(req.params.titleId),
      Issue.findById(req.params.issueId)
    ]);

    if (!room || !issueTitle || !currentIssue) {
      return res.status(404).json({ message: 'Room, title, or issue not found' });
    }

    const updatedIssue = await Issue.findByIdAndUpdate(
      req.params.issueId,
      { description },
      { new: true }
    );

    // Create log with full context
    const logDetails = `Room ${room.number}: Updated issue under "${issueTitle.title}" from "${currentIssue.description}" to "${description}"`;
    console.log('Creating log:', logDetails); // Debug log

    const log = new Log({
      action: 'update',
      userId: req.user.id,
      details: logDetails,
      createdAt: new Date()
    });
    await log.save();

    res.json({
      issue: updatedIssue,
      room: room.number,
      title: issueTitle.title
    });
  } catch (error) {
    console.error('Error updating issue:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create issue
router.post('/rooms/:roomId/titles/:titleId/issues', auth, async (req, res) => {
  try {
    const { description } = req.body;
    
    // Get room and title info for the log
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

    // Create log with full context
    const logDetails = `Room ${room.number}: Created issue "${description}" under title "${issueTitle.title}"`;
    console.log('Creating log:', logDetails); // Debug log

    const log = new Log({
      action: 'create',
      userId: req.user.id,
      details: logDetails,
      createdAt: new Date()
    });
    await log.save();

    res.status(201).json({
      issue,
      room: room.number,
      title: issueTitle.title
    });
  } catch (error) {
    console.error('Error creating issue:', error);
    res.status(500).json({ message: error.message });
  }
});

// Delete issue
router.delete('/rooms/:roomId/titles/:titleId/issues/:issueId', auth, async (req, res) => {
  try {
    // Get all required information
    const [room, issueTitle, issue] = await Promise.all([
      Room.findById(req.params.roomId),
      IssueTitle.findById(req.params.titleId),
      Issue.findById(req.params.issueId)
    ]);

    if (!issue || !room || !issueTitle) {
      return res.status(404).json({ message: 'Issue, room, or title not found' });
    }

    await Issue.findByIdAndDelete(req.params.issueId);

    // Create log with full context
    const logDetails = `Room ${room.number}: Deleted issue "${issue.description}" from title "${issueTitle.title}"`;
    console.log('Creating log:', logDetails); // Debug log

    const log = new Log({
      action: 'delete',
      userId: req.user.id,
      details: logDetails,
      createdAt: new Date()
    });
    await log.save();

    res.json({ 
      message: 'Issue deleted successfully',
      room: room.number,
      title: issueTitle.title
    });
  } catch (error) {
    console.error('Error deleting issue:', error);
    res.status(500).json({ message: error.message });
  }
}); 