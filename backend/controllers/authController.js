const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

const JWT_SECRET = process.env.JWT_SECRET || "grand_horizon_secret_key_9999";

// POST register
const register = async (req, res) => {
    const { name, email, password, role } = req.body;

    console.log(`[Auth Register] Attempt received for email: ${email}, name: ${name}, role: ${role}`);

    if (!name || !email || !password) {
        console.log(`[Auth Register] Failed: Missing required fields.`);
        return res.status(400).json({
            message: "Semua field (name, email, password) harus diisi"
        });
    }

    try {
        console.log(`[Auth Register] Hashing password for email: ${email}...`);
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const query = "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)";
        console.log(`[Auth Register] Executing database query to insert user...`);
        db.query(query, [name, email, hashedPassword, role || "customer"], (err, result) => {
            if (err) {
                console.error(`[Auth Register] Database query error: ${err.message}`, err);
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

            console.log(`[Auth Register] Registration successful for email: ${email}, userId: ${result.insertId}`);
            res.status(201).json({
                message: "Registrasi berhasil",
                userId: result.insertId
            });
        });
    } catch (error) {
        console.error(`[Auth Register] Server error: ${error.message}`, error);
        res.status(500).json({
            message: "Terjadi kesalahan server saat registrasi",
            error: error.message
        });
    }
};

// POST login
const login = (req, res) => {
    const { email, password } = req.body;

    console.log(`[Auth Login] Attempt received for email: ${email}`);

    if (!email || !password) {
        console.log(`[Auth Login] Failed: Email or password input is empty.`);
        return res.status(400).json({
            message: "Email dan password harus diisi"
        });
    }

    const query = "SELECT * FROM users WHERE email = ?";
    db.query(query, [email], async (err, results) => {
        if (err) {
            console.error(`[Auth Login] Database query error: ${err.message}`, err);
            return res.status(500).json({
                message: "Gagal melakukan query login",
                error: err.message
            });
        }

        if (results.length === 0) {
            console.log(`[Auth Login] Failed: User not found for email: ${email}`);
            return res.status(400).json({
                message: "Email atau password salah"
            });
        }

        const user = results[0];
        console.log(`[Auth Login] User found in database: id=${user.id}, role=${user.role}`);

        try {
            // Cek kesesuaian password
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                console.log(`[Auth Login] Failed: Password mismatch for email: ${email}`);
                return res.status(400).json({
                    message: "Email atau password salah"
                });
            }

            // Generate JWT token
            console.log(`[Auth Login] Password matches. Generating JWT...`);
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

            console.log(`[Auth Login] JWT generated successfully. Login complete.`);
            res.status(200).json({
                message: "Login berhasil",
                token: token
            });
        } catch (error) {
            console.error(`[Auth Login] Server error during verification/JWT generation: ${error.message}`, error);
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

    console.log(`[Auth GoogleLogin] Attempt received with access_token length: ${access_token ? access_token.length : 0}`);

    if (!access_token) {
        console.log(`[Auth GoogleLogin] Failed: Missing access_token.`);
        return res.status(400).json({
            message: "Access token Google harus diisi"
        });
    }

    try {
        console.log(`[Auth GoogleLogin] Fetching user info from Google...`);
        const googleRes = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`);
        if (!googleRes.ok) {
            console.log(`[Auth GoogleLogin] Failed to fetch Google userinfo, status: ${googleRes.status}`);
            return res.status(400).json({
                message: "Access token Google tidak valid atau kedaluwarsa"
            });
        }

        const googleUser = await googleRes.json();
        const { name, email, picture } = googleUser;
        console.log(`[Auth GoogleLogin] Google userinfo retrieved: email: ${email}, name: ${name}`);

        if (!email) {
            console.log(`[Auth GoogleLogin] Failed: Email not found in Google userinfo.`);
            return res.status(400).json({
                message: "Email tidak ditemukan dari akun Google ini"
            });
        }

        const queryCheck = "SELECT * FROM users WHERE email = ?";
        console.log(`[Auth GoogleLogin] Executing database query to check existing user for email: ${email}...`);
        db.query(queryCheck, [email], (err, results) => {
            if (err) {
                console.error(`[Auth GoogleLogin] Database query check error: ${err.message}`, err);
                return res.status(500).json({
                    message: "Gagal memproses login Google",
                    error: err.message
                });
            }

            if (results.length > 0) {
                // User exists
                const user = results[0];
                console.log(`[Auth GoogleLogin] Existing user found. ID: ${user.id}, Role: ${user.role}. Updating info...`);
                const queryUpdate = "UPDATE users SET name = ?, avatar_url = ? WHERE id = ?";
                db.query(queryUpdate, [name, picture, user.id], (err) => {
                    if (err) {
                        console.error("[Auth GoogleLogin] Gagal mengupdate nama/avatar user:", err);
                    } else {
                        console.log(`[Auth GoogleLogin] User info updated for ID: ${user.id}`);
                    }

                    // Generate JWT token
                    console.log(`[Auth GoogleLogin] Generating JWT...`);
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

                    console.log(`[Auth GoogleLogin] JWT generated successfully for ID: ${user.id}. Login complete.`);
                    res.status(200).json({
                        message: "Login Google berhasil",
                        token: token
                    });
                });
            } else {
                // User does not exist - register a new customer user
                console.log(`[Auth GoogleLogin] User does not exist. Creating new account...`);
                const queryInsert = "INSERT INTO users (name, email, password, role, avatar_url) VALUES (?, ?, NULL, 'customer', ?)";
                db.query(queryInsert, [name, email, picture], (err, result) => {
                    if (err) {
                        console.error(`[Auth GoogleLogin] Database query insert error: ${err.message}`, err);
                        return res.status(500).json({
                            message: "Gagal mendaftarkan akun baru dari Google",
                            error: err.message
                        });
                    }

                    const newUserId = result.insertId;
                    console.log(`[Auth GoogleLogin] New user registered. ID: ${newUserId}. Generating JWT...`);

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

                    console.log(`[Auth GoogleLogin] JWT generated successfully for new ID: ${newUserId}. Registration/Login complete.`);
                    res.status(200).json({
                        message: "Akun baru berhasil didaftarkan dari Google",
                        token: token
                    });
                });
            }
        });
    } catch (error) {
        console.error(`[Auth GoogleLogin] Server error: ${error.message}`, error);
        res.status(500).json({
            message: "Terjadi kesalahan server saat login Google",
            error: error.message
        });
    }
};

const diagnostic = (req, res) => {
    const { secret } = req.query;
    if (secret !== "grandhorizondev2026") {
        return res.status(403).json({ message: "Forbidden" });
    }

    const report = {
        dbConnection: "Checking...",
        env: {
            MYSQLHOST: process.env.MYSQLHOST ? "Defined" : "Undefined",
            MYSQLUSER: process.env.MYSQLUSER ? "Defined" : "Undefined",
            MYSQLDATABASE: process.env.MYSQLDATABASE ? "Defined" : "Undefined",
            MYSQLPORT: process.env.MYSQLPORT || "Undefined"
        },
        users: []
    };

    db.query("SELECT id, name, email, role, password IS NULL as has_no_password, CHAR_LENGTH(password) as password_len FROM users", (err, results) => {
        if (err) {
            report.dbConnection = "Error: " + err.message;
            report.dbError = err;
            return res.status(500).json(report);
        }

        report.dbConnection = "Success";
        report.users = results;
        res.status(200).json(report);
    });
};

const tempResetAdmin = async (req, res) => {
    const { secret } = req.query;
    if (secret !== "grandhorizondev2026") {
        return res.status(403).json({
            message: "Forbidden: Invalid secret key"
        });
    }

    try {
        const email = "adminbaru@gmail.com";
        const passwordToHash = "123456";

        // Generate fresh bcrypt hash
        const salt = await bcrypt.genSalt(10);
        const freshHash = await bcrypt.hash(passwordToHash, salt);

        console.log(`[Temp Reset] Fresh hash generated for email ${email}`);

        // Update database
        const queryUpdate = "UPDATE users SET password = ? WHERE email = ?";
        db.query(queryUpdate, [freshHash, email], async (err, result) => {
            if (err) {
                console.error("[Temp Reset] Failed to update user in database:", err);
                return res.status(500).json({
                    message: "Database update failed",
                    error: err.message
                });
            }

            if (result.affectedRows === 0) {
                console.log(`[Temp Reset] User ${email} not found in database.`);
                return res.status(404).json({
                    message: `User ${email} not found in database.`
                });
            }

            // Verify
            const querySelect = "SELECT password FROM users WHERE email = ?";
            db.query(querySelect, [email], async (errSelect, resultsSelect) => {
                if (errSelect || resultsSelect.length === 0) {
                    return res.status(500).json({
                        message: "Failed to retrieve user after update"
                    });
                }

                const storedHash = resultsSelect[0].password;
                const isMatch = await bcrypt.compare(passwordToHash, storedHash);

                console.log(`[Temp Reset] Verification - password matches storedHash: ${isMatch}`);

                res.status(200).json({
                    message: "Password updated and verified successfully",
                    email: email,
                    affectedRows: result.affectedRows,
                    verification: {
                        hashMatches: isMatch,
                        storedHash: storedHash
                    }
                });
            });
        });
    } catch (error) {
        res.status(500).json({
            message: "Server error during temporary admin reset",
            error: error.message
        });
    }
};

module.exports = {
    register,
    login,
    googleLogin,
    diagnostic,
    tempResetAdmin
};
