const db = require("../config/db");

// GET semua room types dengan detail lengkap
const getAllRoomTypes = (req, res) => {
  db.query(
    "SELECT * FROM room_types ORDER BY base_price ASC",
    (err, results) => {
      if (err) {
        return res.status(500).json({
          message: "Gagal mengambil data tipe kamar",
          error: err.message,
        });
      }
      res.status(200).json(results);
    },
  );
};

// GET room type spesifik
const getRoomTypeById = (req, res) => {
  const { id } = req.params;

  db.query("SELECT * FROM room_types WHERE id = ?", [id], (err, results) => {
    if (err) {
      return res.status(500).json({
        message: "Gagal mengambil data tipe kamar",
        error: err.message,
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        message: "Tipe kamar tidak ditemukan",
      });
    }

    res.status(200).json(results[0]);
  });
};

// POST tambah room type dengan gambar
const createRoomType = (req, res) => {
  const { type_name, description, capacity, image_url, base_price } = req.body;

  if (!type_name || !capacity) {
    return res.status(400).json({
      message: "type_name dan capacity harus diisi",
    });
  }

  const query = `
        INSERT INTO room_types (type_name, description, capacity, image_url, base_price) 
        VALUES (?, ?, ?, ?, ?)
    `;

  db.query(
    query,
    [type_name, description || "", capacity, image_url || "", base_price || 0],
    (err, result) => {
      if (err) {
        return res.status(500).json({
          message: "Gagal menambahkan tipe kamar",
          error: err.message,
        });
      }
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

  if (!type_name || !capacity) {
    return res.status(400).json({
      message: "type_name dan capacity harus diisi",
    });
  }

  const query = `
        UPDATE room_types 
        SET type_name = ?, description = ?, capacity = ?, image_url = ?, base_price = ? 
        WHERE id = ?
    `;

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
        return res.status(500).json({
          message: "Gagal mengupdate tipe kamar",
          error: err.message,
        });
      }
      res.status(200).json({
        message: "Tipe kamar berhasil diupdate",
      });
    },
  );
};

// DELETE room type
const deleteRoomType = (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM room_types WHERE id = ?", [id], (err, result) => {
    if (err) {
      return res.status(500).json({
        message: "Gagal menghapus tipe kamar",
        error: err.message,
      });
    }
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
