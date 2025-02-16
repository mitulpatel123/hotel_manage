// Update user role
router.put('/users/:userId/role', auth, async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findById(req.params.userId);
    
    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      { role },
      { new: true }
    );

    // Simple log with user management context
    const log = new Log({
      action: 'update',
      userId: req.user.id,
      details: `User Management: Changed ${user.username}'s role from ${user.role} to ${role}`,
      createdAt: new Date()
    });
    await log.save();

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update password
router.put('/users/:userId/password', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    user.password = hashedPassword;
    await user.save();

    // Simple log with user management context
    const log = new Log({
      action: 'update',
      userId: req.user.id,
      details: `User Management: Updated password for ${user.username}`,
      createdAt: new Date()
    });
    await log.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}); 