const router = require('express').Router();
const User = require('../models/User');
const Score = require('../models/Score');
const auth = require('../middleware/auth');

// Middleware admin check
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });
  next();
};

// GET all users
router.get('/users', auth, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// PUT edit user
router.put('/users/:id', auth, adminOnly, async (req, res) => {
  try {
    const { username, email, role } = req.body;
    await User.findByIdAndUpdate(req.params.id, { username, email, role });
    res.json({ message: 'User updated' });
  } catch (err) {
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// DELETE user
router.delete('/users/:id', auth, adminOnly, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    await Score.deleteMany({ userId: req.params.id });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error del servidor' });
  }
});

module.exports = router;
