const db = require("../config/db");

// GET semua booking
const getAllBookings = (req, res) => {
    const { user_id } = req.query;
    console.log(`[Booking Controller] getAllBookings called. Query params - user_id: ${user_id}`);
    
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
    
    console.log(`[Booking Controller] Executing query for bookings with params: ${JSON.stringify(params)}...`);
    db.query(query, params, (err, results) => {
        if (err) {
            console.error(`[Booking Controller] getAllBookings query error: ${err.message}`, err);
            return res.status(500).json({
                message: "Gagal mengambil data booking",
                error: err.message
            });
        }
        console.log(`[Booking Controller] getAllBookings query successful, retrieved ${results.length} bookings`);
        res.status(200).json(results);
    });
};

// POST tambah booking
const createBooking = (req, res) => {
    const { user_id, room_id, check_in, check_out, total_price, status, payment_method } = req.body;
    console.log(`[Booking Controller] createBooking called. user_id: ${user_id}, room_id: ${room_id}, check_in: ${check_in}, check_out: ${check_out}, total_price: ${total_price}`);

    // First, check if the room has stock
    const checkStockQuery = "SELECT stock_kamar, status FROM rooms WHERE id = ?";
    console.log(`[Booking Controller] Checking room stock for room ID: ${room_id}...`);
    db.query(checkStockQuery, [room_id], (err, roomResults) => {
        if (err) {
            console.error(`[Booking Controller] createBooking stock check error: ${err.message}`, err);
            return res.status(500).json({ message: "Gagal memeriksa stok kamar", error: err.message });
        }
        if (roomResults.length === 0) {
            console.log(`[Booking Controller] createBooking room check failed: Room ID: ${room_id} not found`);
            return res.status(404).json({ message: "Kamar tidak ditemukan" });
        }
        const room = roomResults[0];
        console.log(`[Booking Controller] Room ID: ${room_id} status: ${room.status}, stock: ${room.stock_kamar}`);
        if (room.status !== "available" || room.stock_kamar <= 0) {
            console.log(`[Booking Controller] createBooking failed: Room stock exhausted or status not available.`);
            return res.status(400).json({ message: "Stok kamar sudah habis atau kamar tidak tersedia" });
        }

        // Generate booking code otomatis
        const year = new Date().getFullYear();
        const prefix = `GH-${year}-`;
        const codeQuery = "SELECT booking_code FROM bookings WHERE booking_code LIKE ? ORDER BY id DESC LIMIT 1";

        console.log(`[Booking Controller] Generating booking code prefix: ${prefix}...`);
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
            console.log(`[Booking Controller] Generated booking code: ${bookingCode}`);

            // Insert booking record
            const query = "INSERT INTO bookings (user_id, room_id, check_in, check_out, total_price, status, payment_method, booking_code, payment_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
            console.log(`[Booking Controller] Inserting booking record...`);
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
                        console.error(`[Booking Controller] createBooking insert error: ${err.message}`, err);
                        return res.status(500).json({
                            message: "Gagal menambahkan booking",
                            error: err.message
                        });
                    }

                    // Decrement room stock immediately when booking is created
                    const decQuery = "UPDATE rooms SET stock_kamar = GREATEST(stock_kamar - 1, 0) WHERE id = ?";
                    console.log(`[Booking Controller] Decrementing room ID: ${room_id} stock...`);
                    db.query(decQuery, [room_id], (decErr) => {
                        if (decErr) {
                            console.error(`[Booking Controller] Gagal mengurangi stok kamar ID: ${room_id}:`, decErr.message);
                        } else {
                            console.log(`[Booking Controller] Room ID: ${room_id} stock decremented successfully`);
                        }
                    });

                    console.log(`[Booking Controller] Booking created successfully. ID: ${result.insertId}`);
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
    console.log(`[Booking Controller] updateBooking called for ID: ${id}. status: ${status}, payment_status: ${payment_status}, verified_by: ${verified_by}`);

    const getBookingQuery = "SELECT status, room_id FROM bookings WHERE id = ?";
    console.log(`[Booking Controller] Retrieving current booking info for ID: ${id}...`);
    db.query(getBookingQuery, [id], (err, results) => {
        if (err) {
            console.error(`[Booking Controller] updateBooking find error: ${err.message}`, err);
            return res.status(500).json({ message: "Gagal memproses update booking", error: err.message });
        }
        if (results.length === 0) {
            console.log(`[Booking Controller] updateBooking failed: Booking ID: ${id} not found`);
            return res.status(404).json({ message: "Booking tidak ditemukan" });
        }
        const currentBooking = results[0];
        const prevStatus = currentBooking.status.toLowerCase();
        const newStatus = status ? status.toLowerCase() : prevStatus;
        const roomId = currentBooking.room_id;

        console.log(`[Booking Controller] Booking ID: ${id} current room ID: ${roomId}, prevStatus: ${prevStatus}, newStatus: ${newStatus}`);

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
            console.log(`[Booking Controller] updateBooking ID: ${id} failed: No fields to update`);
            return res.status(400).json({ message: "Tidak ada data yang diperbarui" });
        }

        params.push(id);
        const updateQuery = `UPDATE bookings SET ${updateFields.join(", ")} WHERE id = ?`;

        console.log(`[Booking Controller] Updating database record for Booking ID: ${id}...`);
        db.query(updateQuery, params, (err, result) => {
            if (err) {
                console.error(`[Booking Controller] updateBooking query error: ${err.message}`, err);
                return res.status(500).json({
                    message: "Gagal mengupdate booking",
                    error: err.message
                });
            }

            if (result.affectedRows === 0) {
                console.log(`[Booking Controller] Booking ID: ${id} not found during update execution`);
                return res.status(404).json({
                    message: "Booking tidak ditemukan"
                });
            }

            // Update room stock on status cancellation or rejection
            if ((newStatus === "cancelled" || newStatus === "rejected") && prevStatus !== "cancelled" && prevStatus !== "rejected") {
                // Increment stock_kamar back
                const incQuery = "UPDATE rooms SET stock_kamar = stock_kamar + 1 WHERE id = ?";
                console.log(`[Booking Controller] Booking ID: ${id} cancelled/rejected. Reverting room ID: ${roomId} stock...`);
                db.query(incQuery, [roomId], (err) => {
                    if (err) {
                        console.error(`[Booking Controller] Error incrementing stock for room ID: ${roomId}:`, err);
                    } else {
                        console.log(`[Booking Controller] Room ID: ${roomId} stock incremented successfully`);
                    }
                });
            }

            console.log(`[Booking Controller] Booking ID: ${id} updated successfully`);
            res.status(200).json({
                message: "Status booking berhasil diupdate"
            });
        });
    });
};

