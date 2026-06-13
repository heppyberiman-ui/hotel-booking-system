const db = require("../config/db");

const RoomType = {
  getAll: async () => {
    const [rows] = await db.query("SELECT * FROM room_types");
    return rows;
  },

  create: async (name) => {
    const [result] = await db.query(
      "INSERT INTO room_types (name) VALUES (?)",
      [name]
    );
    return result;
  }
};

module.exports = RoomType;