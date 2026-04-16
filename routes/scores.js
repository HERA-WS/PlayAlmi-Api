const router = require('express').Router();
const Score = require('../models/Score');
const auth = require('../middleware/auth');

// Guardar puntuación
router.post('/', auth, async (req, res) => {
  try {
    const { score, level, difficulty } = req.body;
    const newScore = new Score({ userId: req.user.id, score, level, difficulty });
    await newScore.save();
    res.status(201).json({ message: 'Puntuación guardada' });
  } catch (err) {
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Ranking global top 10
router.get('/ranking', async (req, res) => {
  try {
    const ranking = await Score.find()
      .sort({ score: -1 })
      .limit(10)
      .populate('userId', 'username avatar');
    res.json(ranking);
  } catch (err) {
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Ranking por dificultad
router.get('/ranking/:difficulty', async (req, res) => {
  try {
    const ranking = await Score.find({ difficulty: req.params.difficulty })
      .sort({ score: -1 })
      .limit(10)
      .populate('userId', 'username avatar');
    res.json(ranking);
  } catch (err) {
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Historial del usuario logueado
router.get('/history', auth, async (req, res) => {
  try {
    const history = await Score.find({ userId: req.user.id })
      .sort({ createdAt: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Mejor puntuación de un usuario
router.get('/best/:userId', auth, async (req, res) => {
  try {
    const best = await Score.findOne({ userId: req.params.userId })
      .sort({ score: -1 });
    res.json(best);
  } catch (err) {
    res.status(500).json({ message: 'Error del servidor' });
  }
});

module.exports = router;
