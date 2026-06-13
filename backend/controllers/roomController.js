const db = require("../config/db");

// GET semua kamar dengan detail tipe kamar
const getRooms = (req, res) => {
  const query = `
        SELECT 
            rooms.*,
            room_types.type_name,
            room_types.image_url,
            room_types.base_price,
            room_types.description as type_description
        FROM rooms 
        LEFT JOIN room_types ON rooms.room_type_id = room_types.id
        ORDER BY rooms.room_number ASC
    `;
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({
        message: "Gagal mengambil data kamar",
        error: err.message,
      });
    }

    res.status(200).json(results);
  });
};

// GET kamar berdasarkan ID dengan semua detail
const getRoomById = (req, res) => {
  const { id } = req.params;

  const query = `
        SELECT 
            rooms.*,
            room_types.type_name,
            room_types.image_url,
            room_types.base_price,
            room_types.description as type_description
        FROM rooms 
        LEFT JOIN room_types ON rooms.room_type_id = room_types.id
        WHERE rooms.id = ?
    `;

  db.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json({
        message: "Gagal mengambil detail kamar",
        error: err.message,
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        message: "Kamar tidak ditemukan",
      });
    }

    res.status(200).json(results[0]);
  });
};

// GET kamar yang tersedia untuk tanggal tertentu
const getAvailableRooms = (req, res) => {
  const { checkIn, checkOut, capacity } = req.query;

  let query = `
        SELECT 
            rooms.*,
            room_types.type_name,
            room_types.image_url,
            room_types.base_price,
            room_types.description as type_description
        FROM rooms 
        LEFT JOIN room_types ON rooms.room_type_id = room_types.id
        WHERE rooms.status = 'available'
    `;

  const params = [];

  // Filter by capacity jika ada
  if (capacity) {
    query += ` AND rooms.capacity >= ?`;
    params.push(parseInt(capacity));
  }

  // Filter by date jika ada check-in dan check-out
  if (checkIn && checkOut) {
    query += `
            AND rooms.id NOT IN (
                SELECT room_id FROM bookings 
                WHERE status IN ('pending', 'confirmed')
                AND (
                    (check_in < ? AND check_out > ?) OR
                    (check_in < ? AND check_out > ?)
                )
            )
        `;
    params.push(checkOut, checkIn, checkOut, checkIn);
  }

  query += ` ORDER BY rooms.price ASC`;

  db.query(query, params, (err, results) => {
    if (err) {
      return res.status(500).json({
        message: "Gagal mengambil kamar yang tersedia",
        error: err.message,
      });
    }

    res.status(200).json(results);
  });
};

// POST tambah kamar
const createRoom = (req, res) => {
  const {
    room_number,
    room_type_id,
    price,
    status,
    description,
    capacity,
    bed_type,
    room_size,
    wifi,
    breakfast,
    ac,
    tv,
    minibar,
    balcony,
    stock_kamar,
  } = req.body;

  const query = `
        INSERT INTO rooms (
            room_number, room_type_id, price, status,
            description, capacity, bed_type, room_size,
            wifi, breakfast, ac, tv, minibar, balcony, stock_kamar
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

  db.query(
    query,
    [
      room_number,
      room_type_id,
      price,
      status,
      description || "",
      parseInt(capacity) || 2,
      bed_type || "",
      parseInt(room_size) || 0,
      wifi ? 1 : 0,
      breakfast ? 1 : 0,
      ac ? 1 : 0,
      tv ? 1 : 0,
      minibar ? 1 : 0,
      balcony ? 1 : 0,
      parseInt(stock_kamar) || 0,
    ],
    (err, result) => {
      if (err) {
        return res.status(500).json({
          message: "Gagal menambahkan kamar",
          error: err.message,
        });
      }

      res.status(201).json({
        message: "Kamar berhasil ditambahkan",
        id: result.insertId,
      });
    },
  );
};

// PUT update kamar
const updateRoom = (req, res) => {
  const { id } = req.params;
  const {
    room_number,
    room_type_id,
    price,
    status,
    description,
    capacity,
    bed_type,
    room_size,
    wifi,
    breakfast,
    ac,
    tv,
    minibar,
    balcony,
    stock_kamar,
  } = req.body;

  const query = `
        UPDATE rooms SET 
            room_number=?, room_type_id=?, price=?, status=?,
            description=?, capacity=?, bed_type=?, room_size=?,
            wifi=?, breakfast=?, ac=?, tv=?, minibar=?, balcony=?, stock_kamar=?
        WHERE id=?
    `;

  db.query(
    query,
    [
      room_number,
      room_type_id,
      price,
      status,
      description || "",
      parseInt(capacity) || 2,
      bed_type || "",
      parseInt(room_size) || 0,
      wifi ? 1 : 0,
      breakfast ? 1 : 0,
      ac ? 1 : 0,
      tv ? 1 : 0,
      minibar ? 1 : 0,
      balcony ? 1 : 0,
      parseInt(stock_kamar) || 0,
      id,
    ],
    (err, result) => {
      if (err) {
        return res.status(500).json({
          message: "Gagal mengupdate kamar",
          error: err.message,
        });
      }

      res.status(200).json({
        message: "Kamar berhasil diupdate",
      });
    },
  );
};

// DELETE kamar
const deleteRoom = (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM rooms WHERE id=?", [id], (err, result) => {
    if (err) {
      return res.status(500).json({
        message: "Gagal menghapus kamar",
        error: err.message,
      });
    }

    res.status(200).json({
      message: "Kamar berhasil dihapus",
    });
  });
};

module.exports = {
  getRooms,
  getRoomById,
  getAvailableRooms,
  createRoom,
  updateRoom,
  deleteRoom,
};
