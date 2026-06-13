const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

const JWT_SECRET = process.env.JWT_SECRET || "grand_horizon_secret_key_9999";

// POST register
const register = async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({
            message: "Semua field (name, email, password) harus diisi"
        });
    }

    try {
        // Hash password menggunakan bcryptjs
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
                    message: "Gagal melakukan registrasi",
                    error: err.message
                });
            }

            res.status(201).json({
                message: "Registrasi berhasil",
                userId: result.insertId
            });
        });
    } catch (error) {
        res.status(500).json({
            message: "Terjadi kesalahan server saat registrasi",
            error: error.message
        });
    }
};

// POST login
const login = (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            message: "Email dan password harus diisi"
        });
    }

    const query = "SELECT * FROM users WHERE email = ?";
    db.query(query, [email], async (err, results) => {
        if (err) {
            return res.status(500).json({
                message: "Gagal melakukan query login",
                error: err.message
            });
        }

        if (results.length === 0) {
            return res.status(400).json({
                message: "Email atau password salah"
            });
        }

        const user = results[0];

        try {
            // Cek kesesuaian password
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({
                    message: "Email atau password salah"
                });
            }

            // Generate JWT token
            const token = jwt.sign(
                {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                },
                JWT_SECRET,
                { expiresIn: "24h" }
            );

            res.status(200).json({
                message: "Login berhasil",
                token: token
            });
        } catch (error) {
            res.status(500).json({
                message: "Terjadi kesalahan server saat verifikasi login",
                error: error.message
            });
        }
    });
};

// POST google-login
const googleLogin = async (req, res) => {
    const { access_token } = req.body;

    if (!access_token) {
        return res.status(400).json({
            message: "Access token Google harus diisi"
        });
    }

    try {
        // Fetch user info from Google API
        const googleRes = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`);
        if (!googleRes.ok) {
            return res.status(400).json({
                message: "Access token Google tidak valid atau kedaluwarsa"
            });
        }

        const googleUser = await googleRes.json();
        const { name, email, picture } = googleUser;

        if (!email) {
            return res.status(400).json({
                message: "Email tidak ditemukan dari akun Google ini"
            });
        }

        const queryCheck = "SELECT * FROM users WHERE email = ?";
        db.query(queryCheck, [email], (err, results) => {
            if (err) {
                return res.status(500).json({
                    message: "Gagal memproses login Google",
                    error: err.message
                });
            }

            if (results.length > 0) {
                // User exists
                const user = results[0];
                const queryUpdate = "UPDATE users SET name = ?, avatar_url = ? WHERE id = ?";
                db.query(queryUpdate, [name, picture, user.id], (err) => {
                    if (err) {
                        console.error("Gagal mengupdate nama/avatar user:", err);
                    }

                    // Generate JWT token
                    const token = jwt.sign(
                        {
                            id: user.id,
                            name: name,
                            email: user.email,
                            role: user.role,
                            avatar_url: picture
                        },
                        JWT_SECRET,
                        { expiresIn: "24h" }
                    );

                    res.status(200).json({
                        message: "Login Google berhasil",
                        token: token
                    });
                });
            } else {
                // User does not exist - register a new customer user
                const queryInsert = "INSERT INTO users (name, email, password, role, avatar_url) VALUES (?, ?, NULL, 'customer', ?)";
                db.query(queryInsert, [name, email, picture], (err, result) => {
                    if (err) {
                        return res.status(500).json({
                            message: "Gagal mendaftarkan akun baru dari Google",
                            error: err.message
                        });
                    }

                    const newUserId = result.insertId;

                    // Generate JWT token
                    const token = jwt.sign(
                        {
                            id: newUserId,
                            name: name,
                            email: email,
                            role: "customer",
                            avatar_url: picture
                        },
                        JWT_SECRET,
                        { expiresIn: "24h" }
                    );

                    res.status(200).json({
                        message: "Akun baru berhasil didaftarkan dari Google",
                        token: token
                    });
                });
            }
        });
    } catch (error) {
        res.status(500).json({
            message: "Terjadi kesalahan server saat login Google",
            error: error.message
        });
    }
};

module.exports = {
    register,
    login,
    googleLogin
};
