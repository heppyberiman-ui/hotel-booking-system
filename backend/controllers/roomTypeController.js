const db = require("../config/db");

// GET semua room types dengan detail lengkap
const getAllRoomTypes = (req, res) => {
  console.log("[RoomType Controller] getAllRoomTypes called");
  console.log("[RoomType Controller] Executing query for all room types...");
  db.query(
    "SELECT * FROM room_types ORDER BY base_price ASC",
    (err, results) => {
      if (err) {
        console.error(`[RoomType Controller] getAllRoomTypes query error: ${err.message}`, err);
        return res.status(500).json({
          message: "Gagal mengambil data tipe kamar",
          error: err.message,
        });
      }
      console.log(`[RoomType Controller] getAllRoomTypes query successful, retrieved ${results.length} room types`);
      res.status(200).json(results);
    },
  );
};

// GET room type spesifik
const getRoomTypeById = (req, res) => {
  const { id } = req.params;
  console.log(`[RoomType Controller] getRoomTypeById called for room type ID: ${id}`);

  console.log(`[RoomType Controller] Executing query for room type ID: ${id}...`);
  db.query("SELECT * FROM room_types WHERE id = ?", [id], (err, results) => {
    if (err) {
      console.error(`[RoomType Controller] getRoomTypeById query error for ID: ${id}: ${err.message}`, err);
      return res.status(500).json({
        message: "Gagal mengambil data tipe kamar",
        error: err.message,
      });
    }

    if (results.length === 0) {
      console.log(`[RoomType Controller] Room type ID: ${id} not found`);
      return res.status(404).json({
        message: "Tipe kamar tidak ditemukan",
      });
    }

    console.log(`[RoomType Controller] Room type ID: ${id} found successfully`);
    res.status(200).json(results[0]);
  });
};

// POST tambah room type dengan gambar
const createRoomType = (req, res) => {
  const { type_name, description, capacity, image_url, base_price } = req.body;
  console.log(`[RoomType Controller] createRoomType called. Name: ${type_name}, Capacity: ${capacity}, Base Price: ${base_price}`);

  if (!type_name || !capacity) {
    console.log("[RoomType Controller] createRoomType failed: Missing required fields (type_name or capacity)");
    return res.status(400).json({
      message: "type_name dan capacity harus diisi",
    });
  }

  const query = `
        INSERT INTO room_types (type_name, description, capacity, image_url, base_price) 
        VALUES (?, ?, ?, ?, ?)
    `;

  console.log(`[RoomType Controller] Executing insert query...`);
  db.query(
    query,
    [type_name, description || "", capacity, image_url || "", base_price || 0],
    (err, result) => {
      if (err) {
        console.error(`[RoomType Controller] createRoomType query error: ${err.message}`, err);
        return res.status(500).json({
          message: "Gagal menambahkan tipe kamar",
          error: err.message,
        });
      }
      console.log(`[RoomType Controller] Room type created successfully. Insert ID: ${result.insertId}`);
      res.status(201).json({
        message: "Tipe kamar berhasil ditambahkan",
        id: result.insertId,
      });
    },
  );
};

// PUT update room type dengan gambar
const updateRoomType = (req, res) => {
  const { id } = req.params;
  const { type_name, description, capacity, image_url, base_price } = req.body;
  console.log(`[RoomType Controller] updateRoomType called for room type ID: ${id}. Name: ${type_name}, Capacity: ${capacity}, Base Price: ${base_price}`);

  if (!type_name || !capacity) {
    console.log(`[RoomType Controller] updateRoomType failed for ID: ${id}: Missing required fields (type_name or capacity)`);
    return res.status(400).json({
      message: "type_name dan capacity harus diisi",
    });
  }

  const query = `
        UPDATE room_types 
        SET type_name = ?, description = ?, capacity = ?, image_url = ?, base_price = ? 
        WHERE id = ?
    `;

  console.log(`[RoomType Controller] Executing update query for ID: ${id}...`);
  db.query(
    query,
    [
      type_name,
      description || "",
      capacity,
      image_url || "",
      base_price || 0,
      id,
    ],
    (err, result) => {
      if (err) {
        console.error(`[RoomType Controller] updateRoomType query error for ID: ${id}: ${err.message}`, err);
        return res.status(500).json({
          message: "Gagal mengupdate tipe kamar",
          error: err.message,
        });
      }
      console.log(`[RoomType Controller] Room type ID: ${id} updated successfully`);
      res.status(200).json({
        message: "Tipe kamar berhasil diupdate",
      });
    },
  );
};

// DELETE room type
const deleteRoomType = (req, res) => {
  const { id } = req.params;
  console.log(`[RoomType Controller] deleteRoomType called for room type ID: ${id}`);

  console.log(`[RoomType Controller] Executing delete query for ID: ${id}...`);
  db.query("DELETE FROM room_types WHERE id = ?", [id], (err, result) => {
    if (err) {
      console.error(`[RoomType Controller] deleteRoomType query error for ID: ${id}: ${err.message}`, err);
      return res.status(500).json({
        message: "Gagal menghapus tipe kamar",
        error: err.message,
      });
    }
    console.log(`[RoomType Controller] Room type ID: ${id} deleted successfully`);
    res.status(200).json({
      message: "Tipe kamar berhasil dihapus",
    });
  });
};

module.exports = {
  getAllRoomTypes,
  getRoomTypeById,
  createRoomType,
  updateRoomType,
  deleteRoomType,
};
