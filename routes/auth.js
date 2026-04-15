const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

// Registro
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Usuario o email ya existe' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: 'Usuario registrado correctamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Credenciales incorrectas' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ message: 'Credenciales incorrectas' });

    user.lastLogin = Date.now();
    await user.save();

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, username: user.username, avatar: user.avatar });
  } catch (err) {
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Perfil
router.get('/profile', require('../middleware/auth'), async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error del servidor' });
  }
});

module.exports = router;

// Editar perfil
router.put('/profile', require('../middleware/auth'), async (req, res) => {
  try {
    const { username, email } = req.body;
    await User.findByIdAndUpdate(req.user.id, { username, email });
    res.json({ message: 'Perfil actualizado' });
  } catch (err) {
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Actualizar avatar
router.put('/avatar', require('../middleware/auth'), async (req, res) => {
  try {
    const { avatar } = req.body;
    await User.findByIdAndUpdate(req.user.id, { avatar });
    res.json({ message: 'Avatar actualizado' });
  } catch (err) {
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Editar contraseña
router.put('/password', require('../middleware/auth'), async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return res.status(400).json({ message: 'Contraseña actual incorrecta' });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: 'Contraseña actualizada' });
  } catch (err) {
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Eliminar cuenta
router.delete('/profile', require('../middleware/auth'), async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.id);
    res.json({ message: 'Cuenta eliminada' });
  } catch (err) {
    res.status(500).json({ message: 'Error del servidor' });
  }
});
