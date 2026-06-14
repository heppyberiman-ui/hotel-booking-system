import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

function RoomsList() {
  const [rooms, setRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters state
  const [selectedType, setSelectedType] = useState("All");
  const [maxPrice, setMaxPrice] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [roomsRes, typesRes] = await Promise.all([
        api.get("/rooms"),
        api.get("/room-types"),
      ]);
      setRooms(roomsRes.data);
      setRoomTypes(typesRes.data);
    } catch (err) {
      console.error("Gagal mengambil data kamar:", err);
      setError("Gagal memuat daftar kamar. Silakan coba beberapa saat lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatRupiah = (num) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);
  };

  // Filter logic
  const filteredRooms = rooms.filter((room) => {
    // 1. Status Filter: Only show available rooms for customers
    if (room.status !== "available") return false;

    // 2. Type Filter
    if (selectedType !== "All") {
      const type = roomTypes.find((t) => t.type_name === selectedType);
      if (!type || room.room_type_id !== type.id) return false;
    }

    // 3. Price Filter
    if (maxPrice && parseFloat(room.price) > parseFloat(maxPrice)) {
      return false;
    }

    // 4. Search Filter (by room number or type name)
    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      const numMatch = room.room_number.toString().includes(query);
      const typeMatch = (room.type_name || "").toLowerCase().includes(query);
      if (!numMatch && !typeMatch) return false;
    }

    return true;
  });

  if (isLoading) {
    return (
      <div
        style={{ textAlign: "center", padding: "80px 20px", color: "#78716c" }}
      >
        <h3>Memuat Daftar Kamar...</h3>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          padding: "40px 20px",
          maxWidth: "600px",
          margin: "auto",
          textAlign: "center",
        }}
      >
        <p style={{ color: "#ef4444" }}>{error}</p>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: "#fafaf9",
        minHeight: "80vh",
        padding: "60px 20px",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Page Header */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <span
            style={{
              fontSize: "12px",
              fontWeight: "700",
              color: "#b45309",
              textTransform: "uppercase",
              letterSpacing: "2px",
            }}
          >
            Akomodasi Kami
          </span>
          <h2
            style={{
              fontSize: "32px",
              fontWeight: "800",
              color: "#1c1917",
              margin: "12px 0 16px 0",
            }}
          >
            Temukan Kamar Impian Anda
          </h2>
          <p
            style={{
              color: "#78716c",
              maxWidth: "600px",
              margin: "0 auto",
              fontSize: "15px",
              lineHeight: "1.6",
            }}
          >
            Mulai dari kamar Deluxe berpemandangan laut hingga suite
            presidential mewah dengan kolam pribadi.
          </p>
        </div>

        {/* Filters and Controls */}
        <div
          style={{
            backgroundColor: "#fff",
            border: "1px solid #e7e5e4",
            borderRadius: "16px",
            padding: "24px",
            marginBottom: "40px",
            display: "flex",
            flexWrap: "wrap",
            gap: "24px",
            alignItems: "center",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.01)",
          }}
        >
          {/* Room Type select */}
          <div style={{ flex: "1 1 200px" }}>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: "700",
                color: "#57534e",
                marginBottom: "8px",
                textTransform: "uppercase",
              }}
            >
              Tipe Kamar
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "10px",
                border: "1px solid #d6d3d1",
                fontSize: "14px",
                outline: "none",
                backgroundColor: "#fff",
              }}
            >
              <option value="All">Semua Tipe</option>
              {roomTypes.map((t) => (
                <option key={t.id} value={t.type_name}>
                  {t.type_name}
                </option>
              ))}
            </select>
          </div>

          {/* Max Price input */}
          <div style={{ flex: "1 1 200px" }}>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: "700",
                color: "#57534e",
                marginBottom: "8px",
                textTransform: "uppercase",
              }}
            >
              Harga Maksimal (Rp)
            </label>
            <input
              type="number"
              placeholder="Contoh: 1500000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "10px",
                border: "1px solid #d6d3d1",
                fontSize: "14px",
                outline: "none",
              }}
            />
          </div>

          {/* Search Term input */}
          <div style={{ flex: "2 1 300px" }}>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: "700",
                color: "#57534e",
                marginBottom: "8px",
                textTransform: "uppercase",
              }}
            >
              Cari Kamar
            </label>
            <input
              type="text"
              placeholder="Cari nomor kamar atau tipe..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "10px",
                border: "1px solid #d6d3d1",
                fontSize: "14px",
                outline: "none",
              }}
            />
          </div>
        </div>

        {/* Rooms Grid */}
        {filteredRooms.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              backgroundColor: "#fff",
              borderRadius: "16px",
              border: "1px solid #e7e5e4",
            }}
          >
            <span style={{ fontSize: "48px" }}>🛏️</span>
            <h3
              style={{
                fontSize: "18px",
                fontWeight: "700",
                color: "#1c1917",
                margin: "16px 0 8px 0",
              }}
            >
              Tidak Ada Kamar Tersedia
            </h3>
            <p style={{ color: "#78716c", fontSize: "14px", margin: 0 }}>
              Coba ubah filter pencarian Anda.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
              gap: "32px",
            }}
          >
            {filteredRooms.map((room) => {
              // Use room image if available, fallback to type image, fallback to default
              const roomImage =
                room.image_url ||
                room.image ||
                "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=600&auto=format&fit=crop";
              const capacity = room.capacity || 2;
              const desc =
                room.description ||
                room.type_description ||
                "Kamar premium dengan tempat tidur nyaman, AC, kamar mandi privat, dan Wi-Fi.";

              return (
                <div
                  key={room.id}
                  style={{
                    backgroundColor: "#fff",
                    borderRadius: "20px",
                    border: "1px solid #e7e5e4",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    boxShadow: "0 4px 10px rgba(28, 25, 23, 0.02)",
                    transition: "transform 0.2s, box-shadow 0.2s",
                  }}
                >
                  <img
                    src={roomImage}
                    alt={`Room ${room.room_number}`}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=600&auto=format&fit=crop";
                    }}
                    style={{
                      width: "100%",
                      height: "240px",
                      objectFit: "cover",
                    }}
                  />

                  <div
                    style={{
                      padding: "28px",
                      display: "flex",
                      flexDirection: "column",
                      flex: 1,
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "8px",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "12px",
                            fontWeight: "700",
                            color: "#b45309",
                            textTransform: "uppercase",
                            letterSpacing: "1px",
                          }}
                        >
                          {room.type_name || "Standard Room"}
                        </span>
                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                          <span
                            style={{
                              fontSize: "11px",
                              fontWeight: "700",
                              padding: "2px 8px",
                              borderRadius: "12px",
                              backgroundColor: room.stock_kamar === 0 ? "#fef2f2" : room.stock_kamar <= 2 ? "#fffbeb" : "#f0fdf4",
                              color: room.stock_kamar === 0 ? "#ef4444" : room.stock_kamar <= 2 ? "#d97706" : "#16a34a",
                              border: `1px solid ${room.stock_kamar === 0 ? "#fee2e2" : room.stock_kamar <= 2 ? "#fef3c7" : "#dcfce7"}`
                            }}
                          >
                            {room.stock_kamar === 0 ? "Penuh" : room.stock_kamar <= 2 ? "Hampir Habis" : "Tersedia"}
                          </span>
                          <span
                            style={{
                              fontSize: "13px",
                              color: "#78716c",
                              fontWeight: "600",
                            }}
                          >
                            👤 Max {capacity} Tamu
                          </span>
                        </div>
                      </div>

                      <h3
                        style={{
                          fontSize: "20px",
                          fontWeight: "800",
                          color: "#1c1917",
                          margin: "0 0 8px 0",
                        }}
                      >
                        Kamar {room.room_number}
                      </h3>

                      <div
                        style={{
                          fontSize: "12px",
                          color: "#78716c",
                          marginBottom: "12px",
                          display: "flex",
                          gap: "12px",
                          fontWeight: "500",
                        }}
                      >
                        <span>🛏️ {room.bed_type || "Queen Bed"}</span>
                        <span>📐 {room.room_size || 30} m²</span>
                      </div>

                      {/* Active Facilities Mini Badges */}
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "6px",
                          marginBottom: "16px",
                        }}
                      >
                        {room.wifi ? (
                          <span
                            style={{
                              fontSize: "11px",
                              backgroundColor: "rgba(16, 185, 129, 0.06)",
                              border: "1px solid rgba(16, 185, 129, 0.15)",
                              padding: "2px 6px",
                              borderRadius: "6px",
                              color: "#10b981",
                              fontWeight: "600",
                            }}
                          >
                            📶 WiFi
                          </span>
                        ) : null}
                        {room.ac ? (
                          <span
                            style={{
                              fontSize: "11px",
                              backgroundColor: "rgba(6, 182, 212, 0.06)",
                              border: "1px solid rgba(6, 182, 212, 0.15)",
                              padding: "2px 6px",
                              borderRadius: "6px",
                              color: "#0891b2",
                              fontWeight: "600",
                            }}
                          >
                            ❄️ AC
                          </span>
                        ) : null}
                        {room.tv ? (
                          <span
                            style={{
                              fontSize: "11px",
                              backgroundColor: "rgba(59, 130, 246, 0.06)",
                              border: "1px solid rgba(59, 130, 246, 0.15)",
                              padding: "2px 6px",
                              borderRadius: "6px",
                              color: "#2563eb",
                              fontWeight: "600",
                            }}
                          >
                            📺 TV
                          </span>
                        ) : null}
                        {room.breakfast ? (
                          <span
                            style={{
                              fontSize: "11px",
                              backgroundColor: "rgba(245, 158, 11, 0.06)",
                              border: "1px solid rgba(245, 158, 11, 0.15)",
                              padding: "2px 6px",
                              borderRadius: "6px",
                              color: "#d97706",
                              fontWeight: "600",
                            }}
                          >
                            🍳 Sarapan
                          </span>
                        ) : null}
                        {room.balcony ? (
                          <span
                            style={{
                              fontSize: "11px",
                              backgroundColor: "rgba(236, 72, 153, 0.06)",
                              border: "1px solid rgba(236, 72, 153, 0.15)",
                              padding: "2px 6px",
                              borderRadius: "6px",
                              color: "#db2777",
                              fontWeight: "600",
                            }}
                          >
                            🚪 Balkon
                          </span>
                        ) : null}
                        {room.minibar ? (
                          <span
                            style={{
                              fontSize: "11px",
                              backgroundColor: "rgba(139, 92, 246, 0.06)",
                              border: "1px solid rgba(139, 92, 246, 0.15)",
                              padding: "2px 6px",
                              borderRadius: "6px",
                              color: "#7c3aed",
                              fontWeight: "600",
                            }}
                          >
                            🍷 Minibar
                          </span>
                        ) : null}
                        {room.type_name?.toLowerCase().includes("suite") ? (
                          <span
                            style={{
                              fontSize: "11px",
                              backgroundColor: "rgba(99, 102, 241, 0.06)",
                              border: "1px solid rgba(99, 102, 241, 0.15)",
                              padding: "2px 6px",
                              borderRadius: "6px",
                              color: "#4f46e5",
                              fontWeight: "600",
                            }}
                          >
                            🛋️ Living Room
                          </span>
                        ) : null}
                      </div>

                      <p
                        style={{
                          fontSize: "14px",
                          color: "#57534e",
                          lineHeight: "1.6",
                          margin: "0 0 24px 0",
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          height: "67px",
                        }}
                      >
                        {desc}
                      </p>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderTop: "1px solid #f5f5f4",
                        paddingTop: "20px",
                      }}
                    >
                      <div>
                        <span
                          style={{
                            fontSize: "12px",
                            color: "#78716c",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                          }}
                        >
                          Harga / Malam
                        </span>
                        <div
                          style={{
                            fontSize: "20px",
                            fontWeight: "800",
                            color: "#1c1917",
                          }}
                        >
                          {formatRupiah(room.price)}
                        </div>
                      </div>

                      <Link
                        to={`/rooms-list/${room.id}`}
                        style={{
                          padding: "12px 24px",
                          borderRadius: "10px",
                          backgroundColor: "#b45309",
                          color: "#fff",
                          textDecoration: "none",
                          fontSize: "14px",
                          fontWeight: "700",
                          boxShadow: "0 4px 10px rgba(180, 83, 9, 0.15)",
                        }}
                      >
                        Pesan Kamar
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default RoomsList;
