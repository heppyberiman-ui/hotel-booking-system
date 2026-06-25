const db = require("../config/db");

// GET semua fasilitas
const getAllFacilities = (req, res) => {
    console.log("[Facility Controller] getAllFacilities called");
    console.log("[Facility Controller] Executing query for all facilities...");
    db.query("SELECT * FROM facilities", (err, results) => {
        if (err) {
            console.error(`[Facility Controller] getAllFacilities query error: ${err.message}`, err);
            return res.status(500).json({
                message: "Gagal mengambil data fasilitas",
                error: err.message
            });
        }
        console.log(`[Facility Controller] getAllFacilities query successful, retrieved ${results.length} facilities`);
        res.status(200).json(results);
    });
};

// POST tambah fasilitas
const createFacility = (req, res) => {
    const { facility_name, description, image } = req.body;
    console.log(`[Facility Controller] createFacility called. Name: ${facility_name}`);

    const query = "INSERT INTO facilities (facility_name, description, image) VALUES (?, ?, ?)";
    console.log(`[Facility Controller] Executing insert query...`);
    db.query(query, [facility_name, description, image], (err, result) => {
        if (err) {
            console.error(`[Facility Controller] createFacility query error: ${err.message}`, err);
            return res.status(500).json({
                message: "Gagal menambahkan fasilitas",
                error: err.message
            });
        }
        console.log(`[Facility Controller] Facility created successfully. Insert ID: ${result.insertId}`);
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
    console.log(`[Facility Controller] updateFacility called for facility ID: ${id}. Name: ${facility_name}`);

    const query = "UPDATE facilities SET facility_name = ?, description = ?, image = ? WHERE id = ?";
    console.log(`[Facility Controller] Executing update query for ID: ${id}...`);
    db.query(query, [facility_name, description, image, id], (err, result) => {
        if (err) {
            console.error(`[Facility Controller] updateFacility query error for ID: ${id}: ${err.message}`, err);
            return res.status(500).json({
                message: "Gagal mengupdate fasilitas",
                error: err.message
            });
        }
        console.log(`[Facility Controller] Facility ID: ${id} updated successfully`);
        res.status(200).json({
            message: "Fasilitas berhasil diupdate"
        });
    });
};

// DELETE hapus fasilitas
const deleteFacility = (req, res) => {
    const { id } = req.params;
    console.log(`[Facility Controller] deleteFacility called for facility ID: ${id}`);

    console.log(`[Facility Controller] Executing delete query for ID: ${id}...`);
    db.query("DELETE FROM facilities WHERE id = ?", [id], (err, result) => {
        if (err) {
            console.error(`[Facility Controller] deleteFacility query error for ID: ${id}: ${err.message}`, err);
            return res.status(500).json({
                message: "Gagal menghapus fasilitas",
                error: err.message
            });
        }
        console.log(`[Facility Controller] Facility ID: ${id} deleted successfully`);
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
