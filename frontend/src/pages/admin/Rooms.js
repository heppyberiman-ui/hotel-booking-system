import { useState, useEffect } from "react";
import api from "../../services/api";

function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form states
  const [roomNumber, setRoomNumber] = useState("");
  const [roomTypeId, setRoomTypeId] = useState("");
  const [price, setPrice] = useState("");
  const [status, setStatus] = useState("Tersedia");
  const [description, setDescription] = useState("");
  const [capacity, setCapacity] = useState(2);
  const [bedType, setBedType] = useState("Queen Bed");
  const [roomSize, setRoomSize] = useState(30);
  const [wifi, setWifi] = useState(false);
  const [breakfast, setBreakfast] = useState(false);
  const [ac, setAc] = useState(false);
  const [tv, setTv] = useState(false);
  const [minibar, setMinibar] = useState(false);
  const [balcony, setBalcony] = useState(false);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEditId, setCurrentEditId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stockKamar, setStockKamar] = useState(5);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // Mengambil data kamar dan tipe kamar secara paralel
      const [roomsRes, roomTypesRes] = await Promise.all([
        api.get("/rooms"),
        api.get("/room-types")
      ]);
      setRooms(roomsRes.data);
      setRoomTypes(roomTypesRes.data);
      
      // Set default roomTypeId jika data tipe kamar tersedia
      if (roomTypesRes.data.length > 0) {
        setRoomTypeId(String(roomTypesRes.data[0].id));
      }
    } catch (err) {
      console.error("Gagal memuat data rooms:", err);
      setError("Gagal memuat data kamar dari server.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRoomTypeChange = (selectedId, isAddingNew = false) => {
    setRoomTypeId(selectedId);
    
    if (isAddingNew && selectedId) {
      const selectedType = roomTypes.find(t => String(t.id) === String(selectedId));
      if (selectedType) {
        const typeName = selectedType.type_name?.toLowerCase() || "";
        
        if (typeName.includes("super deluxe")) {
          setPrice("500000");
          setDescription("Kamar Super Deluxe dengan Queen Bed nyaman, WiFi, AC, Smart TV, dan sarapan lezat.");
          setCapacity(2);
          setBedType("Queen Bed");
          setRoomSize(30);
          setWifi(true);
          setAc(true);
          setTv(true);
          setBreakfast(true);
          setMinibar(false);
          setBalcony(false);
        } else if (typeName.includes("suite")) {
          setPrice("1200000");
          setDescription("Suite Room mewah berukuran 60 m² dengan King Bed Premium, Living Room (ruang tamu terpisah), Mini Bar, balkon pribadi, WiFi, AC, Smart TV, dan sarapan pagi.");
          setCapacity(4);
          setBedType("King Bed Premium");
          setRoomSize(60);
          setWifi(true);
          setAc(true);
          setTv(true);
          setBreakfast(true);
          setMinibar(true);
          setBalcony(true);
        } else if (typeName.includes("deluxe")) {
          setPrice("750000");
          setDescription("Kamar Deluxe Room berukuran 40 m² yang luas dengan King Bed, dilengkapi balkon pribadi, WiFi, AC, Smart TV, dan sarapan pagi.");
          setCapacity(3);
          setBedType("King Bed");
          setRoomSize(40);
          setWifi(true);
          setAc(true);
          setTv(true);
          setBreakfast(true);
          setMinibar(false);
          setBalcony(true);
        }
      }
    }
  };

  const openAddModal = () => {
    setRoomNumber("");
    const defaultTypeId = roomTypes.length > 0 ? String(roomTypes[0].id) : "";
    setRoomTypeId(defaultTypeId);
    setPrice("");
    setStatus("Tersedia");
    setDescription("");
    setCapacity(2);
    setBedType("Queen Bed");
    setRoomSize(30);
    setWifi(false);
    setBreakfast(false);
    setAc(false);
    setTv(false);
    setMinibar(false);
    setBalcony(false);
    setCurrentEditId(null);
    setStockKamar(5);
    setIsModalOpen(true);

    // Trigger auto-fill defaults for the first room type
    if (defaultTypeId) {
      setTimeout(() => {
        handleRoomTypeChange(defaultTypeId, true);
      }, 0);
    }
  };

  const openEditModal = (room) => {
    setRoomNumber(room.room_number);
    setRoomTypeId(String(room.room_type_id));
    setPrice(room.price);
    setStatus(room.status === "available" ? "Tersedia" : room.status === "booked" ? "Ditempati" : "Dibersihkan");
    setDescription(room.description || "");
    setCapacity(room.capacity || 2);
    setBedType(room.bed_type || "Queen Bed");
    setRoomSize(room.room_size || 30);
    setWifi(!!room.wifi);
    setBreakfast(!!room.breakfast);
    setAc(!!room.ac);
    setTv(!!room.tv);
    setMinibar(!!room.minibar);
    setBalcony(!!room.balcony);
    setCurrentEditId(room.id);
    setStockKamar(room.stock_kamar !== undefined ? room.stock_kamar : 5);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!roomNumber || !roomTypeId || !price || !status) {
      alert("Semua field wajib diisi!");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        room_number: roomNumber,
        room_type_id: parseInt(roomTypeId),
        price: parseFloat(price),
        status: status === "Tersedia" ? "available" : status === "Ditempati" ? "booked" : "maintenance",
        description,
        capacity: parseInt(capacity),
        bed_type: bedType,
        room_size: parseInt(roomSize),
        wifi,
        breakfast,
        ac,
        tv,
        minibar,
        balcony,
        stock_kamar: parseInt(stockKamar) || 0
      };

      if (currentEditId) {
        // Edit Room
        await api.put(`/rooms/${currentEditId}`, payload);
        alert("Kamar berhasil diperbarui!");
      } else {
        // Add Room
        await api.post("/rooms", payload);
        alert("Kamar berhasil ditambahkan!");
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error("Gagal menyimpan data kamar:", err);
      alert(err.response?.data?.message || "Terjadi kesalahan saat menyimpan data.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus kamar ini?")) {
      try {
        await api.delete(`/rooms/${id}`);
        alert("Kamar berhasil dihapus!");
        fetchData();
      } catch (err) {
        console.error("Gagal menghapus kamar:", err);
        alert(err.response?.data?.message || "Gagal menghapus kamar.");
      }
    }
  };

  // Helper for formatting rupiah currency
  const formatRupiah = (num) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(num);
  };

  // Helper to color code statuses
  const getStatusBadgeStyle = (roomStatus) => {
    const baseStyle = {
      padding: "6px 12px",
      borderRadius: "20px",
      fontSize: "12px",
      fontWeight: "600",
      display: "inline-block"
    };

    switch (roomStatus?.toLowerCase()) {
      case "tersedia":
        return { ...baseStyle, backgroundColor: "rgba(16, 185, 129, 0.1)", color: "#10b981" };
      case "ditempati":
        return { ...baseStyle, backgroundColor: "rgba(99, 102, 241, 0.1)", color: "#6366f1" };
      case "dibersihkan":
        return { ...baseStyle, backgroundColor: "rgba(245, 158, 11, 0.1)", color: "#f59e0b" };
      default:
        return { ...baseStyle, backgroundColor: "rgba(100, 116, 139, 0.1)", color: "#64748b" };
    }
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "80px 0" }}>
        <div style={{ fontSize: "16px", color: "#64748b", fontWeight: "500" }}>Memuat Data Kamar...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "20px", backgroundColor: "rgba(244, 63, 94, 0.08)", border: "1px solid rgba(244, 63, 94, 0.2)", color: "#e11d48", borderRadius: "12px" }}>
        ⚠️ {error}
      </div>
    );
  }

  return (
    <div style={{ position: "relative" }}>
      {/* Header and Add Action */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <div>
          <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: "14px" }}>
            Kelola data kamar hotel, ketersediaan, harga, dan jenis tipe kamar yang terintegrasi.
          </p>
        </div>
        <button
          onClick={openAddModal}
          style={{
            padding: "12px 24px",
            borderRadius: "12px",
            border: "none",
            backgroundColor: "#6366f1",
            color: "#fff",
            fontWeight: "600",
            fontSize: "14px",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(99, 102, 241, 0.2)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.2s"
          }}
        >
          <span>+</span> Tambah Kamar
        </button>
      </div>

      {/* Main Table view */}
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "20px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02)",
          overflow: "hidden"
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
              <th style={{ padding: "18px 24px", fontSize: "12px", fontWeight: "600", color: "#475569", textTransform: "uppercase" }}>No Kamar</th>
              <th style={{ padding: "18px 24px", fontSize: "12px", fontWeight: "600", color: "#475569", textTransform: "uppercase" }}>Tipe & Spesifikasi</th>
              <th style={{ padding: "18px 24px", fontSize: "12px", fontWeight: "600", color: "#475569", textTransform: "uppercase" }}>Deskripsi</th>
              <th style={{ padding: "18px 24px", fontSize: "12px", fontWeight: "600", color: "#475569", textTransform: "uppercase" }}>Fasilitas</th>
              <th style={{ padding: "18px 24px", fontSize: "12px", fontWeight: "600", color: "#475569", textTransform: "uppercase" }}>Stok</th>
              <th style={{ padding: "18px 24px", fontSize: "12px", fontWeight: "600", color: "#475569", textTransform: "uppercase" }}>Harga Per Malam</th>
              <th style={{ padding: "18px 24px", fontSize: "12px", fontWeight: "600", color: "#475569", textTransform: "uppercase" }}>Status</th>
              <th style={{ padding: "18px 24px", fontSize: "12px", fontWeight: "600", color: "#475569", textAlign: "right" }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {rooms.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
                  Belum ada data kamar terdaftar. Silakan tambahkan kamar baru.
                </td>
              </tr>
            ) : (
              rooms.map((room) => {
                const specText = `${room.bed_type || "Queen Bed"} • ${room.room_size || 30} m² • ${room.capacity || 2} Orang`;
                
                // Construct facility badges
                const facilityBadges = [];
                if (room.wifi) facilityBadges.push({ label: "📶 WiFi", color: "#10b981", bg: "rgba(16, 185, 129, 0.08)" });
                if (room.ac) facilityBadges.push({ label: "❄️ AC", color: "#06b6d4", bg: "rgba(6, 182, 212, 0.08)" });
                if (room.tv) facilityBadges.push({ label: "📺 TV", color: "#3b82f6", bg: "rgba(59, 130, 246, 0.08)" });
                if (room.breakfast) facilityBadges.push({ label: "🍳 Sarapan", color: "#f59e0b", bg: "rgba(245, 158, 11, 0.08)" });
                if (room.balcony) facilityBadges.push({ label: "🚪 Balkon", color: "#ec4899", bg: "rgba(236, 72, 153, 0.08)" });
                if (room.minibar) facilityBadges.push({ label: "🍷 Minibar", color: "#8b5cf6", bg: "rgba(139, 92, 246, 0.08)" });
                if (room.type_name?.toLowerCase().includes("suite")) {
                  facilityBadges.push({ label: "🛋️ Living Room", color: "#6366f1", bg: "rgba(99, 102, 241, 0.08)" });
                }

                return (
                  <tr key={room.id} style={{ borderBottom: "1px solid #f1f5f9", transition: "background-color 0.2s" }}>
                    <td style={{ padding: "18px 24px", fontSize: "14px", fontWeight: "600", color: "#0f172a" }}>
                      {room.room_number}
                    </td>
                    <td style={{ padding: "18px 24px", fontSize: "14px", color: "#334155" }}>
                      <div style={{ fontWeight: "700", color: "#0f172a", marginBottom: "4px" }}>
                        {room.type_name || `Tipe ID: ${room.room_type_id}`}
                      </div>
                      <div style={{ fontSize: "12px", color: "#64748b" }}>
                        {specText}
                      </div>
                    </td>
                    <td style={{ padding: "18px 24px", fontSize: "13px", color: "#475569", maxWidth: "220px", whiteSpace: "normal", wordBreak: "break-word" }}>
                      {room.description || "-"}
                    </td>
                    <td style={{ padding: "18px 24px", maxWidth: "250px" }}>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                        {facilityBadges.map((badge, idx) => (
                          <span
                            key={idx}
                            style={{
                              fontSize: "11px",
                              padding: "4px 8px",
                              borderRadius: "6px",
                              fontWeight: "600",
                              color: badge.color,
                              backgroundColor: badge.bg,
                              whiteSpace: "nowrap"
                            }}
                          >
                            {badge.label}
                          </span>
                        ))}
                        {facilityBadges.length === 0 && <span style={{ fontSize: "12px", color: "#94a3b8" }}>Tidak ada fasilitas</span>}
                      </div>
                    </td>
                    <td style={{ padding: "18px 24px", fontSize: "14px", fontWeight: "700", color: room.stock_kamar <= 0 ? "#ef4444" : "#16a34a" }}>
                      {room.stock_kamar !== undefined ? room.stock_kamar : 5}
                    </td>
                    <td style={{ padding: "18px 24px", fontSize: "14px", fontWeight: "600", color: "#0f172a" }}>
                      {formatRupiah(room.price)}
                    </td>
                    <td style={{ padding: "18px 24px" }}>
                      <span style={getStatusBadgeStyle(room.status)}>
                        {room.status === "available" ? "Tersedia" : room.status === "booked" ? "Ditempati" : room.status === "maintenance" ? "Dibersihkan" : room.status}
                      </span>
                    </td>
                    <td style={{ padding: "18px 24px", textAlign: "right", whiteSpace: "nowrap" }}>
                      <button
                        onClick={() => openEditModal(room)}
                        style={{
                          padding: "8px 14px",
                          borderRadius: "8px",
                          border: "1px solid #cbd5e1",
                          backgroundColor: "#fff",
                          color: "#334155",
                          fontSize: "13px",
                          fontWeight: "600",
                          cursor: "pointer",
                          marginRight: "8px",
                          transition: "all 0.15s"
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(room.id)}
                        style={{
                          padding: "8px 14px",
                          borderRadius: "8px",
                          border: "none",
                          backgroundColor: "rgba(244, 63, 94, 0.08)",
                          color: "#f43f5e",
                          fontSize: "13px",
                          fontWeight: "600",
                          cursor: "pointer",
                          transition: "all 0.15s"
                        }}
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Styled Popup Modal Form */}
      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(15, 23, 42, 0.4)",
            backdropFilter: "blur(4px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 200
          }}
        >
          <div
            style={{
              width: "650px",
              maxHeight: "90vh",
              overflowY: "auto",
              backgroundColor: "#fff",
              borderRadius: "24px",
              padding: "40px",
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
              border: "1px solid #e2e8f0"
            }}
          >
            <h3 style={{ fontSize: "20px", fontWeight: "700", color: "#0f172a", margin: "0 0 8px 0" }}>
              {currentEditId ? "Edit Kamar" : "Tambah Kamar Baru"}
            </h3>
            <p style={{ fontSize: "14px", color: "#64748b", margin: "0 0 28px 0" }}>
              Isi data detail informasi kamar di bawah ini secara lengkap.
            </p>

            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#64748b", marginBottom: "8px", textTransform: "uppercase" }}>
                    Nomor Kamar
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 101"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      borderRadius: "10px",
                      border: "1px solid #cbd5e1",
                      fontSize: "14px",
                      outline: "none",
                      boxSizing: "border-box"
                    }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#64748b", marginBottom: "8px", textTransform: "uppercase" }}>
                    Tipe Kamar
                  </label>
                  <select
                    value={roomTypeId}
                    onChange={(e) => handleRoomTypeChange(e.target.value, !currentEditId)}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      borderRadius: "10px",
                      border: "1px solid #cbd5e1",
                      fontSize: "14px",
                      outline: "none",
                      backgroundColor: "#fff",
                      boxSizing: "border-box"
                    }}
                    required
                  >
                    <option value="">-- Pilih Tipe Kamar --</option>
                    {roomTypes.map((type) => (
                      <option key={type.id} value={String(type.id)}>
                        {type.type_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px", marginBottom: "20px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#64748b", marginBottom: "8px", textTransform: "uppercase" }}>
                    Harga Per Malam (Rp)
                  </label>
                  <input
                    type="number"
                    placeholder="Contoh: 750000"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      borderRadius: "10px",
                      border: "1px solid #cbd5e1",
                      fontSize: "14px",
                      outline: "none",
                      boxSizing: "border-box"
                    }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#64748b", marginBottom: "8px", textTransform: "uppercase" }}>
                    Status Kamar
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      borderRadius: "10px",
                      border: "1px solid #cbd5e1",
                      fontSize: "14px",
                      outline: "none",
                      backgroundColor: "#fff",
                      boxSizing: "border-box"
                    }}
                    required
                  >
                    <option value="Tersedia">Tersedia</option>
                    <option value="Ditempati">Ditempati</option>
                    <option value="Dibersihkan">Dibersihkan</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#64748b", marginBottom: "8px", textTransform: "uppercase" }}>
                    Stok Kamar
                  </label>
                  <input
                    type="number"
                    placeholder="Contoh: 5"
                    value={stockKamar}
                    onChange={(e) => setStockKamar(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      borderRadius: "10px",
                      border: "1px solid #cbd5e1",
                      fontSize: "14px",
                      outline: "none",
                      boxSizing: "border-box"
                    }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px", marginBottom: "20px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#64748b", marginBottom: "8px", textTransform: "uppercase" }}>
                    Kapasitas (Orang)
                  </label>
                  <input
                    type="number"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      borderRadius: "10px",
                      border: "1px solid #cbd5e1",
                      fontSize: "14px",
                      outline: "none",
                      boxSizing: "border-box"
                    }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#64748b", marginBottom: "8px", textTransform: "uppercase" }}>
                    Tipe Ranjang
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: King Bed"
                    value={bedType}
                    onChange={(e) => setBedType(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      borderRadius: "10px",
                      border: "1px solid #cbd5e1",
                      fontSize: "14px",
                      outline: "none",
                      boxSizing: "border-box"
                    }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#64748b", marginBottom: "8px", textTransform: "uppercase" }}>
                    Ukuran Kamar (m²)
                  </label>
                  <input
                    type="number"
                    value={roomSize}
                    onChange={(e) => setRoomSize(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      borderRadius: "10px",
                      border: "1px solid #cbd5e1",
                      fontSize: "14px",
                      outline: "none",
                      boxSizing: "border-box"
                    }}
                    required
                  />
                </div>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#64748b", marginBottom: "8px", textTransform: "uppercase" }}>
                  Deskripsi Kamar
                </label>
                <textarea
                  placeholder="Keterangan mengenai fasilitas dan keunikan kamar..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{
                    width: "100%",
                    height: "80px",
                    padding: "12px 16px",
                    borderRadius: "10px",
                    border: "1px solid #cbd5e1",
                    fontSize: "14px",
                    outline: "none",
                    boxSizing: "border-box",
                    resize: "vertical",
                    fontFamily: "inherit"
                  }}
                />
              </div>

              <div style={{ marginBottom: "28px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#64748b", marginBottom: "12px", textTransform: "uppercase" }}>
                  Fasilitas Kamar (Centang yang tersedia)
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "#334155", cursor: "pointer" }}>
                    <input type="checkbox" checked={wifi} onChange={(e) => setWifi(e.target.checked)} style={{ width: "16px", height: "16px" }} />
                    <span>📶 WiFi</span>
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "#334155", cursor: "pointer" }}>
                    <input type="checkbox" checked={ac} onChange={(e) => setAc(e.target.checked)} style={{ width: "16px", height: "16px" }} />
                    <span>❄️ AC</span>
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "#334155", cursor: "pointer" }}>
                    <input type="checkbox" checked={tv} onChange={(e) => setTv(e.target.checked)} style={{ width: "16px", height: "16px" }} />
                    <span>📺 TV</span>
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "#334155", cursor: "pointer" }}>
                    <input type="checkbox" checked={breakfast} onChange={(e) => setBreakfast(e.target.checked)} style={{ width: "16px", height: "16px" }} />
                    <span>🍳 Sarapan</span>
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "#334155", cursor: "pointer" }}>
                    <input type="checkbox" checked={balcony} onChange={(e) => setBalcony(e.target.checked)} style={{ width: "16px", height: "16px" }} />
                    <span>🚪 Balkon</span>
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "#334155", cursor: "pointer" }}>
                    <input type="checkbox" checked={minibar} onChange={(e) => setMinibar(e.target.checked)} style={{ width: "16px", height: "16px" }} />
                    <span>🍷 Minibar</span>
                  </label>
                </div>
              </div>

              {/* Actions form buttons */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: "12px 20px",
                    borderRadius: "12px",
                    border: "1px solid #cbd5e1",
                    backgroundColor: "#fff",
                    color: "#475569",
                    fontWeight: "600",
                    fontSize: "14px",
                    cursor: "pointer"
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: "12px 24px",
                    borderRadius: "12px",
                    border: "none",
                    backgroundColor: "#6366f1",
                    color: "#fff",
                    fontWeight: "600",
                    fontSize: "14px",
                    cursor: isSubmitting ? "not-allowed" : "pointer"
                  }}
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Rooms;
