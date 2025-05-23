const db = require('../database/db');

const Presence = {
  create: (image, callback) => {
    const date = new Date().toISOString();
    db.run(
      "INSERT INTO presences (image, timestamp) VALUES (?, ?)",
      [image, date],
      function (err) {
        callback(err, { id: this.lastID, image, timestamp: date });
      }
    );
  },

  findAll: (callback) => {
    db.all("SELECT * FROM presences ORDER BY timestamp DESC", callback);
  },

};

module.exports = Presence;
