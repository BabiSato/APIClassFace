const db = require('../database/db'); //

const Presence = {
  create: (presenceData, callback) => {
    const {
      userId,
      subjectId,
      registrationType,
      clientTimestamp, // Timestamp enviado pelo cliente, se houver
      imagePath,
      latitude,
      longitude,
      locationName
    } = presenceData;

    // Usa o timestamp do cliente se fornecido, senão gera um novo no backend
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
    db.all("SELECT * FROM presences ORDER BY timestamp DESC", callback); //
  },

  // Você pode adicionar outros métodos aqui se necessário, por exemplo:
  // findEntryForClass: (userId, subjectId, callback) => {
  //   db.get(
  //     "SELECT * FROM presences WHERE user_id = ? AND subject_id = ? AND registration_type = 'entry' ORDER BY timestamp DESC LIMIT 1",
  //     [userId, subjectId],
  //     callback
  //   );
  // },
};

module.exports = Presence; //