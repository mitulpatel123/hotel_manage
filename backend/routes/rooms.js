import Room from '../models/Room.js';
import Log from '../models/Log.js';
import auth from '../middleware/auth.js';

// Create room
router.post('/rooms', auth, async (req, res) => {
  try {
    const { number, type } = req.body;
    const room = new Room({ number, type });
    await room.save();

    // Simple log
    const log = new Log({
      action: 'create',
      userId: req.user.id,
      details: `Room ${number} added`,
      createdAt: new Date()
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

    // Simple log
    const log = new Log({
      action: 'delete',
      userId: req.user.id,
      details: `Room ${room.number} deleted`,
      createdAt: new Date()
    });
    await log.save();

    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}); 