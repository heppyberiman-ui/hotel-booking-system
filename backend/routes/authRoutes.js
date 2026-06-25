const express = require("express");
const router = express.Router();

const { register, login, googleLogin, tempResetAdmin } = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.post("/google-login", googleLogin);
router.post("/temp-reset-admin", tempResetAdmin);

module.exports = router;
