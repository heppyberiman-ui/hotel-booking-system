const db = require("./config/db");

const columnsToAdd = [
  { name: "description", type: "TEXT NULL" },
  { name: "capacity", type: "INT DEFAULT 2" },
  { name: "bed_type", type: "VARCHAR(100) NULL" },
  { name: "room_size", type: "INT DEFAULT 0" },
  { name: "wifi", type: "TINYINT(1) DEFAULT 0" },
  { name: "breakfast", type: "TINYINT(1) DEFAULT 0" },
  { name: "ac", type: "TINYINT(1) DEFAULT 0" },
  { name: "tv", type: "TINYINT(1) DEFAULT 0" },
  { name: "minibar", type: "TINYINT(1) DEFAULT 0" },
  { name: "balcony", type: "TINYINT(1) DEFAULT 0" },
  { name: "stock_kamar", type: "INT DEFAULT 5" },
];

const roomTypeColumns = [
  { name: "image_url", type: "VARCHAR(500) NULL" },
  { name: "base_price", type: "DECIMAL(10, 2) DEFAULT 0" },
];

const checkAndAddColumn = (tableName, col) => {
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'grand_horizon_hotel' AND TABLE_NAME = ? AND COLUMN_NAME = ?",
      [tableName, col.name],
      (err, results) => {
        if (err) return reject(err);
        if (results.length > 0) {
          console.log(`Column "${col.name}" already exists in ${tableName}. Skipping.`);
          resolve();
        } else {
          console.log(`Adding column "${col.name}" to ${tableName}...`);
          db.query(
            `ALTER TABLE ${tableName} ADD COLUMN ${col.name} ${col.type}`,
            (err) => {
              if (err) return reject(err);
              console.log(`Column "${col.name}" added successfully to ${tableName}.`);
              resolve();
            },
          );
        }
      },
    );
  });
};

const updateRooms = () => {
  return new Promise((resolve, reject) => {
    console.log("Updating existing rooms specifications...");
    const query1 = `
            UPDATE rooms SET 
                description = 'Kamar Super Deluxe dengan Queen Bed nyaman, WiFi, AC, Smart TV, dan sarapan lezat.',
                capacity = 2,
                bed_type = 'Queen Bed',
                room_size = 30,
                wifi = 1, ac = 1, tv = 1, breakfast = 1, minibar = 0, balcony = 0,
                price = 500000.00
            WHERE room_type_id = 1 OR room_number IN ('101', '102')
        `;
    db.query(query1, (err) => {
      if (err) return reject(err);
      console.log("Super Deluxe rooms (Room 101, 102) updated.");

      const query2 = `
                UPDATE rooms SET 
                    description = 'Kamar Deluxe Room berukuran 40 m² yang luas dengan King Bed, dilengkapi balkon pribadi, WiFi, AC, Smart TV, dan sarapan pagi.',
                    capacity = 3,
                    bed_type = 'King Bed',
                    room_size = 40,
                    wifi = 1, ac = 1, tv = 1, breakfast = 1, minibar = 0, balcony = 1,
                    price = 750000.00
                WHERE room_type_id = 2 OR room_number = '201'
            `;
      db.query(query2, (err) => {
        if (err) return reject(err);
        console.log("Deluxe Room rooms (Room 201) updated.");
        resolve();
      });
    });
  });
};

const insertSuiteRoom = () => {
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT id FROM rooms WHERE room_number = '301'",
      (err, results) => {
        if (err) return reject(err);
        if (results.length > 0) {
          console.log("Room 301 already exists. Updating its details instead.");
          const queryUpdate = `
                    UPDATE rooms SET 
                        room_type_id = 3,
                        price = 1200000.00,
                        description = 'Suite Room mewah berukuran 60 m² dengan King Bed Premium, Living Room (ruang tamu terpisah), Mini Bar, balkon pribadi, WiFi, AC, Smart TV, dan sarapan pagi.',
                        capacity = 4,
                        bed_type = 'King Bed Premium',
                        room_size = 60,
                        wifi = 1, ac = 1, tv = 1, breakfast = 1, minibar = 1, balcony = 1
                    WHERE room_number = '301'
                `;
          db.query(queryUpdate, (err) => {
            if (err) return reject(err);
            console.log("Room 301 updated successfully.");
            resolve();
          });
        } else {
          console.log("Inserting new Room 301 (Suite Room)...");
          const queryInsert = `
                    INSERT INTO rooms (
                        room_number, room_type_id, price, status,
                        description, capacity, bed_type, room_size,
                        wifi, breakfast, ac, tv, minibar, balcony
                    ) VALUES (
                        '301', 3, 1200000.00, 'available',
                        'Suite Room mewah berukuran 60 m² dengan King Bed Premium, Living Room (ruang tamu terpisah), Mini Bar, balkon pribadi, WiFi, AC, Smart TV, dan sarapan pagi.',
                        4, 'King Bed Premium', 60,
                        1, 1, 1, 1, 1, 1
                    )
                `;
          db.query(queryInsert, (err) => {
            if (err) return reject(err);
            console.log("Room 301 inserted successfully.");
            resolve();
          });
        }
      },
    );
  });
};

