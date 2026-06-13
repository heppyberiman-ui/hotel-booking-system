const db = require("../config/db");

// GET dashboard statistics
const getDashboardStats = (req, res) => {
    // 1. Core counters + revenue stats + available/occupied room counts
    const mainStatsQuery = `
        SELECT 
            (SELECT COUNT(*) FROM rooms) AS total_rooms,
            (SELECT COUNT(*) FROM room_types) AS total_room_types,
            (SELECT COUNT(*) FROM facilities) AS total_facilities,
            (SELECT COUNT(*) FROM bookings) AS total_bookings,
            (SELECT COUNT(*) FROM users) AS total_users,
            (SELECT COALESCE(SUM(total_price), 0) FROM bookings WHERE LOWER(status) = 'confirmed' OR LOWER(payment_status) = 'paid') AS total_revenue,
            (SELECT COUNT(*) FROM rooms WHERE stock_kamar > 0) AS available_rooms,
            (SELECT COUNT(*) FROM rooms WHERE stock_kamar = 0) AS occupied_rooms
    `;

    db.query(mainStatsQuery, (err, mainResults) => {
        if (err) {
            return res.status(500).json({
                message: "Gagal mengambil data dashboard",
                error: err.message
            });
        }

        const stats = mainResults[0] || {};

        // 2. Recent Bookings (top 5)
        const recentBookingsQuery = `
            SELECT bookings.*, users.name AS guest_name, users.email AS guest_email, rooms.room_number 
            FROM bookings 
            LEFT JOIN users ON bookings.user_id = users.id 
            LEFT JOIN rooms ON bookings.room_id = rooms.id 
            ORDER BY bookings.id DESC 
            LIMIT 5
        `;

        db.query(recentBookingsQuery, (err, recentResults) => {
            if (err) {
                return res.status(500).json({
                    message: "Gagal mengambil data booking terbaru",
                    error: err.message
                });
            }

            // 3. Monthly statistics grouped by check_in month of the current year
            const monthlyStatsQuery = `
                SELECT MONTH(check_in) AS month_num, COUNT(*) AS count 
                FROM bookings 
                WHERE YEAR(check_in) = YEAR(CURDATE())
                GROUP BY MONTH(check_in)
                ORDER BY MONTH(check_in) ASC
            `;

            db.query(monthlyStatsQuery, (err, monthlyResults) => {
                if (err) {
                    return res.status(500).json({
                        message: "Gagal mengambil statistik bulanan",
                        error: err.message
                    });
                }

                // Format monthly stats into a 12-month array
                const monthLabels = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
                const formattedMonthlyStats = monthLabels.map((label, index) => {
                    const monthNum = index + 1;
                    const found = monthlyResults.find(r => r.month_num === monthNum);
                    return {
                        month: label,
                        count: found ? found.count : 0
                    };
                });

                res.status(200).json({
                    total_rooms: stats.total_rooms || 0,
                    total_room_types: stats.total_room_types || 0,
                    total_facilities: stats.total_facilities || 0,
                    total_bookings: stats.total_bookings || 0,
                    total_users: stats.total_users || 0,
                    total_revenue: stats.total_revenue || 0,
                    available_rooms: stats.available_rooms || 0,
                    occupied_rooms: stats.occupied_rooms || 0,
                    recent_bookings: recentResults || [],
                    monthly_stats: formattedMonthlyStats
                });
            });
        });
    });
};

module.exports = {
    getDashboardStats
};
