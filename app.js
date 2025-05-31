// gemini2/api/app.js
const express = require('express');
const cors = require('cors');
const app = express();
const userRoutes = require('./routes/users'); // users.js irá importar e usar multer
const presenceRoutes = require('./routes/presences');
const attendanceRoutes = require('./routes/attendance'); // attendance.js já configura seu multer
const bodyParser = require('body-parser');
const path = require('path');
// fs não é estritamente necessário aqui se multer lida com a criação de pastas

const PORT = 3001;

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' })); // Para payloads JSON grandes (se houver base64)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir arquivos estáticos da pasta 'uploads'
// A estrutura de subpastas ('user_photos', etc.) será gerenciada pelo Multer nas rotas
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/users', userRoutes);
app.use('/api/presences', presenceRoutes);
app.use('/api/attendance', attendanceRoutes);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});