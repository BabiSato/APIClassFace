const express = require('express');
const cors = require('cors');
const app = express();
const userRoutes = require('./routes/users');
const presenceRoutes = require('./routes/presences');
const attendanceRoutes = require('./routes/attendance'); // Importa a nova rota
const bodyParser = require('body-parser');
const path = require('path'); // Módulo path para lidar com caminhos de arquivo

const PORT = 3001;

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' })); //
app.use(express.json({ limit: '10mb' })); //
app.use(express.urlencoded({ extended: true, limit: '10mb' })); //

// Servir arquivos estáticos da pasta 'uploads'
// As fotos salvas poderão ser acessadas via http://localhost:3001/uploads/nome_do_arquivo.jpg
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/users', userRoutes); //
app.use('/api/presences', presenceRoutes); //
app.use('/api/attendance', attendanceRoutes); // USA a nova rota

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`); //
});