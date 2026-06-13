const db = require("../config/db");

// GET semua fasilitas
const getAllFacilities = (req, res) => {
    db.query("SELECT * FROM facilities", (err, results) => {
        if (err) {
            return res.status(500).json({
                message: "Gagal mengambil data fasilitas",
                error: err.message
            });
        }
        res.status(200).json(results);
    });
};

// POST tambah fasilitas
const createFacility = (req, res) => {
    const { facility_name, description, image } = req.body;

    const query = "INSERT INTO facilities (facility_name, description, image) VALUES (?, ?, ?)";
    db.query(query, [facility_name, description, image], (err, result) => {
        if (err) {
            return res.status(500).json({
                message: "Gagal menambahkan fasilitas",
                error: err.message
            });
        }
        res.status(201).json({
            message: "Fasilitas berhasil ditambahkan",
            id: result.insertId
        });
    });
};

// PUT update fasilitas
const updateFacility = (req, res) => {
    const { id } = req.params;
    const { facility_name, description, image } = req.body;

    const query = "UPDATE facilities SET facility_name = ?, description = ?, image = ? WHERE id = ?";
    db.query(query, [facility_name, description, image, id], (err, result) => {
        if (err) {
            return res.status(500).json({
                message: "Gagal mengupdate fasilitas",
                error: err.message
            });
        }
        res.status(200).json({
            message: "Fasilitas berhasil diupdate"
        });
    });
};

// DELETE hapus fasilitas
const deleteFacility = (req, res) => {
    const { id } = req.params;

    db.query("DELETE FROM facilities WHERE id = ?", [id], (err, result) => {
        if (err) {
            return res.status(500).json({
                message: "Gagal menghapus fasilitas",
                error: err.message
            });
        }
        res.status(200).json({
            message: "Fasilitas berhasil dihapus"
        });
    });
};

module.exports = {
    getAllFacilities,
    createFacility,
    updateFacility,
    deleteFacility
};
