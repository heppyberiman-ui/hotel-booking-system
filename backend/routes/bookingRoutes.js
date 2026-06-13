const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const {
    getAllBookings,
    createBooking,
    updateBooking,
    deleteBooking,
    uploadProof
} = require("../controllers/bookingController");

// Configure Multer Storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "../uploads"));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif|webp/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error("Hanya file gambar (jpg, jpeg, png, gif, webp) yang diperbolehkan!"));
        }
    }
});

router.get("/", getAllBookings);
router.post("/", createBooking);
router.put("/:id", updateBooking);
router.delete("/:id", deleteBooking);
router.post("/:id/upload-proof", upload.single("payment_proof"), uploadProof);

module.exports = router;
