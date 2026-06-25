const db = require("../config/db");
const promiseDb = db.promise();

const RoomType = {
  getAll: async () => {
    const [rows] = await promiseDb.query("SELECT * FROM room_types");
    return rows;
  },

  create: async (name) => {
    const [result] = await promiseDb.query(
      "INSERT INTO room_types (name) VALUES (?)",
      [name]
    );
    return result;
  }
};

module.exports = RoomType;