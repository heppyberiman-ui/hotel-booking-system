import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../../services/api";
import "./RoomDetail.css";
import {
  Waves,
  Utensils,
  Dumbbell,
  Sparkles,
  Car,
  Clock,
  ArrowLeft,
  Star
} from "lucide-react";

// Safe JWT Decoder helper
const getUserFromToken = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
};

function RoomDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = getUserFromToken();

  const [room, setRoom] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activePhoto, setActivePhoto] = useState("");

  // Reservation states
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [totalPrice, setTotalPrice] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("BCA");
  const [paymentProofFile, setPaymentProofFile] = useState(null);


  const fetchRoomData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch specific room by ID with all details
      const roomRes = await api.get(`/rooms/${id}`);
      setRoom(roomRes.data);
      setActivePhoto(roomRes.data.image_url || roomRes.data.image || "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1200&auto=format&fit=crop");
    } catch (err) {
      console.error("Gagal memuat detail kamar:", err);
      setError("Gagal memuat detail kamar dari server.");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchRoomData();
  }, [fetchRoomData]);

  // Calculate total price automatically
  useEffect(() => {
    if (checkIn && checkOut && room) {
      const start = new Date(checkIn);
      const end = new Date(checkOut);
      const timeDiff = end.getTime() - start.getTime();
      const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));
      if (nights > 0) {
        setTotalPrice(room.price * nights);
      } else {
        setTotalPrice(0);
      }
    } else {
      setTotalPrice(0);
    }
  }, [checkIn, checkOut, room]);

  const handleBookingSubmit = async (e) => {
    e.preventDefault();

    // Check if user is authenticated
    if (!user) {
      alert("Anda wajib login terlebih dahulu untuk melakukan booking!");
      navigate("/customer-login");
      return;
    }

    if (room.stock_kamar <= 0) {
      alert("Maaf, stok kamar ini sedang habis!");
      return;
    }

    if (!checkIn || !checkOut) {
      alert("Pilih tanggal check-in dan check-out terlebih dahulu!");
      return;
    }

    if (totalPrice <= 0) {
      alert("Tanggal check-out harus lebih besar dari tanggal check-in!");
      return;
    }

    if (!paymentProofFile) {
      alert("Anda wajib mengunggah bukti pembayaran!");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        user_id: user.id,
        room_id: room.id,
        check_in: checkIn,
        check_out: checkOut,
        total_price: totalPrice,
        status: "Pending Verification",
        payment_method: paymentMethod,
      };

      // 1. Create booking
      const bookingRes = await api.post("/bookings", payload);
      const bookingId = bookingRes.data.id;
      const bookingCode = bookingRes.data.booking_code;

      // 2. Upload proof
      const formData = new FormData();
      formData.append("payment_proof", paymentProofFile);
      await api.post(`/bookings/${bookingId}/upload-proof`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert(
        `Booking kamar berhasil dibuat!\nKode Booking Anda: ${bookingCode}\nStatus: Pending Verification (Menunggu verifikasi pembayaran oleh admin).`,
      );
      navigate("/history");
    } catch (err) {
      console.error("Booking kamar gagal:", err);
      alert(
        err.response?.data?.message ||
          "Terjadi kesalahan saat memproses booking.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatRupiah = (num) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);
  };

  if (isLoading) {
    return (
      <div
        style={{ textAlign: "center", padding: "80px 20px", color: "#78716c" }}
      >
        <h3>Memuat Detail Kamar...</h3>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div
        style={{
          padding: "40px 20px",
          maxWidth: "600px",
          margin: "auto",
          textAlign: "center",
        }}
      >
        <p style={{ color: "#ef4444" }}>{error || "Terjadi kesalahan."}</p>
        <Link
          to="/rooms-list"
          style={{
            color: "#b45309",
            fontWeight: "700",
            textDecoration: "none",
          }}
        >
          Kembali ke Daftar Kamar
        </Link>
      </div>
    );
  }

  const roomImage =
    activePhoto ||
    room.image_url ||
    room.image ||
    "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1200&auto=format&fit=crop";
  const capacity = room.capacity || 2;
  const description =
    room.description ||
    room.type_description ||
    "Kamar premium dengan tempat tidur mewah, AC, TV kabel, kamar mandi privat, amenities kelas atas, dan koneksi internet super cepat.";

  // Facilities lists
  const roomFacilities = [
    {
      name: "Room Photo",
      imageUrl: roomImage,
      desc: "Tampilan interior kamar elegan berdesain modern dengan kenyamanan premium."
    },
    { 
      name: "Smart TV", 
      imageUrl: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?q=80&w=400&auto=format&fit=crop", 
      desc: "Layar Ultra HD 4K dengan streaming Netflix & YouTube." 
    },
    { 
      name: "Air Conditioner", 
      imageUrl: "https://images.unsplash.com/photo-1621905252507-b354bc25edac?q=80&w=400&auto=format&fit=crop", 
      desc: "Kontrol suhu AC individual otomatis untuk kenyamanan optimal." 
    },
    { 
      name: room.bed_type || "Queen Bed", 
      imageUrl: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=400&auto=format&fit=crop", 
      desc: "Kasur premium ortopedi berlapis linen katun Mesir murni." 
    },
    { 
      name: "Private Bathroom", 
      imageUrl: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=400&auto=format&fit=crop", 
      desc: "Kamar mandi marmer dengan shower air hangat & bathtub mewah." 
    },
    { 
      name: "Free WiFi", 
      imageUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=400&auto=format&fit=crop", 
      desc: "Akses internet nirkabel berkecepatan tinggi gratis tanpa batas." 
    },
    { 
      name: "Breakfast Buffet", 
      imageUrl: "https://images.unsplash.com/photo-1495214783159-3503fd1b572d?q=80&w=400&auto=format&fit=crop", 
      desc: "Sarapan prasmanan lokal & kontinental segar disiapkan setiap hari." 
    }
  ];

  const hotelPremiumFacilities = [
    { name: "Kolam Renang", icon: Waves },
    { name: "Restoran", icon: Utensils },
    { name: "Gym Center", icon: Dumbbell },
    { name: "Spa & Wellness", icon: Sparkles },
    { name: "Free Parking", icon: Car },
    { name: "24 Hours Reception", icon: Clock }
  ];

  return (
    <div
      style={{
        backgroundColor: "#fafaf9",
        minHeight: "80vh",
        padding: "60px 0",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div className="room-detail-container">
        {/* Breadcrumb back link */}
        <Link to="/rooms-list" className="back-link">
          <ArrowLeft size={16} /> Kembali ke Daftar Kamar
        </Link>

        <div className="room-grid">
          {/* Left Column: Media & Specifications */}
          <div>
            <img
              src={roomImage}
              alt={`Kamar ${room.room_number}`}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1200&auto=format&fit=crop";
              }}
              className="room-hero-image"
            />

            <div className="room-title-section">
              <h1 className="room-title">
                Kamar {room.room_number}
              </h1>
              <span className={`room-tag ${room.price >= 1000000 ? "best-seller" : "promo"}`}>
                {room.price >= 1000000 ? "✨ Best Seller" : "🏷️ Promo Spesial"}
              </span>
            </div>

            {/* Rating hotel info widget */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "24px", fontSize: "14.5px" }}>
              <span style={{ display: "flex", color: "#f59e0b" }}>
                <Star size={16} fill="#f59e0b" />
                <Star size={16} fill="#f59e0b" />
                <Star size={16} fill="#f59e0b" />
                <Star size={16} fill="#f59e0b" />
                <Star size={16} fill="#f59e0b" />
              </span>
              <span style={{ fontWeight: "800", color: "#1c1917" }}>4.8 / 5</span>
              <span style={{ color: "#78716c" }}>(124 ulasan tamu terverifikasi)</span>
            </div>

            <div className="specs-row">
              <span className="spec-badge spec-badge-accent">
                {room.type_name || "Standard Room"}
              </span>
              <span className="spec-badge">
                👤 Maksimal {capacity} Tamu
              </span>
              <span className="spec-badge">
                🛏️ {room.bed_type || "Queen Bed"}
              </span>
              <span className="spec-badge">
                📐 {room.room_size || 30} m²
              </span>
            </div>

            <div className="detail-section">
              <h3 className="section-title">Deskripsi Kamar</h3>
              <p
                style={{
                  color: "#57534e",
                  fontSize: "15px",
                  lineHeight: "1.7",
                  margin: 0,
                }}
              >
                {description}
              </p>
            </div>

            {/* Room Amenities Section with facility cards */}
            <div className="detail-section">
              <h3 className="section-title">Fasilitas Kamar</h3>
              <div className="facility-grid">
                {roomFacilities.map((fac, idx) => (
                  <div key={idx} className="facility-card">
                    <div className="facility-card-img-wrapper">
                      <img 
                        src={fac.imageUrl} 
                        alt={fac.name} 
                        className="facility-card-img"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=400&auto=format&fit=crop";
                        }}
                      />
                    </div>
                    <div className="facility-card-content">
                      <h4 className="facility-name">{fac.name}</h4>
                      <p className="facility-desc">{fac.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Premium Hotel Facilities Section */}
            <div className="detail-section">
              <h3 className="section-title">Fasilitas Premium Grand Horizon</h3>
              <p style={{ color: "#78716c", fontSize: "14px", margin: "0 0 16px 0", lineHeight: "1.5" }}>
                Setiap tamu Grand Horizon memiliki akses penuh ke seluruh fasilitas eksklusif hotel demi kenyamanan menginap yang luar biasa.
              </p>
              <div className="premium-facilities-box">
                <div className="premium-grid">
                  {hotelPremiumFacilities.map((item, idx) => {
                    const IconComponent = item.icon;
                    return (
                      <div key={idx} className="premium-item">
                        <IconComponent size={18} className="premium-icon" />
                        <span className="premium-text">{item.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Booking Form */}
          <div>
            <div className="booking-card">
              <div style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span
                  style={{
                    fontSize: "12px",
                    color: "#78716c",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    fontWeight: "600"
                  }}
                >
                  Mulai Dari
                </span>
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: "700",
                    padding: "6px 14px",
                    borderRadius: "20px",
                    backgroundColor: room.stock_kamar === 0 ? "#fef2f2" : room.stock_kamar <= 2 ? "#fffbeb" : "#f0fdf4",
                    color: room.stock_kamar === 0 ? "#ef4444" : room.stock_kamar <= 2 ? "#d97706" : "#16a34a",
                    border: `1px solid ${room.stock_kamar === 0 ? "#fee2e2" : room.stock_kamar <= 2 ? "#fef3c7" : "#dcfce7"}`
                  }}
                >
                  {room.stock_kamar === 0 ? "Penuh" : room.stock_kamar <= 2 ? `Hampir Habis (Sisa ${room.stock_kamar})` : "Tersedia"}
                </span>
              </div>

              <div style={{ marginBottom: "28px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: "8px",
                    marginTop: "4px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "30px",
                      fontWeight: "800",
                      color: "#1c1917",
                    }}
                  >
                    {formatRupiah(room.price)}
                  </span>
                  <span style={{ color: "#78716c", fontSize: "14px", fontWeight: "500" }}>
                    / malam
                  </span>
                </div>
              </div>

              <form onSubmit={handleBookingSubmit}>
                <div className="form-group">
                  <label className="form-label">Tanggal Check-In</label>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Tanggal Check-Out</label>
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    min={checkIn || new Date().toISOString().split("T")[0]}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Metode Pembayaran</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="form-select"
                    required
                  >
                    <option value="BCA">BCA</option>
                    <option value="BRI">BRI</option>
                    <option value="Mandiri">Mandiri</option>
                    <option value="Dana">Dana</option>
                    <option value="OVO">OVO</option>
                    <option value="GoPay">GoPay</option>
                    <option value="QRIS">QRIS</option>
                  </select>
                </div>

                {paymentMethod && (
                  <div className="payment-info-box">
                    {["BCA", "BRI", "Mandiri"].includes(paymentMethod) && (
                      <>
                        <strong>Informasi Rekening Transfer Bank:</strong><br />
                        Bank: {paymentMethod}<br />
                        No. Rekening: 800-291-883921 a/n Grand Horizon<br />
                        <em style={{ fontSize: "11.5px", color: "#b45309", display: "block", marginTop: "4px" }}>
                          Lakukan transfer dan unggah bukti transaksi Anda di bawah ini.
                        </em>
                      </>
                    )}
                    {["Dana", "OVO", "GoPay"].includes(paymentMethod) && (
                      <>
                        <strong>E-Wallet Transfer:</strong><br />
                        Layanan: {paymentMethod}<br />
                        No. HP: 0812-3456-7890 a/n Grand Horizon Hotel<br />
                        <em style={{ fontSize: "11.5px", color: "#b45309", display: "block", marginTop: "4px" }}>
                          Lakukan transfer saldo dan unggah bukti screenshot Anda di bawah ini.
                        </em>
                      </>
                    )}
                    {paymentMethod === "QRIS" && (
                      <div style={{ textAlign: "center" }}>
                        <strong>QRIS Scan Code:</strong><br />
                        <div className="qris-mock-container">
                          <span style={{ fontSize: "24px", marginBottom: "4px" }}>📱</span>
                          <span style={{ fontSize: "12px", letterSpacing: "1px" }}>[QRIS CODE]</span>
                        </div>
                        <em style={{ fontSize: "11px", color: "#b45309", display: "block", marginTop: "4px" }}>
                          Scan kode QRIS di atas dan unggah bukti pembayaran Anda di bawah ini.
                        </em>
                      </div>
                    )}
                  </div>
                )}

                {/* Upload Proof of Payment (Enforced) */}
                <div className="form-group">
                  <label className="form-label">Upload Bukti Pembayaran (Wajib)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setPaymentProofFile(e.target.files[0])}
                    className="form-input"
                    required
                  />
                  <span style={{ fontSize: "11px", color: "#ef4444", marginTop: "6px", display: "block", lineHeight: "1.4" }}>
                    * Anda wajib melampirkan foto/screenshot bukti transaksi untuk menyelesaikan booking.
                  </span>
                </div>

                {/* Detailed Booking Summary */}
                {totalPrice > 0 && (
                  <div className="summary-box">
                    <h4 className="summary-title">Ringkasan Booking</h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <div className="summary-row">
                        <span>Nama Kamar:</span>
                        <span style={{ fontWeight: "700", color: "#1c1917" }}>
                          Kamar {room.room_number} ({room.type_name || "Standard Room"})
                        </span>
                      </div>
                      <div className="summary-row">
                        <span>Harga per Malam:</span>
                        <span>{formatRupiah(room.price)}</span>
                      </div>
                      <div className="summary-row">
                        <span>Check-in:</span>
                        <span>{checkIn}</span>
                      </div>
                      <div className="summary-row">
                        <span>Check-out:</span>
                        <span>{checkOut}</span>
                      </div>
                      <div className="summary-row">
                        <span>Jumlah Malam:</span>
                        <span>
                          {Math.ceil(
                            (new Date(checkOut) - new Date(checkIn)) /
                              (1000 * 3600 * 24),
                          )}{" "}
                          malam
                        </span>
                      </div>
                      <div className="summary-total">
                        <span>Total Biaya</span>
                        <span>{formatRupiah(totalPrice)}</span>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting || room.stock_kamar <= 0}
                  className="submit-btn"
                >
                  {isSubmitting ? "Memproses Pemesanan..." : room.stock_kamar <= 0 ? "Stok Kamar Habis" : "Pesan Sekarang"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RoomDetail;
