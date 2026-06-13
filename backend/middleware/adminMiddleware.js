const adminMiddleware = (req, res, next) => {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({
            message: "Akses ditolak, hanya untuk admin"
        });
    }
    next();
};

module.exports = adminMiddleware;
