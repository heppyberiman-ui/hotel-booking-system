require("dotenv").config();
const mysql = require("mysql2");

console.log(`Initializing database pool: connecting to ${process.env.MYSQLHOST}:${process.env.MYSQLPORT || '3306'}...`);

const db = mysql.createPool({
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    port: process.env.MYSQLPORT ? parseInt(process.env.MYSQLPORT, 10) : undefined,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 10000,
    acquireTimeout: 10000,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000
});

db.getConnection((err, connection) => {
    if (err) {
        console.error("Database gagal terhubung");
        console.error(err);
    } else {
        console.log("Database berhasil terhubung");
        connection.release();

        // Auto-initialize database tables if empty
        const initDatabase = require("./init_db");
        initDatabase(db)
            .then(() => {
                console.log("Database initialization check complete.");
            })
            .catch((initErr) => {
                console.error("Database initialization check failed:", initErr);
            });
    }
});

db.on("error", (err) => {
    console.error("Unexpected error on idle database client/pool:", err);
});

module.exports = db;