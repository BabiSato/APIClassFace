const express = require('express');
const router = express.Router();
const Presence = require('../models/presenceModel');
const User = require('../models/userModel');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadsDir = path.join(__dirname, '..', 'uploads', 'attendance_photos');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const userId = req.body.userId || 'unknown_user';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `attendance-${userId}-${uniqueSuffix}${path.extname(file.originalname)}`);
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

async function simulateFacialVerification(registeredPhotoPath, newPhotoPath) {
  console.log(`Simulando verificação entre: ${registeredPhotoPath} e ${newPhotoPath}`);
  if (!registeredPhotoPath || !fs.existsSync(registeredPhotoPath)) {
    console.warn("Simulação: Foto de cadastro do usuário não encontrada no servidor.");
    return false;
  }
  if (!newPhotoPath || !fs.existsSync(newPhotoPath)) {
    console.warn("Simulação: Nova foto para verificação não foi fornecida ou não existe.");
    return false;
  }
  return true;
}

router.post('/register', upload.single('photo'), async (req, res) => {
  const {
    userId,
    subjectId,
    registrationType,
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
      error: "Dados incompletos para registro de presença. userId, subjectId, registrationType, photo, latitude e longitude são obrigatórios."
    });
  }

  try {
    User.getById(parseInt(userId), async (err, user) => {
      if (err) {
        if (newPhotoPath && fs.existsSync(newPhotoPath)) fs.unlinkSync(newPhotoPath);
        console.error("Erro ao buscar usuário:", err);
        return res.status(500).json({ error: "Erro ao buscar usuário." });
      }
      if (!user || !user.photo) {
        if (newPhotoPath && fs.existsSync(newPhotoPath)) fs.unlinkSync(newPhotoPath);
        return res.status(404).json({ error: "Usuário ou foto de cadastro não encontrada. Verificação facial não pode ser realizada." });
      }

      const registeredPhotoAbsolutePath = user.photo;

      const isVerified = await simulateFacialVerification(registeredPhotoAbsolutePath, newPhotoPath);

      if (!isVerified) {
        if (newPhotoPath && fs.existsSync(newPhotoPath)) fs.unlinkSync(newPhotoPath);
        return res.status(403).json({ error: "Verificação facial falhou. Presença não registrada." });
      }

      const serverTimestamp = new Date().toISOString();
      const relativeImagePath = `/uploads/attendance_photos/${path.basename(newPhotoPath)}`;

      const presenceData = {
        userId: parseInt(userId),
        subjectId,
        registrationType,
        clientTimestamp: req.body.clientTimestamp || serverTimestamp,
        imagePath: relativeImagePath,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        locationName: locationName || 'Localização não informada'
      };

      Presence.create(presenceData, (err, result) => {
        if (err) {
          console.error("Erro ao registrar presença no banco:", err);
          console.log("Erro ao registrar presença no banco:", err);
          return res.status(500).json({ error: "Erro interno ao registrar presença." });
        }
        res.status(201).json({
          message: 'Presença registrada com sucesso!',
          facialVerificationStatus: 'success',
          data: { ...result, id: this.lastID, imagePath: relativeImagePath }
        });
      });
    });
  } catch (error) {
    console.error("Erro no processo de registro de presença:", error);
    if (newPhotoPath && fs.existsSync(newPhotoPath)) fs.unlinkSync(newPhotoPath);
    res.status(500).json({ error: "Erro inesperado no servidor." });
  }
});

module.exports = router;