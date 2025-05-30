const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/classface.db'); //

// Criar as tabelas dentro do bloco serialize
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      photo TEXT
    );
  `); //

  // Tabela presences ATUALIZADA
  db.run(`
    CREATE TABLE IF NOT EXISTS presences (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      subject_id TEXT,
      registration_type TEXT CHECK(registration_type IN ('entry', 'exit')),
      timestamp TEXT NOT NULL,
      image TEXT,
      latitude REAL,
      longitude REAL,
      location_name TEXT,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );
  `);
});

module.exports = db; //