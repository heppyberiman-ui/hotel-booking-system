// Helper Page Wrapper Component
function ViewContainer({ title, description, headers, data }) {
  return (
    <div style={{ animation: "fadeIn 0.5s ease", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <div>
          <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: "14px" }}>
            {description}
          </p>
        </div>
        <button
          onClick={() => alert(`Fitur Add New ${title} sedang dikembangkan!`)}
          style={{
            padding: "10px 20px",
            borderRadius: "10px",
            border: "none",
            backgroundColor: "#6366f1",
            color: "#fff",
            fontWeight: "600",
            fontSize: "14px",
            cursor: "pointer",
            boxShadow: "0 4px 10px rgba(99, 102, 241, 0.2)",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >
          <span>+</span> Tambah {title}
        </button>
      </div>

      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "16px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
          overflow: "hidden"
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
              {headers.map((h) => (
                <th key={h} style={{ padding: "16px 24px", fontSize: "12px", fontWeight: "600", color: "#475569", textTransform: "uppercase" }}>
                  {h}
                </th>
              ))}
              <th style={{ padding: "16px 24px", fontSize: "12px", fontWeight: "600", color: "#475569", textAlign: "right" }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9", transition: "background-color 0.2s" }}>
                {Object.values(row).map((val, cellIdx) => (
                  <td key={cellIdx} style={{ padding: "18px 24px", fontSize: "14px", color: "#334155" }}>
                    {val}
                  </td>
                ))}
                <td style={{ padding: "18px 24px", textAlign: "right" }}>
                  <button
                    onClick={() => alert("Fitur edit sedang dikembangkan")}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "6px",
                      border: "1px solid #cbd5e1",
                      backgroundColor: "#fff",
                      fontSize: "12px",
                      fontWeight: "500",
                      cursor: "pointer",
                      marginRight: "8px"
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => alert("Fitur hapus sedang dikembangkan")}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "6px",
                      border: "none",
                      backgroundColor: "rgba(244, 63, 94, 0.08)",
                      color: "#f43f5e",
                      fontSize: "12px",
                      fontWeight: "600",
                      cursor: "pointer"
                    }}
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export const RoomTypesPage = () => (
  <ViewContainer
    title="Tipe Kamar"
    description="Kelola jenis tipe kamar hotel yang tersedia di database grand_horizon_hotel."
    headers={["Nama Tipe", "Kapasitas", "Fasilitas Kamar"]}
    data={[
      { name: "Standard Cozy", capacity: "2 Tamu", facilities: "WiFi, AC, TV, Kamar Mandi Dalam" },
      { name: "Deluxe Ocean View", capacity: "2 Tamu", facilities: "Balkon Laut, Mini Bar, Smart TV, Bathup" },
      { name: "Family Sweet Suite", capacity: "4 Tamu", facilities: "2 Kamar Tidur, Dapur Mini, Living Room, Jacuzzi" },
      { name: "Presidential Suite", capacity: "6 Tamu", facilities: "Private Pool, Butler Service, Dinning Room, View 360" }
    ]}
  />
);

export const FacilitiesPage = () => (
  <ViewContainer
    title="Fasilitas"
    description="Kelola daftar fasilitas penunjang hotel yang ditawarkan."
    headers={["Nama Fasilitas", "Lokasi", "Jam Operasional"]}
    data={[
      { name: "Infinity Pool", location: "Rooftop (Lantai 15)", hours: "06:00 - 21:00" },
      { name: "Horizon Spa & Gym", location: "Lantai 2", hours: "08:00 - 22:00" },
      { name: "Aurora Sky Lounge", location: "Lantai 16", hours: "16:00 - 02:00" },
      { name: "Meeting Room Horizon", location: "Lantai Lobby", hours: "24 Jam (Reservasi)" }
    ]}
  />
);

export const BookingsPage = () => (
  <ViewContainer
    title="Reservasi"
    description="Kelola transaksi reservasi kamar tamu hotel secara terpusat."
    headers={["Tamu", "No Kamar", "Check In", "Check Out", "Status"]}
    data={[
      { guest: "Lina Arief", room: "101", in: "11-06-2026", out: "13-06-2026", status: "Confirmed" },
      { guest: "Budi Santoso", room: "202", in: "12-06-2026", out: "15-06-2026", status: "Pending" },
      { guest: "Dewi Lestari", room: "102", in: "10-06-2026", out: "11-06-2026", status: "Checkout" }
    ]}
  />
);

export const UsersPage = () => (
  <ViewContainer
    title="User"
    description="Kelola hak akses pengguna, admin, staf resepsionis, dan customer."
    headers={["Nama Lengkap", "Email", "Role Akun"]}
    data={[
      { name: "Admin Utama", email: "admin@hotel.com", role: "Administrator" },
      { name: "Rina Resepsionis", email: "rina.receptionist@hotel.com", role: "Staff/Receptionist" },
      { name: "Lina Arief", email: "lina@customer.com", role: "Customer" },
      { name: "Budi Santoso", email: "budi@gmail.com", role: "Customer" }
    ]}
  />
);
