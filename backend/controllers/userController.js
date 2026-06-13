const bcrypt = require("bcryptjs");
const db = require("../config/db");

// GET semua user
const getAllUsers = (req, res) => {
    db.query("SELECT id, name, email, role FROM users", (err, results) => {
        if (err) {
            return res.status(500).json({
                message: "Gagal mengambil data user",
                error: err.message
            });
        }
        res.status(200).json(results);
    });
};

// POST tambah user (Admin action)
const createUser = async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({
            message: "Semua field (name, email, password) harus diisi"
        });
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const query = "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)";
        db.query(query, [name, email, hashedPassword, role || "customer"], (err, result) => {
            if (err) {
                if (err.code === "ER_DUP_ENTRY") {
                    return res.status(400).json({
                        message: "Email sudah terdaftar"
                    });
                }
                return res.status(500).json({
                    message: "Gagal menambahkan user",
                    error: err.message
                });
            }

            res.status(201).json({
                message: "User berhasil ditambahkan",
                id: result.insertId
            });
        });
    } catch (error) {
        res.status(500).json({
            message: "Terjadi kesalahan server saat menyimpan user",
            error: error.message
        });
    }
};

// PUT update user
const updateUser = async (req, res) => {
    const { id } = req.params;
    const { name, email, password, role } = req.body;

    if (!name || !email) {
        return res.status(400).json({
            message: "Name dan email harus diisi"
        });
    }

    try {
        if (password) {
            // Update with password change
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const query = "UPDATE users SET name = ?, email = ?, password = ?, role = ? WHERE id = ?";
            db.query(query, [name, email, hashedPassword, role, id], (err, result) => {
                if (err) {
                    return res.status(500).json({
                        message: "Gagal mengupdate user",
                        error: err.message
                    });
                }
                res.status(200).json({
                    message: "User berhasil diupdate"
                });
            });
        } else {
            // Update without password change
            const query = "UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?";
            db.query(query, [name, email, role, id], (err, result) => {
                if (err) {
                    return res.status(500).json({
                        message: "Gagal mengupdate user",
                        error: err.message
                    });
                }
                res.status(200).json({
                    message: "User berhasil diupdate"
                });
            });
        }
    } catch (error) {
        res.status(500).json({
            message: "Terjadi kesalahan server saat mengupdate user",
            error: error.message
        });
    }
};

// DELETE user
const deleteUser = (req, res) => {
    const { id } = req.params;

    db.query("DELETE FROM users WHERE id = ?", [id], (err, result) => {
        if (err) {
            return res.status(500).json({
                message: "Gagal menghapus user",
                error: err.message
            });
        }
        res.status(200).json({
            message: "User berhasil dihapus"
        });
    });
};

module.exports = {
    getAllUsers,
    createUser,
    updateUser,
    deleteUser
};
