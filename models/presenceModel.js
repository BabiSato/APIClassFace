const db = require('../database/db');

const Presence = {
  create: (presenceData, callback) => {
    const {
      userId,
      subjectId,
      registrationType,
      clientTimestamp,
      imagePath,
      latitude,
      longitude,
      locationName
    } = presenceData;

    const timestamp = clientTimestamp || new Date().toISOString();

    db.run(
      "INSERT INTO presences (user_id, subject_id, registration_type, timestamp, image, latitude, longitude, location_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [userId, subjectId, registrationType, timestamp, imagePath, latitude, longitude, locationName],
      function (err) {
        if (err) {
          return callback(err);
        }
        callback(null, {
          id: this.lastID,
          userId,
          subjectId,
          registrationType,
          timestamp,
          imagePath,
          latitude,
          longitude,
          locationName
        });
      }
    );
  },

  findAll: (callback) => {
    db.all("SELECT * FROM presences ORDER BY timestamp DESC", callback);
  },
};

module.exports = Presence;