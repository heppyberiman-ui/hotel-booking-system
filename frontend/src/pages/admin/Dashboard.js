import { useState, useEffect } from "react";
import api from "../../services/api";

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const res = await api.get("/dashboard");
        setStats(res.data);
      } catch (err) {
        console.error("Gagal mengambil data dashboard:", err);
        setError("Gagal memuat data statistik dari server.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const icons = {
    rooms: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8v9" />
      </svg>
    ),
    roomTypes: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polygon points="2 17 12 22 22 17" />
        <polygon points="2 12 12 17 22 12" />
      </svg>
    ),
    facilities: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
    bookings: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    users: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    )
  };

  const formatRupiah = (num) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(num);
  };

  const cardItems = [
    {
      title: "Total Pendapatan",
      value: formatRupiah(stats?.total_revenue ?? 0),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
      bgColor: "rgba(16, 185, 129, 0.08)",
      borderColor: "rgba(16, 185, 129, 0.15)"
    },
    {
      title: "Kamar Tersedia",
      value: stats?.available_rooms ?? 0,
      icon: icons.rooms,
      bgColor: "rgba(14, 165, 233, 0.08)",
      borderColor: "rgba(14, 165, 233, 0.15)"
    },
    {
      title: "Kamar Terisi",
      value: stats?.occupied_rooms ?? 0,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M9 17v-5a3 3 0 0 1 6 0v5" />
        </svg>
      ),
      bgColor: "rgba(244, 63, 94, 0.08)",
      borderColor: "rgba(244, 63, 94, 0.15)"
    },
    {
      title: "Total Bookings",
      value: stats?.total_bookings ?? 0,
      icon: icons.bookings,
      bgColor: "rgba(99, 102, 241, 0.08)",
      borderColor: "rgba(99, 102, 241, 0.15)"
    },
    {
      title: "Total Users",
      value: stats?.total_users ?? 0,
      icon: icons.users,
      bgColor: "rgba(168, 85, 247, 0.08)",
      borderColor: "rgba(168, 85, 247, 0.15)"
    }
  ];

  if (error) {
    return (
      <div
        style={{
          padding: "24px",
          borderRadius: "16px",
          backgroundColor: "rgba(244, 63, 94, 0.08)",
          border: "1px solid rgba(244, 63, 94, 0.2)",
          color: "#e11d48",
          fontSize: "14px",
          fontWeight: "500"
        }}
      >
        ⚠️ {error}
      </div>
    );
  }

  return (
    <div>
      {/* Welcome Banner Card */}
      <div
        style={{
          background: "linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)",
          borderRadius: "20px",
          padding: "32px 40px",
          color: "#fff",
          marginBottom: "40px",
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <div>
          <h2 style={{ margin: "0 0 8px 0", fontSize: "24px", fontWeight: "700" }}>
            Selamat Datang di Portal Admin!
          </h2>
          <p style={{ margin: 0, color: "#94a3b8", fontSize: "14px", fontWeight: "400" }}>
            Kelola operasional kamar, tipe kamar, reservasi, dan data pengguna secara real-time.
          </p>
        </div>
        <span style={{ fontSize: "52px" }}>⚡</span>
      </div>

      {/* Grid of Stats Cards */}
      <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#475569", marginBottom: "20px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
        Statistik Hotel
      </h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "24px"
        }}
      >
        {cardItems.map((item) => (
          <div
            key={item.title}
            style={{
              backgroundColor: "#fff",
              borderRadius: "20px",
              padding: "24px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02)",
              display: "flex",
              alignItems: "center",
              gap: "20px",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              cursor: "default"
            }}
          >
            <div
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "14px",
                backgroundColor: item.bgColor,
                border: `1px solid ${item.borderColor}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              {item.icon}
            </div>

            <div>
              <div style={{ fontSize: "13px", color: "#64748b", fontWeight: "500", marginBottom: "4px" }}>
                {item.title}
              </div>
              {isLoading ? (
                <div
                  style={{
                    width: "40px",
                    height: "24px",
                    backgroundColor: "#e2e8f0",
                    borderRadius: "6px"
                  }}
                />
              ) : (
                <div style={{ fontSize: "20px", fontWeight: "700", color: "#0f172a" }}>
                  {item.value}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Bookings and Monthly Chart grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "32px", marginTop: "40px", alignItems: "start" }}>
        
        {/* Recent Bookings Section */}
        <div style={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "20px", padding: "24px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.02)" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", margin: "0 0 20px 0" }}>Booking Terbaru</h3>
          
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13.5px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #f1f5f9", color: "#64748b" }}>
                  <th style={{ padding: "10px 8px", fontWeight: "600" }}>Kode / Tamu</th>
                  <th style={{ padding: "10px 8px", fontWeight: "600" }}>Kamar</th>
                  <th style={{ padding: "10px 8px", fontWeight: "600" }}>Total</th>
                  <th style={{ padding: "10px 8px", fontWeight: "600", textAlign: "right" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {!stats?.recent_bookings || stats.recent_bookings.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ padding: "20px", textAlign: "center", color: "#64748b" }}>Belum ada pemesanan terbaru</td>
                  </tr>
                ) : (
                  stats.recent_bookings.map((b) => (
                    <tr key={b.id} style={{ borderBottom: "1px solid #f8fafc" }}>
                      <td style={{ padding: "12px 8px" }}>
                        <div style={{ fontWeight: "700", color: "#0f172a" }}>{b.booking_code || `#${b.id}`}</div>
                        <div style={{ fontSize: "11px", color: "#64748b" }}>{b.guest_name}</div>
                      </td>
                      <td style={{ padding: "12px 8px", color: "#334155" }}>Kamar {b.room_number || b.room_id}</td>
                      <td style={{ padding: "12px 8px", fontWeight: "600", color: "#0f172a" }}>{formatRupiah(b.total_price)}</td>
                      <td style={{ padding: "12px 8px", textAlign: "right" }}>
                        <span style={{
                          fontSize: "11px",
                          fontWeight: "700",
                          padding: "3px 8px",
                          borderRadius: "4px",
                          backgroundColor: b.status?.toLowerCase() === "confirmed" ? "rgba(16, 185, 129, 0.1)" : b.status?.toLowerCase() === "cancelled" ? "rgba(244, 63, 94, 0.1)" : "rgba(245, 158, 11, 0.1)",
                          color: b.status?.toLowerCase() === "confirmed" ? "#10b981" : b.status?.toLowerCase() === "cancelled" ? "#f43f5e" : "#f59e0b",
                          textTransform: "capitalize"
                        }}>
                          {b.status || "Pending"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Monthly Chart Section */}
        <div style={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "20px", padding: "24px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.02)" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", margin: "0 0 20px 0" }}>Statistik Bulanan Booking ({new Date().getFullYear()})</h3>
          
          <div style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
            {/* Custom SVG Chart */}
            <div style={{ width: "100%", height: "200px", position: "relative", marginTop: "10px" }}>
              <svg viewBox="0 0 480 200" style={{ width: "100%", height: "100%" }}>
                {/* Y Axis line */}
                <line x1="40" y1="10" x2="40" y2="160" stroke="#cbd5e1" strokeWidth="1" />
                {/* X Axis line */}
                <line x1="40" y1="160" x2="460" y2="160" stroke="#cbd5e1" strokeWidth="1" />
                
                {/* Gridlines */}
                <line x1="40" y1="110" x2="460" y2="110" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4" />
                <line x1="40" y1="60" x2="460" y2="60" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4" />
                <line x1="40" y1="10" x2="460" y2="10" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4" />

                {/* Grid label text */}
                <text x="30" y="163" fill="#94a3b8" fontSize="10" textAnchor="end">0</text>
                <text x="30" y="113" fill="#94a3b8" fontSize="10" textAnchor="end">{String(Math.ceil((stats?.monthly_stats ? Math.max(...stats.monthly_stats.map(s => s.count)) : 10) / 2))}</text>
                <text x="30" y="13" fill="#94a3b8" fontSize="10" textAnchor="end">{String(stats?.monthly_stats ? Math.max(...stats.monthly_stats.map(s => s.count), 10) : 10)}</text>
                
                {/* Bars */}
                {stats?.monthly_stats?.map((item, idx) => {
                  const maxCount = Math.max(...stats.monthly_stats.map(s => s.count), 5);
                  const barHeight = (item.count / maxCount) * 140; // max height 140px
                  const barWidth = 22;
                  const xPos = 55 + idx * 34; // spacing
                  const yPos = 160 - barHeight;

                  return (
                    <g key={idx}>
                      {/* Interactive Bar */}
                      <rect
                        x={xPos}
                        y={yPos}
                        width={barWidth}
                        height={barHeight}
                        fill="#6366f1"
                        rx="4"
                        style={{ transition: "all 0.3s ease", cursor: "pointer" }}
                      />
                      {/* Bar hover label (value) */}
                      {item.count > 0 && (
                        <text
                          x={xPos + barWidth / 2}
                          y={yPos - 5}
                          fill="#0f172a"
                          fontWeight="700"
                          fontSize="10"
                          textAnchor="middle"
                        >
                          {item.count}
                        </text>
                      )}
                      {/* Month label under the X axis */}
                      <text
                        x={xPos + barWidth / 2}
                        y="178"
                        fill="#64748b"
                        fontSize="9"
                        fontWeight="600"
                        textAnchor="middle"
                      >
                        {item.month}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
            
            <div style={{ marginTop: "16px", fontSize: "12.5px", color: "#64748b", display: "flex", justifyContent: "space-between", borderTop: "1px solid #f1f5f9", paddingTop: "12px" }}>
              <span>📅 Data Reservasi Tahun {new Date().getFullYear()}</span>
              <span>Total: <strong>{stats?.monthly_stats?.reduce((sum, s) => sum + s.count, 0) || 0} Booking</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
