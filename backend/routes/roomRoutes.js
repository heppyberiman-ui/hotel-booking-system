const express = require("express");
const router = express.Router();

const {
  getRooms,
  getRoomById,
  getAvailableRooms,
  createRoom,
  updateRoom,
  deleteRoom,
} = require("../controllers/roomController");

// GET semua kamar
router.get("/", getRooms);

// GET kamar tersedia dengan filter
router.get("/available", getAvailableRooms);

// GET kamar spesifik berdasarkan ID
router.get("/:id", getRoomById);

// POST tambah kamar
router.post("/", createRoom);

// PUT update kamar
router.put("/:id", updateRoom);

// DELETE hapus kamar
router.delete("/:id", deleteRoom);

module.exports = router;
