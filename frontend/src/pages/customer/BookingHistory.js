import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";

// Safe JWT Decoder helper
const getUserFromToken = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
};

function BookingHistory() {
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const user = useMemo(() => getUserFromToken(), []);

  const fetchData = useCallback(async () => {
    if (!user) {
      navigate("/customer-login");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const [bookingsRes, roomsRes] = await Promise.all([
        api.get(`/bookings?user_id=${user.id}`),
        api.get("/rooms")
      ]);

      const userBookings = bookingsRes.data;

      // Sort bookings by ID desc (newest first)
      userBookings.sort((a, b) => b.id - a.id);

      setBookings(userBookings);
      setRooms(roomsRes.data);
    } catch (err) {
      console.error("Gagal mengambil riwayat booking:", err);
      setError("Gagal memuat riwayat booking dari server.");
    } finally {
      setIsLoading(false);
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCancelBooking = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin membatalkan reservasi ini?")) {
      try {
        await api.put(`/bookings/${id}`, { status: "cancelled" });
        alert("Booking berhasil dibatalkan!");
        fetchData();
      } catch (err) {
        console.error("Gagal membatalkan booking:", err);
        alert(err.response?.data?.message || "Gagal membatalkan booking.");
      }
    }
  };

  const handleUploadProof = async (bookingId, file) => {
    if (!file) return;

    const formData = new FormData();
    formData.append("payment_proof", file);

    try {
      await api.post(`/bookings/${bookingId}/upload-proof`, formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      alert("Bukti pembayaran berhasil diunggah! Silakan tunggu verifikasi admin.");
      fetchData();
    } catch (err) {
      console.error("Gagal mengunggah bukti pembayaran:", err);
      alert(err.response?.data?.message || "Gagal mengunggah bukti pembayaran.");
    }
  };

  const formatRupiah = (num) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(num);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const getStatusBadgeStyle = (status) => {
    const baseStyle = {
      padding: "6px 14px",
      borderRadius: "20px",
      fontSize: "12px",
      fontWeight: "700",
      display: "inline-block",
      textTransform: "uppercase"
    };

    switch (status?.toLowerCase()) {
      case "pending":
      case "pending verification":
        return { ...baseStyle, backgroundColor: "rgba(245, 158, 11, 0.1)", color: "#b45309" };
      case "confirmed":
        return { ...baseStyle, backgroundColor: "rgba(16, 185, 129, 0.1)", color: "#065f46" };
      case "checked_in":
        return { ...baseStyle, backgroundColor: "rgba(99, 102, 241, 0.1)", color: "#4f46e5" };
      case "checked_out":
      case "completed":
        return { ...baseStyle, backgroundColor: "rgba(59, 130, 246, 0.1)", color: "#1d4ed8" };
      case "cancelled":
      case "rejected":
        return { ...baseStyle, backgroundColor: "rgba(244, 63, 94, 0.1)", color: "#991b1b" };
      default:
        return { ...baseStyle, backgroundColor: "rgba(100, 116, 139, 0.1)", color: "#475569" };
    }
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px", color: "#78716c" }}>
        <h3>Memuat Riwayat Reservasi...</h3>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "40px 20px", maxWidth: "600px", margin: "auto", textAlign: "center" }}>
        <p style={{ color: "#ef4444" }}>{error}</p>
        <button onClick={fetchData} style={{ padding: "10px 20px", backgroundColor: "#b45309", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "700", cursor: "pointer" }}>
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#fafaf9", minHeight: "80vh", padding: "60px 20px", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        
        {/* Header */}
        <div style={{ marginBottom: "40px" }}>
          <h2 style={{ fontSize: "28px", fontWeight: "800", color: "#1c1917", margin: "0 0 8px 0" }}>
            Riwayat Pemesanan Kamar
          </h2>
          <p style={{ color: "#78716c", margin: 0, fontSize: "14px" }}>
            Lihat daftar transaksi, status inap, dan kelola reservasi aktif Anda.
          </p>
        </div>

        {bookings.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", backgroundColor: "#fff", borderRadius: "20px", border: "1px solid #e7e5e4" }}>
            <span style={{ fontSize: "48px" }}>📅</span>
            <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#1c1917", margin: "16px 0 8px 0" }}>
              Belum Ada Reservasi
            </h3>
            <p style={{ color: "#78716c", fontSize: "14px", marginBottom: "24px" }}>
              Anda belum melakukan booking kamar hotel sama sekali.
            </p>
            <Link to="/rooms-list" style={{ padding: "12px 28px", backgroundColor: "#b45309", color: "#fff", textDecoration: "none", fontWeight: "700", borderRadius: "10px" }}>
              Pesan Kamar Sekarang
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {bookings.map((booking) => {
              const room = rooms.find((r) => r.id === booking.room_id);
              const roomNum = room ? room.room_number : `Room ID: ${booking.room_id}`;
              const roomType = room ? room.type_name : "Premium Room";

              const finalPrice = booking.total_price || (room ? parseFloat(room.price) : 0);

              return (
                <div
                  key={booking.id}
                  style={{
                    backgroundColor: "#fff",
                    border: "1px solid #e7e5e4",
                    borderRadius: "20px",
                    padding: "30px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "24px",
                    boxShadow: "0 4px 6px -1px rgba(28,25,23,0.01)"
                  }}
                >
                  <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "24px" }}>
                    <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
                      <div style={{ width: "64px", height: "64px", backgroundColor: "#fdf8f6", border: "1px solid #fbd5c0", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px" }}>
                        🏨
                      </div>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
                          <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#1c1917", margin: 0 }}>
                            Kamar {roomNum}
                          </h3>
                          <span style={{ fontSize: "12px", color: "#78716c", fontWeight: "600" }}>
                            ({booking.booking_code ? `Kode Booking: ${booking.booking_code}` : `Kode: #${booking.id}`})
                          </span>
                        </div>
                        <div style={{ fontSize: "13px", color: "#78716c", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "12px" }}>
                          Tipe: {roomType}
                        </div>
                        <div style={{ fontSize: "14px", color: "#57534e" }}>
                          📅 <strong>{formatDate(booking.check_in)}</strong> s/d <strong>{formatDate(booking.check_out)}</strong>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "24px" }}>
                      <div style={{ textAlign: "right" }}>
                        <span style={{ fontSize: "11px", color: "#78716c", textTransform: "uppercase", letterSpacing: "0.5px" }}>Total Bayar</span>
                        <div style={{ fontSize: "18px", fontWeight: "800", color: "#1c1917", marginTop: "2px" }}>
                          {formatRupiah(finalPrice)}
                        </div>
                      </div>

                      <div style={{ textAlign: "center", minWidth: "120px" }}>
                        <span style={getStatusBadgeStyle(booking.status)}>{booking.status}</span>
                      </div>

                      <div>
                        {booking.status?.toLowerCase() === "pending" || booking.status?.toLowerCase() === "pending verification" ? (
                          <button
                            onClick={() => handleCancelBooking(booking.id)}
                            style={{
                              padding: "10px 18px",
                              backgroundColor: "rgba(244, 63, 94, 0.08)",
                              color: "#f43f5e",
                              border: "none",
                              borderRadius: "8px",
                              fontSize: "13px",
                              fontWeight: "700",
                              cursor: "pointer",
                              transition: "all 0.2s"
                            }}
                          >
                            Batalkan
                          </button>
                        ) : booking.status?.toLowerCase() === "cancelled" ? (
                          <span style={{ fontSize: "13px", color: "#ef4444", fontWeight: "700" }}>Dibatalkan</span>
                        ) : booking.status?.toLowerCase() === "confirmed" ? (
                          <span style={{ fontSize: "13px", color: "#10b981", fontWeight: "700" }}>Terkonfirmasi</span>
                        ) : booking.status?.toLowerCase() === "checked_in" ? (
                          <span style={{ fontSize: "13px", color: "#6366f1", fontWeight: "700" }}>Sedang Menginap</span>
                        ) : booking.status?.toLowerCase() === "checked_out" || booking.status?.toLowerCase() === "completed" ? (
                          <span style={{ fontSize: "13px", color: "#3b82f6", fontWeight: "700" }}>Selesai</span>
                        ) : (
                          <span style={{ fontSize: "13px", color: "#ef4444", fontWeight: "700" }}>Ditolak</span>
                        )}
                      </div>
                  </div>
                </div>

                  {/* QR Code Booking Ticket */}
                  <div style={{
                    paddingTop: "20px",
                    borderTop: "1px solid #f5f5f4"
                  }}>
                    <div style={{
                      padding: "20px",
                      border: "2px dashed #d97706",
                      borderRadius: "16px",
                      backgroundColor: "#fffbeb",
                      display: "flex",
                      flexWrap: "wrap",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "20px"
                    }}>
                      <div style={{ flex: 1, minWidth: "250px" }}>
                        <span style={{ fontSize: "11px", fontWeight: "700", color: "#b45309", textTransform: "uppercase", letterSpacing: "1.5px" }}>E-Voucher Grand Horizon</span>
                        <h4 style={{ fontSize: "18px", fontWeight: "800", color: "#1c1917", margin: "6px 0" }}>
                          KODE BOOKING: {booking.booking_code || `GH-${new Date().getFullYear()}-${String(booking.id).padStart(4, "0")}`}
                        </h4>
                        <p style={{ margin: 0, fontSize: "12.5px", color: "#78716c", lineHeight: "1.5" }}>
                          Simpan e-voucher ini. Tunjukkan Kode Booking atau QR Code di samping ke resepsionis saat melakukan Check-In untuk proses cepat.
                        </p>
                      </div>
                      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "8px", backgroundColor: "#fff", border: "1px solid #fef3c7", borderRadius: "12px", boxShadow: "0 4px 10px rgba(180, 83, 9, 0.05)" }}>
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${booking.booking_code || booking.id}`}
                          alt="QR Code Booking"
                          style={{ width: "100px", height: "100px" }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Payment Info Section */}
                  <div style={{
                    paddingTop: "20px",
                    borderTop: "1px solid #f5f5f4",
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "16px"
                  }}>
                    <div style={{ fontSize: "13.5px", color: "#57534e" }}>
                      <div>
                        💳 <strong>Metode Pembayaran:</strong> {booking.payment_method || "Transfer BCA"}
                      </div>
                      <div style={{ marginTop: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
                        💵 <strong>Status Pembayaran:</strong>{" "}
                        <span style={{
                          fontWeight: "700",
                          fontSize: "12px",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          backgroundColor: booking.payment_status === "paid" ? "rgba(16, 185, 129, 0.1)" : (booking.payment_status === "cancelled" || booking.payment_status === "rejected") ? "rgba(244, 63, 94, 0.1)" : "rgba(245, 158, 11, 0.1)",
                          color: booking.payment_status === "paid" ? "#065f46" : (booking.payment_status === "cancelled" || booking.payment_status === "rejected") ? "#991b1b" : "#b45309",
                          textTransform: "uppercase"
                        }}>
                          {booking.payment_status || "pending"}
                        </span>
                      </div>
                    </div>

                    <div>
                      {booking.payment_method !== "Bayar di Hotel" ? (
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          {booking.payment_proof ? (
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              <img
                                src={`http://localhost:5000${booking.payment_proof}`}
                                alt="Bukti Pembayaran"
                                style={{ width: "40px", height: "40px", objectFit: "cover", borderRadius: "6px", border: "1px solid #d6d3d1", cursor: "pointer" }}
                                onClick={() => window.open(`http://localhost:5000${booking.payment_proof}`, "_blank")}
                              />
                              <span style={{ fontSize: "12px", color: "#16a34a", fontWeight: "600" }}>✓ Bukti Terunggah (Menunggu Verifikasi)</span>
                            </div>
                          ) : (booking.status?.toLowerCase() === "pending" || booking.status?.toLowerCase() === "pending verification") ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                              <label style={{
                                fontSize: "12px",
                                fontWeight: "700",
                                color: "#b45309",
                                backgroundColor: "#fff",
                                border: "1px solid #b45309",
                                padding: "8px 14px",
                                borderRadius: "6px",
                                cursor: "pointer",
                                textAlign: "center"
                              }}>
                                📁 Unggah Bukti Pembayaran
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleUploadProof(booking.id, e.target.files[0])}
                                  style={{ display: "none" }}
                                />
                              </label>
                            </div>
                          ) : (
                            <span style={{ fontSize: "12px", color: "#78716c" }}>Tidak ada bukti pembayaran</span>
                          )}
                        </div>
                      ) : (
                        <span style={{ fontSize: "13px", color: "#16a34a", fontWeight: "600" }}>✓ Silakan bayar langsung saat check-in</span>
                      )}
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

export default BookingHistory;
