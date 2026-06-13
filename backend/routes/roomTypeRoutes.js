const express = require("express");
const router = express.Router();

const {
  getAllRoomTypes,
  getRoomTypeById,
  createRoomType,
  updateRoomType,
  deleteRoomType,
} = require("../controllers/roomTypeController");

router.get("/", getAllRoomTypes);
router.get("/:id", getRoomTypeById);
router.post("/", createRoomType);
router.put("/:id", updateRoomType);
router.delete("/:id", deleteRoomType);

module.exports = router;
