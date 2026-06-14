import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../../services/api";

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

  // Helper to generate 5 high-res photos for gallery based on room type
  const getRoomPhotos = (roomObj) => {
    if (!roomObj) return [];
    const mainImg = roomObj.image_url || roomObj.image || "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1200&auto=format&fit=crop";
    const typeName = (roomObj.type_name || "").toLowerCase();
    
    if (typeName.includes("suite")) {
      return [
        mainImg,
        "https://images.unsplash.com/photo-1592229505726-ca121723b8ea?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=600&auto=format&fit=crop"
      ];
    } else if (typeName.includes("deluxe")) {
      return [
        mainImg,
        "https://images.unsplash.com/photo-1591088398332-8a7791972843?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=600&auto=format&fit=crop"
      ];
    } else {
      return [
        mainImg,
        "https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=600&auto=format&fit=crop"
      ];
    }
  };

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
        {/* Breadcrumb back link */}
        <Link
          to="/rooms-list"
          style={{
            color: "#b45309",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            fontWeight: "700",
            marginBottom: "32px",
            fontSize: "14px",
          }}
        >
          <span>←</span> Kembali ke Daftar Kamar
        </Link>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.6fr 1fr",
            gap: "50px",
            alignItems: "start",
          }}
        >
          {/* Left Column: Media & Specifications */}
          <div>
            <img
              src={roomImage}
              alt={`Kamar ${room.room_number}`}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1200&auto=format&fit=crop";
              }}
              style={{
                width: "100%",
                height: "440px",
                objectFit: "cover",
                borderRadius: "24px",
                boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
                marginBottom: "16px",
              }}
            />

            {/* Room Photo Gallery Thumbnails */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "12px", marginBottom: "32px" }}>
              {getRoomPhotos(room).map((imgUrl, idx) => (
                <div
                  key={idx}
                  onClick={() => setActivePhoto(imgUrl)}
                  style={{
                    height: "75px",
                    borderRadius: "10px",
                    overflow: "hidden",
                    cursor: "pointer",
                    border: activePhoto === imgUrl ? "3px solid #b45309" : "1px solid #e7e5e4",
                    opacity: activePhoto === imgUrl ? 1 : 0.7,
                    transition: "all 0.2s ease",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
                  }}
                >
                  <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              ))}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap", marginBottom: "8px" }}>
              <h1
                style={{
                  fontSize: "32px",
                  fontWeight: "800",
                  color: "#1c1917",
                  margin: 0,
                }}
              >
                Kamar {room.room_number}
              </h1>
              <span style={{
                fontSize: "11px",
                fontWeight: "700",
                color: "#fff",
                backgroundColor: room.price >= 1000000 ? "#b45309" : "#0f766e",
                padding: "4px 12px",
                borderRadius: "20px",
                textTransform: "uppercase",
                letterSpacing: "0.5px"
              }}>
                {room.price >= 1000000 ? "✨ Best Seller" : "🏷️ Promo Spesial"}
              </span>
            </div>

            {/* Rating hotel info widget */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "24px", fontSize: "14.5px" }}>
              <span style={{ color: "#f59e0b" }}>⭐⭐⭐⭐⭐</span>
              <span style={{ fontWeight: "700", color: "#1c1917" }}>4.8 / 5</span>
              <span style={{ color: "#78716c" }}>(124 ulasan dari tamu terverifikasi)</span>
            </div>

            <div
              style={{
                display: "flex",
                gap: "12px",
                flexWrap: "wrap",
                marginBottom: "28px",
              }}
            >
              <span
                style={{
                  fontSize: "13px",
                  padding: "8px 16px",
                  backgroundColor: "#f5f5f4",
                  border: "1px solid #e7e5e4",
                  borderRadius: "20px",
                  fontWeight: "600",
                  color: "#b45309",
                  textTransform: "uppercase",
                }}
              >
                {room.type_name || "Standard Room"}
              </span>
              <span
                style={{
                  fontSize: "13px",
                  padding: "8px 16px",
                  backgroundColor: "#f5f5f4",
                  border: "1px solid #e7e5e4",
                  borderRadius: "20px",
                  fontWeight: "600",
                  color: "#57534e",
                }}
              >
                👤 Maksimal {capacity} Tamu
              </span>
              <span
                style={{
                  fontSize: "13px",
                  padding: "8px 16px",
                  backgroundColor: "#f5f5f4",
                  border: "1px solid #e7e5e4",
                  borderRadius: "20px",
                  fontWeight: "600",
                  color: "#57534e",
                }}
              >
                🛏️ {room.bed_type || "Queen Bed"}
              </span>
              <span
                style={{
                  fontSize: "13px",
                  padding: "8px 16px",
                  backgroundColor: "#f5f5f4",
                  border: "1px solid #e7e5e4",
                  borderRadius: "20px",
                  fontWeight: "600",
                  color: "#57534e",
                }}
              >
                📐 {room.room_size || 30} m²
              </span>
            </div>

            <div
              style={{
                borderBottom: "1px solid #e7e5e4",
                paddingBottom: "24px",
                marginBottom: "24px",
              }}
            >
              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: "700",
                  color: "#1c1917",
                  margin: "0 0 12px 0",
                }}
              >
                Deskripsi Kamar
              </h3>
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

            {/* Standard Amenities List with Icons */}
            <div
              style={{
                borderBottom: "1px solid #e7e5e4",
                paddingBottom: "32px",
                marginBottom: "32px"
              }}
            >
              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: "700",
                  color: "#1c1917",
                  margin: "0 0 16px 0",
                }}
              >
                Fasilitas Kamar
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                  gap: "12px",
                }}
              >
                {room.wifi ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", backgroundColor: "#fff", border: "1px solid #e7e5e4", padding: "12px", borderRadius: "12px", fontSize: "13.5px", fontWeight: "600", color: "#44403c" }}>
                    <span style={{ fontSize: "20px" }}>📶</span> Wi-Fi
                  </div>
                ) : null}
                {room.ac ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", backgroundColor: "#fff", border: "1px solid #e7e5e4", padding: "12px", borderRadius: "12px", fontSize: "13.5px", fontWeight: "600", color: "#44403c" }}>
                    <span style={{ fontSize: "20px" }}>❄️</span> AC
                  </div>
                ) : null}
                {room.tv ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", backgroundColor: "#fff", border: "1px solid #e7e5e4", padding: "12px", borderRadius: "12px", fontSize: "13.5px", fontWeight: "600", color: "#44403c" }}>
                    <span style={{ fontSize: "20px" }}>📺</span> Smart TV
                  </div>
                ) : null}
                {room.breakfast ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", backgroundColor: "#fff", border: "1px solid #e7e5e4", padding: "12px", borderRadius: "12px", fontSize: "13.5px", fontWeight: "600", color: "#44403c" }}>
                    <span style={{ fontSize: "20px" }}>🍳</span> Sarapan Gratis
                  </div>
                ) : null}
                {room.balcony ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", backgroundColor: "#fff", border: "1px solid #e7e5e4", padding: "12px", borderRadius: "12px", fontSize: "13.5px", fontWeight: "600", color: "#44403c" }}>
                    <span style={{ fontSize: "20px" }}>🚪</span> Balkon Pribadi
                  </div>
                ) : null}
                {room.minibar ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", backgroundColor: "#fff", border: "1px solid #e7e5e4", padding: "12px", borderRadius: "12px", fontSize: "13.5px", fontWeight: "600", color: "#44403c" }}>
                    <span style={{ fontSize: "20px" }}>🍷</span> Mini Bar
                  </div>
                ) : null}
                <div style={{ display: "flex", alignItems: "center", gap: "10px", backgroundColor: "#fff", border: "1px solid #e7e5e4", padding: "12px", borderRadius: "12px", fontSize: "13.5px", fontWeight: "600", color: "#44403c" }}>
                  <span style={{ fontSize: "20px" }}>🚿</span> Kamar Mandi
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", backgroundColor: "#fff", border: "1px solid #e7e5e4", padding: "12px", borderRadius: "12px", fontSize: "13.5px", fontWeight: "600", color: "#44403c" }}>
                  <span style={{ fontSize: "20px" }}>🏊‍♂️</span> Kolam Renang
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Booking Form */}
          <div
            style={{
              backgroundColor: "#fff",
              border: "1px solid #e7e5e4",
              borderRadius: "24px",
              padding: "40px",
              boxShadow: "0 10px 35px rgba(28, 25, 23, 0.03)",
              position: "sticky",
              top: "100px",
            }}
          >
            <div style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span
                style={{
                  fontSize: "12px",
                  color: "#78716c",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                Mulai Dari
              </span>
              <span
                style={{
                  fontSize: "13px",
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
                    fontSize: "28px",
                    fontWeight: "800",
                    color: "#1c1917",
                  }}
                >
                  {formatRupiah(room.price)}
                </span>
                <span style={{ color: "#78716c", fontSize: "14px" }}>
                  / malam
                </span>
              </div>
            </div>

            <form onSubmit={handleBookingSubmit}>
              <div style={{ marginBottom: "20px" }}>
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
                  Tanggal Check-In
                </label>
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: "10px",
                    border: "1px solid #d6d3d1",
                    fontSize: "14px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
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
                  Tanggal Check-Out
                </label>
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  min={checkIn || new Date().toISOString().split("T")[0]}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: "10px",
                    border: "1px solid #d6d3d1",
                    fontSize: "14px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: "24px" }}>
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
                  Metode Pembayaran
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: "10px",
                    border: "1px solid #d6d3d1",
                    fontSize: "14px",
                    outline: "none",
                    backgroundColor: "#fff",
                    boxSizing: "border-box",
                  }}
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
                <div style={{
                  backgroundColor: "#f5f5f4",
                  border: "1px dashed #d6d3d1",
                  borderRadius: "10px",
                  padding: "14px",
                  marginBottom: "24px",
                  fontSize: "13px",
                  color: "#57534e",
                  lineHeight: "1.5"
                }}>
                  {["BCA", "BRI", "Mandiri"].includes(paymentMethod) && (
                    <>
                      <strong>Informasi Rekening Transfer Bank:</strong><br />
                      Bank: {paymentMethod}<br />
                      No. Rekening: 800-291-883921 a/n Grand Horizon<br />
                      <em style={{ fontSize: "11px", color: "#b45309" }}>Lakukan transfer dan unggah bukti transaksi Anda di bawah ini.</em>
                    </>
                  )}
                  {["Dana", "OVO", "GoPay"].includes(paymentMethod) && (
                    <>
                      <strong>E-Wallet Transfer:</strong><br />
                      Layanan: {paymentMethod}<br />
                      No. HP: 0812-3456-7890 a/n Grand Horizon Hotel<br />
                      <em style={{ fontSize: "11px", color: "#b45309" }}>Lakukan transfer saldo dan unggah bukti screenshot Anda di bawah ini.</em>
                    </>
                  )}
                  {paymentMethod === "QRIS" && (
                    <div style={{ textAlign: "center" }}>
                      <strong>QRIS Scan Code:</strong><br />
                      <div style={{ margin: "10px auto", width: "120px", height: "120px", backgroundColor: "#e7e5e4", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "8px", fontWeight: "bold", color: "#78716c", border: "1px solid #d6d3d1" }}>
                        [MOCK QRIS]
                      </div>
                      <em style={{ fontSize: "11px", color: "#b45309" }}>Scan kode QRIS di atas dan unggah bukti pembayaran Anda di bawah ini.</em>
                    </div>
                  )}
                </div>
              )}

              {/* Upload Proof of Payment (Enforced) */}
              <div style={{ marginBottom: "24px" }}>
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
                  Upload Bukti Pembayaran (Wajib)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPaymentProofFile(e.target.files[0])}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: "10px",
                    border: "1px solid #d6d3d1",
                    fontSize: "14px",
                    outline: "none",
                    boxSizing: "border-box",
                    backgroundColor: "#fff",
                  }}
                  required
                />
                <span style={{ fontSize: "11px", color: "#ef4444", marginTop: "4px", display: "block" }}>
                  * Anda wajib melampirkan foto/screenshot bukti transaksi untuk menyelesaikan booking.
                </span>
              </div>

              {/* Detailed Booking Summary */}
              {totalPrice > 0 && (
                <div
                  style={{
                    backgroundColor: "#fdf8f6",
                    border: "1px solid #fbd5c0",
                    borderRadius: "12px",
                    padding: "20px",
                    marginBottom: "28px",
                  }}
                >
                  <h4 style={{ margin: "0 0 12px 0", fontSize: "14px", color: "#1c1917", fontWeight: "700" }}>Ringkasan Booking</h4>
                  <div style={{ fontSize: "13px", color: "#57534e", display: "flex", flexDirection: "column", gap: "6px" }}>
                    <div style={{ display: "flex", justifycontent: "space-between", justifyContent: "space-between" }}>
                      <span>Nama Kamar:</span>
                      <span style={{ fontWeight: "600" }}>Kamar {room.room_number} ({room.type_name || "Standard Room"})</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>Harga per Malam:</span>
                      <span>{formatRupiah(room.price)}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>Check-in:</span>
                      <span>{checkIn}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>Check-out:</span>
                      <span>{checkOut}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>Jumlah Malam:</span>
                      <span>
                        {Math.ceil(
                          (new Date(checkOut) - new Date(checkIn)) /
                            (1000 * 3600 * 24),
                        )}{" "}
                        malam
                      </span>
                    </div>
                    <div
                      style={{
                        borderTop: "1px solid #fbd5c0",
                        paddingTop: "12px",
                        marginTop: "6px",
                        display: "flex",
                        justifyContent: "space-between",
                        fontWeight: "700",
                        fontSize: "16px",
                        color: "#b45309",
                      }}
                    >
                      <span>Total Biaya</span>
                      <span>{formatRupiah(totalPrice)}</span>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || room.stock_kamar <= 0}
                style={{
                  width: "100%",
                  padding: "16px",
                  borderRadius: "12px",
                  border: "none",
                  backgroundColor: room.stock_kamar <= 0 ? "#78716c" : "#b45309",
                  color: "#fff",
                  fontSize: "15px",
                  fontWeight: "700",
                  cursor: isSubmitting || room.stock_kamar <= 0 ? "not-allowed" : "pointer",
                  boxShadow: room.stock_kamar <= 0 ? "none" : "0 10px 15px -3px rgba(180, 83, 9, 0.2)",
                  transition: "opacity 0.2s",
                }}
              >
                {isSubmitting ? "Memproses Pemesanan..." : room.stock_kamar <= 0 ? "Stok Kamar Habis" : "Pesan Sekarang"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RoomDetail;
