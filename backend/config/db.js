const mysql = require("mysql2");

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "grand_horizon_hotel"
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