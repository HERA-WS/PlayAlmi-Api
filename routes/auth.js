const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
require('dotenv').config();

// ── Configuración Multer ──────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/avatars';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `avatar_${req.user.id}_${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB máx
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    cb(null, allowed.includes(file.mimetype));
  }
});

// ── Registro ──────────────────────────────────────────────────────────────────
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

// ── Login ─────────────────────────────────────────────────────────────────────
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

// ── Perfil ────────────────────────────────────────────────────────────────────
router.get('/profile', require('../middleware/auth'), async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// ── Editar perfil ─────────────────────────────────────────────────────────────
router.put('/profile', require('../middleware/auth'), async (req, res) => {
  try {
    const { username, email } = req.body;
    await User.findByIdAndUpdate(req.user.id, { username, email });
    res.json({ message: 'Perfil actualizado' });
  } catch (err) {
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// ── Actualizar avatar (archivo, no base64) ────────────────────────────────────
router.put('/avatar', require('../middleware/auth'), upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No se subió ninguna imagen' });

    // Borrar avatar anterior si existe (no el default '')
    const currentUser = await User.findById(req.user.id);
    if (currentUser.avatar && currentUser.avatar.startsWith('/uploads/')) {
      const oldPath = path.join(__dirname, '..', currentUser.avatar);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    await User.findByIdAndUpdate(req.user.id, { avatar: avatarUrl });
    res.json({ message: 'Avatar actualizado', avatar: avatarUrl });
  } catch (err) {
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// ── Editar contraseña ─────────────────────────────────────────────────────────
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

// ── Eliminar cuenta ───────────────────────────────────────────────────────────
router.delete('/profile', require('../middleware/auth'), async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.id);
    res.json({ message: 'Cuenta eliminada' });
  } catch (err) {
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// ── Forgot password ───────────────────────────────────────────────────────────
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Email no encontrado' });

    const resetToken = require('crypto').randomBytes(32).toString('hex');
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 3600000; // 1 hora
    await user.save();

    const { sendPasswordResetEmail } = require('../services/email');
    await sendPasswordResetEmail(user.email, user.username, resetToken);

    res.json({ message: 'Email de recuperación enviado' });
  } catch (err) {
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// ── Reset password ────────────────────────────────────────────────────────────
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: 'Token inválido o expirado' });

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error del servidor' });
  }
});

module.exports = router;