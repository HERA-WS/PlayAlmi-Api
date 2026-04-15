const router = require('express').Router();
const Score = require('../models/Score');
const auth = require('../middleware/auth');

// Guardar puntuación (desde Unity)
router.post('/', auth, async (req, res) => {
  try {
    const { score, level, difficulty } = req.body;
    const newScore = new Score({
      userId: req.user.id,
      score,
      level,
      difficulty
    });
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
      .populate('userId', 'username');
    res.json(ranking);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener ranking' });
  }
});

// ESTA LÍNEA ES OBLIGATORIA
module.exports = router;
