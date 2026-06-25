const fs = require("fs");
const path = require("path");

const initDatabase = (db) => {
    return new Promise((resolve, reject) => {
        db.query("SHOW TABLES LIKE 'users'", (err, results) => {
            if (err) {
                console.error("[DB Init] Failed to check for existing tables:", err);
                return reject(err);
            }

            if (results.length > 0) {
                console.log("[DB Init] Tables already exist (found 'users' table). Skipping initialization.");
                return resolve();
            }

            console.log("[DB Init] Table 'users' not found. Starting database schema initialization from SQL dump...");

            try {
                const sqlPath = path.join(__dirname, "../database/grand_horizon_hotel.sql");
                if (!fs.existsSync(sqlPath)) {
                    console.error("[DB Init] SQL dump file not found at:", sqlPath);
                    return resolve(); // Resolve gracefully so server still boots
                }

                const sqlContent = fs.readFileSync(sqlPath, "utf8");
                
                // Parse SQL statements
                // 1. Remove standard comments (-- ...) and empty lines
                const lines = sqlContent.split(/\r?\n/);
                let cleanSql = "";
                for (let line of lines) {
                    const trimmed = line.trim();
                    if (trimmed.startsWith("--") || trimmed.startsWith("/*") || trimmed.startsWith("*")) {
                        continue;
                    }
                    cleanSql += line + "\n";
                }

                // 2. Split statements by semicolon
                // We split by semicolon followed by whitespace or end of line/string
                const statements = cleanSql
                    .split(/;\s*$/m)
                    .map(stmt => stmt.trim())
                    .filter(stmt => stmt.length > 0);

                console.log(`[DB Init] Found ${statements.length} SQL statements to execute.`);

                // Execute statements sequentially
                let p = Promise.resolve();
                statements.forEach((stmt) => {
                    p = p.then(() => {
                        return new Promise((resStmt, rejStmt) => {
                            db.query(stmt, (stmtErr) => {
                                if (stmtErr) {
                                    // Ignore some benign dump header/footer errors if they happen
                                    if (stmtErr.message.includes("CHARACTER SET") || stmtErr.message.includes("COLLATION") || stmtErr.message.includes("time_zone")) {
                                        console.log(`[DB Init] Ignoring minor setup warning: ${stmtErr.message}`);
                                        return resStmt();
                                    }
                                    console.error(`[DB Init] Error executing statement: ${stmt.substring(0, 100)}...`);
                                    console.error(stmtErr);
                                    return rejStmt(stmtErr);
                                }
                                resStmt();
                            });
                        });
                    });
                });

                p.then(() => {
                    console.log("[DB Init] Database schema initialized and populated successfully!");
                    resolve();
                }).catch((execErr) => {
                    console.error("[DB Init] Database schema initialization failed:", execErr);
                    reject(execErr);
                });

            } catch (error) {
                console.error("[DB Init] Failed to read or parse SQL dump:", error);
                reject(error);
            }
        });
    });
};

module.exports = initDatabase;
