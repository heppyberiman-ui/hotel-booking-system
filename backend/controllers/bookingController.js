const db = require("../config/db");

// GET semua booking
const getAllBookings = (req, res) => {
    const { user_id } = req.query;
    
    let query = `
        SELECT bookings.*, users.name AS guest_name, users.email AS guest_email, rooms.room_number 
        FROM bookings 
        LEFT JOIN users ON bookings.user_id = users.id 
        LEFT JOIN rooms ON bookings.room_id = rooms.id
    `;
    
    const params = [];
    if (user_id) {
        query += " WHERE bookings.user_id = ?";
        params.push(user_id);
    }
    
    db.query(query, params, (err, results) => {
        if (err) {
            return res.status(500).json({
                message: "Gagal mengambil data booking",
                error: err.message
            });
        }
        res.status(200).json(results);
    });
};

// POST tambah booking
const createBooking = (req, res) => {
    const { user_id, room_id, check_in, check_out, total_price, status, payment_method } = req.body;

    // First, check if the room has stock
    const checkStockQuery = "SELECT stock_kamar, status FROM rooms WHERE id = ?";
    db.query(checkStockQuery, [room_id], (err, roomResults) => {
        if (err) {
            return res.status(500).json({ message: "Gagal memeriksa stok kamar", error: err.message });
        }
        if (roomResults.length === 0) {
            return res.status(404).json({ message: "Kamar tidak ditemukan" });
        }
        const room = roomResults[0];
        if (room.status !== "available" || room.stock_kamar <= 0) {
            return res.status(400).json({ message: "Stok kamar sudah habis atau kamar tidak tersedia" });
        }

        // Generate booking code otomatis
        const year = new Date().getFullYear();
        const prefix = `GH-${year}-`;
        const codeQuery = "SELECT booking_code FROM bookings WHERE booking_code LIKE ? ORDER BY id DESC LIMIT 1";

        db.query(codeQuery, [prefix + "%"], (err, codeResults) => {
            let nextNum = 1;
            if (!err && codeResults && codeResults.length > 0) {
                const latestCode = codeResults[0].booking_code;
                if (latestCode) {
                    const parts = latestCode.split("-");
                    if (parts.length === 3) {
                        const lastNum = parseInt(parts[2], 10);
                        if (!isNaN(lastNum)) {
                            nextNum = lastNum + 1;
                        }
                    }
                }
            }
            const bookingCode = `${prefix}${String(nextNum).padStart(4, "0")}`;

            // Insert booking record
            const query = "INSERT INTO bookings (user_id, room_id, check_in, check_out, total_price, status, payment_method, booking_code, payment_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
            db.query(
                query,
                [
                    user_id,
                    room_id,
                    check_in,
                    check_out,
                    total_price,
                    status || "Pending Verification",
                    payment_method,
                    bookingCode,
                    "pending"
                ],
                (err, result) => {
                    if (err) {
                        return res.status(500).json({
                            message: "Gagal menambahkan booking",
                            error: err.message
                        });
                    }

                    // Decrement room stock immediately when booking is created
                    const decQuery = "UPDATE rooms SET stock_kamar = GREATEST(stock_kamar - 1, 0) WHERE id = ?";
                    db.query(decQuery, [room_id], (decErr) => {
                        if (decErr) {
                            console.error("Gagal mengurangi stok kamar:", decErr.message);
                        }
                    });

                    res.status(201).json({
                        message: "Booking berhasil ditambahkan",
                        id: result.insertId,
                        booking_code: bookingCode
                    });
                }
            );
        });
    });
};

// PUT update booking
const updateBooking = (req, res) => {
    const { id } = req.params;
    const { status, payment_status, verified_by } = req.body;

    const getBookingQuery = "SELECT status, room_id FROM bookings WHERE id = ?";
    db.query(getBookingQuery, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Gagal memproses update booking", error: err.message });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: "Booking tidak ditemukan" });
        }
        const currentBooking = results[0];
        const prevStatus = currentBooking.status.toLowerCase();
        const newStatus = status ? status.toLowerCase() : prevStatus;
        const roomId = currentBooking.room_id;

        let finalPaymentStatus = payment_status;
        if (!finalPaymentStatus && status) {
            if (newStatus === "confirmed") {
                finalPaymentStatus = "paid";
            } else if (newStatus === "cancelled") {
                finalPaymentStatus = "cancelled";
            }
        }

        const updateFields = [];
        const params = [];
        if (status) {
            updateFields.push("status = ?");
            params.push(status);

            const lowerStatus = status.toLowerCase();
            if (lowerStatus === "confirmed" || lowerStatus === "cancelled" || lowerStatus === "rejected") {
                updateFields.push("verified_at = NOW()");
                updateFields.push("verified_by = ?");
                params.push(verified_by || "Admin");
            }
        }
        if (finalPaymentStatus) {
            updateFields.push("payment_status = ?");
            params.push(finalPaymentStatus);
        }

        if (updateFields.length === 0) {
            return res.status(400).json({ message: "Tidak ada data yang diperbarui" });
        }

        params.push(id);
        const updateQuery = `UPDATE bookings SET ${updateFields.join(", ")} WHERE id = ?`;

        db.query(updateQuery, params, (err, result) => {
            if (err) {
                return res.status(500).json({
                    message: "Gagal mengupdate booking",
                    error: err.message
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Booking tidak ditemukan"
                });
            }

            // Update room stock on status cancellation or rejection
            if ((newStatus === "cancelled" || newStatus === "rejected") && prevStatus !== "cancelled" && prevStatus !== "rejected") {
                // Increment stock_kamar back
                const incQuery = "UPDATE rooms SET stock_kamar = stock_kamar + 1 WHERE id = ?";
                db.query(incQuery, [roomId], (err) => {
                    if (err) console.error("Error incrementing stock:", err);
                });
            }

            res.status(200).json({
                message: "Status booking berhasil diupdate"
            });
        });
    });
};

// POST upload bukti pembayaran
const uploadProof = (req, res) => {
    const { id } = req.params;
    if (!req.file) {
        return res.status(400).json({ message: "Tidak ada file bukti pembayaran yang diunggah" });
    }

    const proofPath = `/uploads/${req.file.filename}`;
    const query = "UPDATE bookings SET payment_proof = ? WHERE id = ?";
    db.query(query, [proofPath, id], (err, result) => {
        if (err) {
            return res.status(500).json({
                message: "Gagal mengunggah bukti pembayaran",
                error: err.message
            });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Booking tidak ditemukan" });
        }
        res.status(200).json({
            message: "Bukti pembayaran berhasil diunggah",
            payment_proof: proofPath
        });
    });
};

// DELETE hapus booking
const deleteBooking = (req, res) => {
    const { id } = req.params;

    db.query("DELETE FROM bookings WHERE id = ?", [id], (err, result) => {
        if (err) {
            return res.status(500).json({
                message: "Gagal menghapus booking",
                error: err.message
            });
        }
        res.status(200).json({
            message: "Booking berhasil dihapus"
        });
    });
};

module.exports = {
    getAllBookings,
    createBooking,
    updateBooking,
    deleteBooking,
    uploadProof
};


