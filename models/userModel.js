// gemini2/api/models/userModel.js
const db = require('../database/db');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const User = {
    getAll: (callback) => {
    db.all("SELECT id, name, email, photo FROM users", [], callback); // Não retornar hash da senha
  },
  getById: (id, callback) => {
    db.get("SELECT id, name, email, photo FROM users WHERE id = ?", [id], callback); // Não retornar hash
  },
  findOne: ({ email }, callback) => {
    // Este seleciona a senha pois é usado para login
    db.get("SELECT * FROM users WHERE email = ?", [email], callback);
  },
  create: (user, callback) => {
    const { name, email, photo, password } = user; // photo aqui é o caminho do arquivo

    bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
      if (err) return callback(err);

      db.run(
        "INSERT INTO users (name, email, photo, password) VALUES (?, ?, ?, ?)",
        [name, email, photo, hashedPassword], // Salva o caminho da foto
        function (err) {
          if (err) return callback(err);
          callback(null, { id: this.lastID, name, email, photo }); // Retorna o caminho da foto
        }
      );
    });
  }
};

module.exports = User;