// POST upload bukti pembayaran
const uploadProof = (req, res) => {
    const { id } = req.params;
    console.log(`[Booking Controller] uploadProof called for Booking ID: ${id}`);
    if (!req.file) {
        console.log(`[Booking Controller] uploadProof failed for ID: ${id}: No file uploaded`);
        return res.status(400).json({ message: "Tidak ada file bukti pembayaran yang diunggah" });
    }

    const proofPath = `/uploads/${req.file.filename}`;
    const query = "UPDATE bookings SET payment_proof = ? WHERE id = ?";
    console.log(`[Booking Controller] Saving payment proof path: ${proofPath} for Booking ID: ${id}...`);
    db.query(query, [proofPath, id], (err, result) => {
        if (err) {
            console.error(`[Booking Controller] uploadProof query error: ${err.message}`, err);
            return res.status(500).json({
                message: "Gagal mengunggah bukti pembayaran",
                error: err.message
            });
        }
        if (result.affectedRows === 0) {
            console.log(`[Booking Controller] uploadProof failed: Booking ID: ${id} not found`);
            return res.status(404).json({ message: "Booking tidak ditemukan" });
        }
        console.log(`[Booking Controller] Payment proof uploaded successfully for Booking ID: ${id}`);
        res.status(200).json({
            message: "Bukti pembayaran berhasil diunggah",
            payment_proof: proofPath
        });
    });
};

// DELETE hapus booking
const deleteBooking = (req, res) => {
    const { id } = req.params;
    console.log(`[Booking Controller] deleteBooking called for Booking ID: ${id}`);

    console.log(`[Booking Controller] Executing delete query for Booking ID: ${id}...`);
    db.query("DELETE FROM bookings WHERE id = ?", [id], (err, result) => {
        if (err) {
            console.error(`[Booking Controller] deleteBooking query error for ID: ${id}: ${err.message}`, err);
            return res.status(500).json({
                message: "Gagal menghapus booking",
                error: err.message
            });
        }
        console.log(`[Booking Controller] Booking ID: ${id} deleted successfully`);
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


