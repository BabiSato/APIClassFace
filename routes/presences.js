const express = require('express');
const router = express.Router();
const Presence = require('../models/presenceModel');

router.post('/', (req,res) => {
    const { userId } = req.body;
  Presence.create(userId, (err, result) => {
    if (err) return res.status(500).send(err.message);
    res.status(201).json(result);
  });
});

module.exports = router;