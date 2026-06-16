require("dotenv").config();
const mysql = require("mysql2");

const db = mysql.createConnection({
    host: process.env.MYSQLHOST || "localhost",
    user: process.env.MYSQLUSER || "root",
    password: process.env.MYSQLPASSWORD || "",
    database: process.env.MYSQLDATABASE || "grand_horizon_hotel",
    port: process.env.MYSQLPORT ? parseInt(process.env.MYSQLPORT, 10) : 3306
});

db.connect((err) => {
    if (err) {
        console.log("Database gagal terhubung");
        console.log(err);
    } else {
        console.log("Database berhasil terhubung");
    }
});

module.exports = db;