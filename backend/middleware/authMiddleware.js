const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "grand_horizon_secret_key_9999";

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            message: "Akses ditolak, token tidak ditemukan"
        });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                message: "Token tidak valid"
            });
        }
        req.user = decoded;
        next();
    });
};

module.exports = authMiddleware;
