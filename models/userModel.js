const db = require('../database/db');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const User = {
    getAll: (callback) => {
    db.all("SELECT id, name, email, photo FROM users", [], callback);
  },
  getById: (id, callback) => {
    db.get("SELECT id, name, email, photo FROM users WHERE id = ?", [id], callback);
  },
  findOne: ({ email }, callback) => {
    db.get("SELECT * FROM users WHERE email = ?", [email], callback);
  },
  create: (user, callback) => {
    const { name, email, photo, password } = user;

    bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
      if (err) return callback(err);

      db.run(
        "INSERT INTO users (name, email, photo, password) VALUES (?, ?, ?, ?)",
        [name, email, photo, hashedPassword],
        function (err) {
          if (err) return callback(err);
          callback(null, { id: this.lastID, name, email, photo });
        }
      );
    });
  }
};

module.exports = User;