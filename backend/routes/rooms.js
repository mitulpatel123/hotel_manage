import Room from '../models/Room.js';
import Log from '../models/Log.js';
import auth from '../middleware/auth.js';
import IssueTitle from '../models/IssueTitle.js';
import Issue from '../models/Issue.js';

// Create room
router.post('/rooms', auth, async (req, res) => {
  try {
    const { number, type } = req.body;
    const room = new Room({ number, type });
    await room.save();

    // Create log with all required fields
    const log = new Log({
      action: 'create',
      target: 'room',
      targetId: room._id,
      roomId: room._id,
      userId: req.user._id,
      details: `Room ${number} added`
    });
    await log.save();

    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete room
router.delete('/rooms/:roomId', auth, async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    await Room.findByIdAndDelete(req.params.roomId);

    // Create log with all required fields
    const log = new Log({
      action: 'delete',
      target: 'room',
      targetId: room._id,
      roomId: room._id,
      userId: req.user._id,
      details: `Room ${room.number} deleted`
    });
    await log.save();

    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete category route
router.delete('/rooms/:roomId/titles/:titleId', auth, async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId);
    const category = await IssueTitle.findById(req.params.titleId);

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Delete all issues in this category first
    await Issue.deleteMany({ titleId: req.params.titleId });

    // Then delete the category
    await IssueTitle.findByIdAndDelete(req.params.titleId);

    // Create log with all required fields
    try {
      const log = new Log({
        action: 'delete',
        target: 'category',
        targetId: category._id,
        roomId: room._id,
        userId: req.user._id,
        details: `Deleted category "${category.title}" from room ${room.number}`
      });
      await log.save();
    } catch (logError) {
      console.warn('Warning: Failed to create log entry:', logError);
      // Don't let logging failure affect the response
    }

    return res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error in delete category route:', error);
    res.status(500).json({ message: 'Error processing request' });
  }
}); 