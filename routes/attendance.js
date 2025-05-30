const express = require('express');
const router = express.Router();
const Presence = require('../models/presenceModel');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configurar o diretório de uploads (deve estar na raiz da API)
const uploadsDir = path.join(__dirname, '..', 'uploads'); // Garante que o caminho seja relativo à pasta 'api'
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true }); // Cria a pasta se não existir
}

// Configurar Multer para armazenamento de arquivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir); // Salva arquivos na pasta 'uploads/'
  },
  filename: function (req, file, cb) {
    // Define um nome de arquivo único para evitar sobrescritas
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limite de 10MB para o arquivo de foto
  fileFilter: function (req, file, cb) {
    // Aceitar apenas imagens
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Somente arquivos de imagem são permitidos!'), false);
    }
    cb(null, true);
  }
});

// Endpoint: POST /api/attendance/register
router.post('/register', upload.single('photo'), (req, res) => {
  const {
    userId,
    subjectId, // ou classScheduleId
    registrationType,
    timestamp, // Timestamp do cliente (opcional, pode ser gerado no backend)
    latitude,
    longitude,
    locationName
  } = req.body;

  const imagePath = req.file ? req.file.path : null;

  if (!userId || !(subjectId) || !registrationType || !imagePath || latitude === undefined || longitude === undefined) {
    if (imagePath && fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath); // Remove a foto se os dados estiverem incompletos
    }
    return res.status(400).json({
      error: "Campos obrigatórios ausentes ou inválidos: userId, subjectId (ou classScheduleId), registrationType, photo, latitude, longitude."
    });
  }

  const presenceData = {
    userId: parseInt(userId), // Garante que seja número
    subjectId,
    registrationType,
    clientTimestamp: timestamp,
    imagePath,
    latitude: parseFloat(latitude),
    longitude: parseFloat(longitude),
    locationName
  };

  // TODO: Implementar lógica de validação avançada aqui (facial, horário, entrada/saída, localização permitida, etc.)
  // Exemplo:
  // if (registrationType === 'exit') {
  //   // Verificar se existe uma entrada correspondente antes de permitir a saída
  // }

  Presence.create(presenceData, (err, result) => {
    if (err) {
      if (imagePath && fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath); // Remove a foto em caso de erro no DB
      }
      console.error("Erro ao registrar presença no banco:", err);
      return res.status(500).json({ error: "Erro interno ao registrar presença." });
    }
    res.status(201).json({ message: 'Presença registrada com sucesso!', data: result });
  });
});

module.exports = router;