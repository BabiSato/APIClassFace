const db = require('../database/db')

const Presence = {
    create: (userId, callback) => {
        const date = new Date().toISOString();
  db.run("INSERT INTO presences (user_id, timestamp) VALUES (?, ?)", [userId, date], function (err) {
      callback(err, { id: this.lastID, userId, timestamp: date });
    });
  }
};

module.exports = Presence;