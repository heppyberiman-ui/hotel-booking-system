const bcrypt = require("bcryptjs");
const db = require("../config/db");

// GET semua user
const getAllUsers = (req, res) => {
    console.log("[User Controller] getAllUsers called");
    db.query("SELECT id, name, email, role FROM users", (err, results) => {
        if (err) {
            console.error(`[User Controller] getAllUsers database query error: ${err.message}`, err);
            return res.status(500).json({
                message: "Gagal mengambil data user",
                error: err.message
            });
        }
        console.log(`[User Controller] getAllUsers database query successful, retrieved ${results.length} users`);
        res.status(200).json(results);
    });
};

// POST tambah user (Admin action)
const createUser = async (req, res) => {
    const { name, email, password, role } = req.body;
    console.log(`[User Controller] createUser called with email: ${email}, name: ${name}, role: ${role}`);

    if (!name || !email || !password) {
        console.log("[User Controller] createUser failed: Missing required fields (name, email, password)");
        return res.status(400).json({
            message: "Semua field (name, email, password) harus diisi"
        });
    }

    try {
        console.log(`[User Controller] Hashing password for user email: ${email}...`);
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const query = "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)";
        console.log(`[User Controller] Executing insert query for user email: ${email}...`);
        db.query(query, [name, email, hashedPassword, role || "customer"], (err, result) => {
            if (err) {
                console.error(`[User Controller] createUser database query error: ${err.message}`, err);
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

            console.log(`[User Controller] User created successfully. Insert ID: ${result.insertId}`);
            res.status(201).json({
                message: "User berhasil ditambahkan",
                id: result.insertId
            });
        });
    } catch (error) {
        console.error(`[User Controller] createUser caught server error: ${error.message}`, error);
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
    console.log(`[User Controller] updateUser called for user ID: ${id} with email: ${email}, name: ${name}, role: ${role}, passwordChange: ${!!password}`);

    if (!name || !email) {
        console.log("[User Controller] updateUser failed: Missing name or email");
        return res.status(400).json({
            message: "Name dan email harus diisi"
        });
    }

    try {
        if (password) {
            console.log(`[User Controller] Hashing new password for user ID: ${id}...`);
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const query = "UPDATE users SET name = ?, email = ?, password = ?, role = ? WHERE id = ?";
            console.log(`[User Controller] Executing update query with password for user ID: ${id}...`);
            db.query(query, [name, email, hashedPassword, role, id], (err, result) => {
                if (err) {
                    console.error(`[User Controller] updateUser (with password) database query error: ${err.message}`, err);
                    return res.status(500).json({
                        message: "Gagal mengupdate user",
                        error: err.message
                    });
                }
                console.log(`[User Controller] User ID: ${id} updated successfully (with password)`);
                res.status(200).json({
                    message: "User berhasil diupdate"
                });
            });
        } else {
            const query = "UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?";
            console.log(`[User Controller] Executing update query without password for user ID: ${id}...`);
            db.query(query, [name, email, role, id], (err, result) => {
                if (err) {
                    console.error(`[User Controller] updateUser (without password) database query error: ${err.message}`, err);
                    return res.status(500).json({
                        message: "Gagal mengupdate user",
                        error: err.message
                    });
                }
                console.log(`[User Controller] User ID: ${id} updated successfully (without password)`);
                res.status(200).json({
                    message: "User berhasil diupdate"
                });
            });
        }
    } catch (error) {
        console.error(`[User Controller] updateUser caught server error: ${error.message}`, error);
        res.status(500).json({
            message: "Terjadi kesalahan server saat mengupdate user",
            error: error.message
        });
    }
};

// DELETE user
const deleteUser = (req, res) => {
    const { id } = req.params;
    console.log(`[User Controller] deleteUser called for user ID: ${id}`);

    console.log(`[User Controller] Executing delete query for user ID: ${id}...`);
    db.query("DELETE FROM users WHERE id = ?", [id], (err, result) => {
        if (err) {
            console.error(`[User Controller] deleteUser database query error: ${err.message}`, err);
            return res.status(500).json({
                message: "Gagal menghapus user",
                error: err.message
            });
        }
        console.log(`[User Controller] User ID: ${id} deleted successfully`);
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
