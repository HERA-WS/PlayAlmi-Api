const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb'}));
app.use(express.urlencoded({limit: '10mb', extended: true}));

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB conectado'))
  .catch(err => console.log('Error MongoDB:', err));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/scores', require('./routes/scores'));

app.use('/api/admin', require('./routes/admin'));
app.listen(process.env.PORT, () => {
  console.log(`Servidor corriendo en puerto ${process.env.PORT}`);
});
