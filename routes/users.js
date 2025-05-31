const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const multer = require('multer'); // Importar multer
const path = require('path');   // Importar path
const fs = require('fs');       // Importar fs

// --- Configuração do Multer para fotos de usuário ---
const userUploadsDir = path.join(__dirname, '..', 'uploads', 'user_photos');
if (!fs.existsSync(userUploadsDir)) {
    fs.mkdirSync(userUploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, userUploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `user-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Somente arquivos de imagem são permitidos!'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: fileFilter
});
// --- Fim da Configuração do Multer ---


router.get('/', (req, res) => {
  User.getAll((err, users) => {
    if (err) return res.status(500).send(err.message);
    res.json(users);
  });
});

router.get('/:id', (req, res) => {
  User.getById(req.params.id, (err, user) => {
    if (err) return res.status(500).send(err.message);
    if (!user) return res.status(404).send("Usuário não encontrado");
    res.json(user);
  });
});


router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email e senha são obrigatórios" });
  }

  User.findOne({ email }, async (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(401).json({ error: "Email ou senha inválidos" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Email ou senha inválidos" });
    }
    
    // Retornar o caminho relativo da foto para o cliente montar a URL
    const photoUrl = user.photo ? `/uploads/user_photos/${path.basename(user.photo)}` : null;

    res.json({ 
        message: 'Login bem-sucedido', 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        photoUrl: photoUrl // Enviar URL da foto
    });
  });
});

// Aplicar o middleware do multer APENAS para a rota de registro
router.post('/register', upload.single('photo'), (req, res) => {
  const { name, email, password } = req.body;
  
  // O caminho do arquivo estará em req.file.path
  const photoPath = req.file ? req.file.path : null;

  if (!name || !email || !password) { // A foto é opcional no backend, mas frontend pode exigir
    // Se um arquivo foi enviado mas outros campos faltam, pode ser útil removê-lo
    if (photoPath && fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
    }
    return res.status(400).json({ error: "Nome, email e senha são obrigatórios" });
  }
  
  // O modelo User.create precisa ser ajustado para aceitar o caminho da foto
  User.create({ name, email, photo: photoPath, password }, (err, user) => {
    if (err) {
        if (photoPath && fs.existsSync(photoPath)) {
            fs.unlinkSync(photoPath); // Remover foto se houver erro no DB
        }
        return res.status(500).send(err.message);
    }
    // Retornar o usuário com o caminho relativo da foto
    const userResponse = { ...user };
    if (user.photo) {
        userResponse.photoUrl = `/uploads/user_photos/${path.basename(user.photo)}`;
    }
    res.status(201).json(userResponse);
  });
});

module.exports = router;