const insertNewRooms = () => {
  return new Promise((resolve, reject) => {
    // Check and Insert Room 202
    db.query("SELECT id FROM rooms WHERE room_number = '202'", (err, results202) => {
      if (err) return reject(err);
      
      const insertOrUpdate202 = () => {
        return new Promise((res202, rej202) => {
          if (results202.length > 0) {
            console.log("Room 202 already exists. Updating details.");
            const queryUpdate = `
              UPDATE rooms SET 
                  room_type_id = 2,
                  price = 750000.00,
                  description = 'Kamar Deluxe Room berukuran 40 m² yang luas dengan King Bed, dilengkapi balkon pribadi, WiFi, AC, Smart TV, dan sarapan pagi.',
                  capacity = 3,
                  bed_type = 'King Bed',
                  room_size = 40,
                  wifi = 1, ac = 1, tv = 1, breakfast = 1, minibar = 0, balcony = 1
              WHERE room_number = '202'
            `;
            db.query(queryUpdate, (err) => {
              if (err) return rej202(err);
              console.log("Room 202 updated.");
              res202();
            });
          } else {
            console.log("Inserting Room 202...");
            const queryInsert = `
              INSERT INTO rooms (
                  room_number, room_type_id, price, status,
                  description, capacity, bed_type, room_size,
                  wifi, breakfast, ac, tv, minibar, balcony
              ) VALUES (
                  '202', 2, 750000.00, 'available',
                  'Kamar Deluxe Room berukuran 40 m² yang luas dengan King Bed, dilengkapi balkon pribadi, WiFi, AC, Smart TV, dan sarapan pagi.',
                  3, 'King Bed', 40,
                  1, 1, 1, 1, 0, 1
              )
            `;
            db.query(queryInsert, (err) => {
              if (err) return rej202(err);
              console.log("Room 202 inserted.");
              res202();
            });
          }
        });
      };

      insertOrUpdate202().then(() => {
        // Check and Insert Room 302
        db.query("SELECT id FROM rooms WHERE room_number = '302'", (err, results302) => {
          if (err) return reject(err);
          
          if (results302.length > 0) {
            console.log("Room 302 already exists. Updating details.");
            const queryUpdate = `
              UPDATE rooms SET 
                  room_type_id = 3,
                  price = 1200000.00,
                  description = 'Suite Room mewah berukuran 60 m² dengan King Bed Premium, Living Room (ruang tamu terpisah), Mini Bar, balkon pribadi, WiFi, AC, Smart TV, dan sarapan pagi.',
                  capacity = 4,
                  bed_type = 'King Bed Premium',
                  room_size = 60,
                  wifi = 1, ac = 1, tv = 1, breakfast = 1, minibar = 1, balcony = 1
              WHERE room_number = '302'
            `;
            db.query(queryUpdate, (err) => {
              if (err) return reject(err);
              console.log("Room 302 updated.");
              resolve();
            });
          } else {
            console.log("Inserting Room 302...");
            const queryInsert = `
              INSERT INTO rooms (
                  room_number, room_type_id, price, status,
                  description, capacity, bed_type, room_size,
                  wifi, breakfast, ac, tv, minibar, balcony
              ) VALUES (
                  '302', 3, 1200000.00, 'available',
                  'Suite Room mewah berukuran 60 m² dengan King Bed Premium, Living Room (ruang tamu terpisah), Mini Bar, balkon pribadi, WiFi, AC, Smart TV, dan sarapan pagi.',
                  4, 'King Bed Premium', 60,
                  1, 1, 1, 1, 1, 1
              )
            `;
            db.query(queryInsert, (err) => {
              if (err) return reject(err);
              console.log("Room 302 inserted.");
              resolve();
            });
          }
        });
      }).catch(reject);
    });
  });
};

const bookingColumns = [
  { name: "payment_method", type: "VARCHAR(100) NULL" },
  { name: "payment_proof", type: "VARCHAR(255) NULL" },
  { name: "payment_status", type: "ENUM('pending', 'paid', 'cancelled') DEFAULT 'pending'" },
  { name: "verified_at", type: "DATETIME NULL" },
  { name: "verified_by", type: "VARCHAR(100) NULL" },
];

