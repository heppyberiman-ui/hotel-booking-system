const express = require("express");
const router = express.Router();

const {
    getAllFacilities,
    createFacility,
    updateFacility,
    deleteFacility
} = require("../controllers/facilityController");

router.get("/", getAllFacilities);
router.post("/", createFacility);
router.put("/:id", updateFacility);
router.delete("/:id", deleteFacility);

module.exports = router;
