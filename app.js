const express = require('express');
const cors = require('cors');
const app = express();
const userRoutes = require('./routes/users');
const presenceRoutes = require('./routes/presences');
const attendanceRoutes = require('./routes/attendance');
const bodyParser = require('body-parser');
const path = require('path');

const PORT = 3001;

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/users', userRoutes);
app.use('/api/presences', presenceRoutes);
app.use('/api/attendance', attendanceRoutes);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});