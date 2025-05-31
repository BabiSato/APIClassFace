// gemini2/api/routes/attendance.js
const express = require('express');
const router = express.Router();
const Presence = require('../models/presenceModel');
const User = require('../models/userModel'); // Importar o modelo User
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadsDir = path.join(__dirname, '..', 'uploads', 'attendance_photos'); // Pasta para fotos de presença
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `attendance-${req.body.userId || 'unknown'}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Somente arquivos de imagem são permitidos!'), false);
    }
    cb(null, true);
  }
});

// SIMULAÇÃO DE VERIFICAÇÃO FACIAL
async function simulateFacialVerification(registeredPhotoPath, newPhotoPath) {
  // Em um cenário real, você usaria bibliotecas como OpenCV, face-api.js, TensorFlow.js
  // ou serviços de nuvem (AWS Rekognition, Azure Face API, etc.) para:
  // 1. Carregar ambas as imagens.
  // 2. Detectar rostos em ambas as imagens.
  // 3. Extrair "embeddings" faciais (vetores de características).
  // 4. Comparar os embeddings para determinar a similaridade.
  // 5. Retornar true se a similaridade for acima de um limiar, false caso contrário.

  console.log(`Simulando verificação entre: ${registeredPhotoPath} e ${newPhotoPath}`);
  if (!registeredPhotoPath || !newPhotoPath) {
    console.warn("Simulação: Uma das fotos não foi fornecida para verificação.");
    return false; // Falha se uma das fotos não existir
  }
  // Para esta simulação, vamos apenas retornar true (sempre verifica com sucesso)
  // Adicione uma lógica mais complexa se desejar simular falhas.
  return true;
}


router.post('/register', upload.single('photo'), async (req, res) => { // Tornar async
  const {
    userId,
    subjectId,
    registrationType,
    timestamp,
    latitude,
    longitude,
    locationName
  } = req.body;

  const newPhotoPath = req.file ? req.file.path : null;

  if (!userId || !subjectId || !registrationType || !newPhotoPath || latitude === undefined || longitude === undefined) {
    if (newPhotoPath && fs.existsSync(newPhotoPath)) {
      fs.unlinkSync(newPhotoPath);
    }
    return res.status(400).json({
      error: "Dados incompletos para registro de presença."
    });
  }

  try {
    // 1. Buscar o usuário e sua foto de cadastro
    User.getById(parseInt(userId), async (err, user) => { // Tornar async
      if (err) {
        if (newPhotoPath && fs.existsSync(newPhotoPath)) fs.unlinkSync(newPhotoPath);
        return res.status(500).json({ error: "Erro ao buscar usuário." });
      }
      if (!user || !user.photo) {
        if (newPhotoPath && fs.existsSync(newPhotoPath)) fs.unlinkSync(newPhotoPath);
        return res.status(404).json({ error: "Usuário ou foto de cadastro não encontrada. Verificação facial não pode ser realizada." });
      }

      const registeredPhotoPath = user.photo; // Caminho da foto salva no cadastro

      // 2. Realizar (simular) verificação facial
      const isVerified = await simulateFacialVerification(registeredPhotoPath, newPhotoPath);

      if (!isVerified) {
        if (newPhotoPath && fs.existsSync(newPhotoPath)) fs.unlinkSync(newPhotoPath); // Remover foto da tentativa
        return res.status(403).json({ error: "Verificação facial falhou. Presença não registrada." });
      }

      // 3. Se verificado, registrar a presença
      const presenceData = {
        userId: parseInt(userId),
        subjectId,
        registrationType,
        clientTimestamp: timestamp,
        imagePath: `/uploads/attendance_photos/${path.basename(newPhotoPath)}`, // Salvar caminho relativo acessível pela web
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        locationName
      };

      Presence.create(presenceData, (err, result) => {
        if (err) {
          // Não remover a foto aqui, pois a verificação facial passou. Pode ser um erro de DB.
          console.error("Erro ao registrar presença no banco:", err);
          return res.status(500).json({ error: "Erro interno ao registrar presença." });
        }
        res.status(201).json({ message: 'Presença registrada com sucesso!', facialVerificationStatus: 'success', data: result });
      });
    });
  } catch (error) {
    console.error("Erro no processo de registro de presença:", error);
    if (newPhotoPath && fs.existsSync(newPhotoPath)) fs.unlinkSync(newPhotoPath);
    res.status(500).json({ error: "Erro inesperado no servidor." });
  }
});

module.exports = router;