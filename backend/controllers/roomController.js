const db = require("../config/db");

// GET semua kamar dengan detail tipe kamar
const getRooms = (req, res) => {
  console.log("[Room Controller] getRooms called");
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
  console.log("[Room Controller] Executing query for all rooms...");
  db.query(query, (err, results) => {
    if (err) {
      console.error(`[Room Controller] getRooms query error: ${err.message}`, err);
      return res.status(500).json({
        message: "Gagal mengambil data kamar",
        error: err.message,
      });
    }

    console.log(`[Room Controller] getRooms query successful, returned ${results.length} rooms`);
    res.status(200).json(results);
  });
};

// GET kamar berdasarkan ID dengan semua detail
const getRoomById = (req, res) => {
  const { id } = req.params;
  console.log(`[Room Controller] getRoomById called for room ID: ${id}`);

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

  console.log(`[Room Controller] Executing query for room ID: ${id}...`);
  db.query(query, [id], (err, results) => {
    if (err) {
      console.error(`[Room Controller] getRoomById query error: ${err.message}`, err);
      return res.status(500).json({
        message: "Gagal mengambil detail kamar",
        error: err.message,
      });
    }

    if (results.length === 0) {
      console.log(`[Room Controller] Room ID: ${id} not found`);
      return res.status(404).json({
        message: "Kamar tidak ditemukan",
      });
    }

    console.log(`[Room Controller] Room ID: ${id} found successfully`);
    res.status(200).json(results[0]);
  });
};

// GET kamar yang tersedia untuk tanggal tertentu
const getAvailableRooms = (req, res) => {
  const { checkIn, checkOut, capacity } = req.query;
  console.log(`[Room Controller] getAvailableRooms called. Query params - checkIn: ${checkIn}, checkOut: ${checkOut}, capacity: ${capacity}`);

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

  console.log(`[Room Controller] Executing query for available rooms with params: ${JSON.stringify(params)}...`);
  db.query(query, params, (err, results) => {
    if (err) {
      console.error(`[Room Controller] getAvailableRooms query error: ${err.message}`, err);
      return res.status(500).json({
        message: "Gagal mengambil kamar yang tersedia",
        error: err.message,
      });
    }

    console.log(`[Room Controller] getAvailableRooms query successful, found ${results.length} rooms`);
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

  console.log(`[Room Controller] createRoom called. Room number: ${room_number}, Type ID: ${room_type_id}, Price: ${price}`);

  const query = `
        INSERT INTO rooms (
            room_number, room_type_id, price, status,
            description, capacity, bed_type, room_size,
            wifi, breakfast, ac, tv, minibar, balcony, stock_kamar
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

  const values = [
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
  ];

  console.log(`[Room Controller] Executing createRoom query...`);
  db.query(
    query,
    values,
    (err, result) => {
      if (err) {
        console.error(`[Room Controller] createRoom query error: ${err.message}`, err);
        return res.status(500).json({
          message: "Gagal menambahkan kamar",
          error: err.message,
        });
      }

      console.log(`[Room Controller] Room created successfully. Insert ID: ${result.insertId}`);
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

  console.log(`[Room Controller] updateRoom called for room ID: ${id}. Room number: ${room_number}, Type ID: ${room_type_id}`);

  const query = `
        UPDATE rooms SET 
            room_number=?, room_type_id=?, price=?, status=?,
            description=?, capacity=?, bed_type=?, room_size=?,
            wifi=?, breakfast=?, ac=?, tv=?, minibar=?, balcony=?, stock_kamar=?
        WHERE id=?
    `;

  const values = [
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
  ];

  console.log(`[Room Controller] Executing updateRoom query for ID: ${id}...`);
  db.query(
    query,
    values,
    (err, result) => {
      if (err) {
        console.error(`[Room Controller] updateRoom query error for ID: ${id}: ${err.message}`, err);
        return res.status(500).json({
          message: "Gagal mengupdate kamar",
          error: err.message,
        });
      }

      console.log(`[Room Controller] Room ID: ${id} updated successfully`);
      res.status(200).json({
        message: "Kamar berhasil diupdate",
      });
    },
  );
};

// DELETE kamar
const deleteRoom = (req, res) => {
  const { id } = req.params;
  console.log(`[Room Controller] deleteRoom called for room ID: ${id}`);

  console.log(`[Room Controller] Executing deleteRoom query for ID: ${id}...`);
  db.query("DELETE FROM rooms WHERE id=?", [id], (err, result) => {
    if (err) {
      console.error(`[Room Controller] deleteRoom query error for ID: ${id}: ${err.message}`, err);
      return res.status(500).json({
        message: "Gagal menghapus kamar",
        error: err.message,
      });
    }

    console.log(`[Room Controller] Room ID: ${id} deleted successfully`);
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
