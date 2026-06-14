import { useState, useEffect } from "react";
import api from "./services/api";

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

  // Custom SVGs for stats card icons
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

  const cardItems = [
    {
      title: "Total Rooms",
      value: stats?.total_rooms ?? 0,
      icon: icons.rooms,
      bgColor: "rgba(99, 102, 241, 0.08)",
      borderColor: "rgba(99, 102, 241, 0.15)"
    },
    {
      title: "Total Room Types",
      value: stats?.total_room_types ?? 0,
      icon: icons.roomTypes,
      bgColor: "rgba(168, 85, 247, 0.08)",
      borderColor: "rgba(168, 85, 247, 0.15)"
    },
    {
      title: "Total Facilities",
      value: stats?.total_facilities ?? 0,
      icon: icons.facilities,
      bgColor: "rgba(16, 185, 129, 0.08)",
      borderColor: "rgba(16, 185, 129, 0.15)"
    },
    {
      title: "Total Bookings",
      value: stats?.total_bookings ?? 0,
      icon: icons.bookings,
      bgColor: "rgba(244, 63, 94, 0.08)",
      borderColor: "rgba(244, 63, 94, 0.15)"
    },
    {
      title: "Total Users",
      value: stats?.total_users ?? 0,
      icon: icons.users,
      bgColor: "rgba(14, 165, 233, 0.08)",
      borderColor: "rgba(14, 165, 233, 0.15)"
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
          fontWeight: "500",
          fontFamily: "'Inter', sans-serif"
        }}
      >
        ⚠️ {error}
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
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
            {/* Styled Icon Wrapper with custom bg */}
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

            {/* Label and Count values */}
            <div>
              <div style={{ fontSize: "13px", color: "#64748b", fontWeight: "500", marginBottom: "4px" }}>
                {item.title}
              </div>
              {isLoading ? (
                /* Dynamic loading skeleton text */
                <div
                  style={{
                    width: "40px",
                    height: "24px",
                    backgroundColor: "#e2e8f0",
                    borderRadius: "6px",
                    animation: "pulse 1.5s infinite ease-in-out"
                  }}
                />
              ) : (
                <div style={{ fontSize: "28px", fontWeight: "700", color: "#0f172a" }}>
                  {item.value}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;