const alterBookingsTable = () => {
  return new Promise((resolve, reject) => {
    console.log("Altering bookings table status, payment_status, and adding booking_code...");
    const q1 = "ALTER TABLE bookings MODIFY COLUMN status VARCHAR(50) DEFAULT 'Pending Verification'";
    db.query(q1, (err) => {
      if (err) return reject(err);
      console.log("bookings.status modified to VARCHAR(50) DEFAULT 'Pending Verification'.");
      
      const q2 = "ALTER TABLE bookings MODIFY COLUMN payment_status VARCHAR(50) DEFAULT 'pending'";
      db.query(q2, (err) => {
        if (err) return reject(err);
        console.log("bookings.payment_status modified to VARCHAR(50) DEFAULT 'pending'.");

        // Check if booking_code column exists first
        db.query(
          "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'grand_horizon_hotel' AND TABLE_NAME = 'bookings' AND COLUMN_NAME = 'booking_code'",
          [1], // placeholder or empty since the table schema and table name check uses parameters
          (err, results) => {
            // Note: information_schema check in checkAndAddColumn uses tableName and col.name as params. Let's write it explicitly.
            db.query(
              "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'grand_horizon_hotel' AND TABLE_NAME = 'bookings' AND COLUMN_NAME = 'booking_code'",
              (err, results) => {
                if (err) return reject(err);
                if (results.length > 0) {
                  console.log("Column 'booking_code' already exists. Skipping.");
                  resolve();
                } else {
                  db.query("ALTER TABLE bookings ADD COLUMN booking_code VARCHAR(100) NULL UNIQUE", (err) => {
                    if (err) return reject(err);
                    console.log("Column 'booking_code' added successfully with UNIQUE index.");
                    resolve();
                  });
                }
              }
            );
          }
        );
      });
    });
  });
};

const alterUsersTable = () => {
  return new Promise((resolve, reject) => {
    console.log("Altering users table password column and adding avatar_url...");
    const q1 = "ALTER TABLE users MODIFY COLUMN password VARCHAR(255) NULL";
    db.query(q1, (err) => {
      if (err) return reject(err);
      console.log("users.password modified to VARCHAR(255) NULL.");
      
      // Check if avatar_url column exists first
      db.query(
        "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'grand_horizon_hotel' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'avatar_url'",
        (err, results) => {
          if (err) return reject(err);
          if (results.length > 0) {
            console.log("Column 'avatar_url' already exists. Skipping.");
            resolve();
          } else {
            db.query("ALTER TABLE users ADD COLUMN avatar_url VARCHAR(255) NULL", (err) => {
              if (err) return reject(err);
              console.log("Column 'avatar_url' added successfully.");
              resolve();
            });
          }
        }
      );
    });
  });
};

const runMigration = async () => {
  try {
    console.log("Starting database migration...");
        
    // Add columns to rooms table
    for (const col of columnsToAdd) {
        await checkAndAddColumn("rooms", col);
    }
    
    // Add columns to room_types table
    for (const col of roomTypeColumns) {
        await checkAndAddColumn("room_types", col);
    }

    // Add columns to bookings table
    for (const col of bookingColumns) {
        await checkAndAddColumn("bookings", col);
    }
    
    await updateRooms();
    await insertSuiteRoom();
    await insertNewRooms();
    await updateRoomTypeImages();
    await alterBookingsTable();
    await alterUsersTable();
    
    console.log("Database migration completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Database migration failed:", err);
    process.exit(1);
  }
};

const updateRoomTypeImages = () => {
    return new Promise((resolve, reject) => {
        console.log("Updating room type images and prices...");
        
        // Update Super Deluxe
        const query1 = `
            UPDATE room_types SET 
                base_price = 500000.00,
                image_url = 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=1600&auto=format&fit=crop',
                description = 'Kamar Super Deluxe dengan Queen Bed nyaman, WiFi, AC, Smart TV, dan sarapan lezat.'
            WHERE type_name = 'Super Deluxe'
        `;
        
        db.query(query1, (err) => {
            if (err) return reject(err);
            console.log("Super Deluxe room type updated.");
            
            // Update Deluxe Room
            const query2 = `
                UPDATE room_types SET 
                    base_price = 750000.00,
                    image_url = 'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1600&auto=format&fit=crop',
                    description = 'Kamar Deluxe Room berukuran 40 m² yang luas dengan King Bed, dilengkapi balkon pribadi.'
                WHERE type_name = 'Deluxe Room' OR type_name = 'Deluxe'
            `;
            
            db.query(query2, (err) => {
                if (err) return reject(err);
                console.log("Deluxe room type updated.");
                
                // Update Suite Room
                const query3 = `
                    UPDATE room_types SET 
                        base_price = 1200000.00,
                        image_url = 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=1600&auto=format&fit=crop',
                        description = 'Suite Room mewah berukuran 60 m² dengan King Bed Premium, Living Room, dan Mini Bar.'
                    WHERE type_name = 'Suite Room'
                `;
                
                db.query(query3, (err) => {
                    if (err) return reject(err);
                    console.log("Suite room type updated.");
                    resolve();
                });
            });
        });
    });
};

runMigration();

