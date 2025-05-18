const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const bcrypt = require('bcrypt');

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

    

    res.json({ message: 'Login bem-sucedido', id: user.id, name: user.name, email: user.email, photo: user.photo  });
  });
});

router.post('/register', (req, res) => {
  const { name, email, photo, password } = req.body;

  console.log(req.body);

  if (!name || !email || !photo || !password) {
    return res.status(400).json({ error: "Todos os campos são obrigatórios" });
  }

  User.create({ name, email, photo, password }, (err, user) => {
    if (err) return res.status(500).send(err.message);
    res.status(201).json(user);
  });
});

module.exports = router;