const express = require('express');
const cors = require('cors');
const app = express();
const userRoutes = require('./routes/users');
const presenceRoutes = require('./routes/presences');

const PORT = 3001;

app.use(cors());
app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/presences', presenceRoutes);


app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});