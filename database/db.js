const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/classface.db');

// Criar a tabela de usuários
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      photo TEXT
    );
  `);
});
db.run(`
  CREATE TABLE IF NOT EXISTS presences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    timestamp TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);


module.exports = db;