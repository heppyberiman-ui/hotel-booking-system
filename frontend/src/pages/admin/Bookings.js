import { useState, useEffect } from "react";
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

function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form states for adding booking
  const [userId, setUserId] = useState("");
  const [roomId, setRoomId] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [totalPrice, setTotalPrice] = useState("");
  const [status, setStatus] = useState("pending");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Quick Check-in search states
  const [searchCode, setSearchCode] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [searchMessage, setSearchMessage] = useState("");

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.get("/bookings");
      setBookings(res.data);
    } catch (err) {
      console.error("Gagal mengambil data reservasi:", err);
      setError("Gagal memuat data reservasi dari server.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRoomsAndUsers = async () => {
    try {
      const [roomsRes, usersRes] = await Promise.all([
        api.get("/rooms"),
        api.get("/users")
      ]);
      setRooms(roomsRes.data);
      // Keep only customer role users for selection
      setUsers(usersRes.data.filter((u) => u.role === "customer" || u.role === "guest"));
    } catch (err) {
      console.error("Gagal mengambil data pendukung:", err);
    }
  };

  useEffect(() => {
    fetchBookings();
    fetchRoomsAndUsers();
  }, []);

  // Auto calculate total price based on dates and selected room price
  useEffect(() => {
    if (checkIn && checkOut && roomId && rooms.length > 0) {
      const room = rooms.find((r) => String(r.id) === String(roomId));
      if (room) {
        const start = new Date(checkIn);
        const end = new Date(checkOut);
        const timeDiff = end.getTime() - start.getTime();
        const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));
        if (nights > 0) {
          setTotalPrice(room.price * nights);
        } else {
          setTotalPrice(0);
        }
      }
    } else {
      setTotalPrice(0);
    }
  }, [checkIn, checkOut, roomId, rooms]);

  const openAddModal = () => {
    setUserId(users[0]?.id || "");
    setRoomId(rooms[0]?.id || "");
    setCheckIn("");
    setCheckOut("");
    setTotalPrice("");
    setStatus("pending");
    setIsModalOpen(true);
  };

  const openDetailModal = (booking) => {
    setSelectedBooking(booking);
    setIsDetailModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId || !roomId || !checkIn || !checkOut) {
      alert("Semua field wajib diisi!");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        user_id: parseInt(userId),
        room_id: parseInt(roomId),
        check_in: checkIn,
        check_out: checkOut,
        total_price: parseFloat(totalPrice),
        status: status
      };

      await api.post("/bookings", payload);
      alert("Reservasi berhasil ditambahkan!");
      setIsModalOpen(false);
      fetchBookings();
    } catch (err) {
      console.error("Gagal menambahkan reservasi:", err);
      alert(err.response?.data?.message || "Terjadi kesalahan saat menambahkan reservasi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus, paymentStatus) => {
    const confirmationMessages = {
      confirmed: "Apakah Anda yakin ingin menyetujui pembayaran dan mengonfirmasi booking ini?",
      cancelled: "Apakah Anda yakin ingin menolak pembayaran dan membatalkan booking ini?",
      checked_in: "Apakah tamu sudah datang dan siap Check-In?",
      checked_out: "Apakah tamu sudah menyelesaikan pembayaran dan siap Check-Out?"
    };

    if (window.confirm(confirmationMessages[newStatus] || "Apakah Anda yakin ingin memperbarui status booking ini?")) {
      try {
        const payload = { status: newStatus };
        if (paymentStatus) {
          payload.payment_status = paymentStatus;
        }
        if (newStatus === "confirmed" || newStatus === "cancelled" || newStatus === "rejected") {
          const userObj = getUserFromToken();
          payload.verified_by = userObj?.name || "Admin";
        }
        await api.put(`/bookings/${id}`, payload);
        alert("Status booking berhasil diperbarui!");
        fetchBookings();
        // If the detail modal is open for this booking, close it to sync state
        setIsDetailModalOpen(false);
        // Sync search result status if currently searched
        if (searchResult && String(searchResult.id) === String(id)) {
          setSearchResult(prev => prev ? { ...prev, status: newStatus, payment_status: paymentStatus || prev.payment_status } : null);
        }
      } catch (err) {
        console.error("Gagal memperbarui status booking:", err);
        alert(err.response?.data?.message || "Gagal memperbarui status booking.");
      }
    }
  };

  const handleSearchCheckIn = (e) => {
    e.preventDefault();
    if (!searchCode.trim()) {
      setSearchResult(null);
      setSearchMessage("");
      return;
    }

    const found = bookings.find(
      (b) => b.booking_code && b.booking_code.toLowerCase() === searchCode.trim().toLowerCase()
    );

    if (!found) {
      setSearchResult(null);
      setSearchMessage("Kode booking tidak ditemukan!");
      return;
    }

    setSearchResult(found);
    setSearchMessage("");
  };

  const handleQuickCheckIn = async (booking) => {
    if (booking.status?.toLowerCase() !== "confirmed") {
      let alertMsg = "";
      if (booking.status?.toLowerCase() === "pending" || booking.status?.toLowerCase() === "pending verification") {
        alertMsg = "Check-in ditolak! Status booking masih Pending Verification.";
      } else if (booking.status?.toLowerCase() === "cancelled" || booking.status?.toLowerCase() === "rejected" || booking.payment_status === "rejected") {
        alertMsg = "Check-in ditolak! Booking dibatalkan atau pembayaran ditolak.";
      } else {
        alertMsg = `Check-in ditolak! Status booking: ${booking.status}`;
      }
      alert(alertMsg);
      return;
    }

    try {
      await api.put(`/bookings/${booking.id}`, { status: "checked_in" });
      alert(`Check-in berhasil untuk kode booking ${booking.booking_code}!`);
      setSearchCode("");
      setSearchResult(null);
      setSearchMessage("");
      fetchBookings();
    } catch (err) {
      console.error("Gagal melakukan check-in:", err);
      alert(err.response?.data?.message || "Gagal melakukan check-in.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus reservasi ini secara permanen?")) {
      try {
        await api.delete(`/bookings/${id}`);
        alert("Reservasi berhasil dihapus!");
        fetchBookings();
      } catch (err) {
        console.error("Gagal menghapus reservasi:", err);
        alert(err.response?.data?.message || "Gagal menghapus reservasi.");
      }
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
      padding: "6px 12px",
      borderRadius: "20px",
      fontSize: "12px",
      fontWeight: "600",
      display: "inline-block"
    };

    switch (status?.toLowerCase()) {
      case "pending":
      case "pending verification":
        return { ...baseStyle, backgroundColor: "rgba(245, 158, 11, 0.1)", color: "#f59e0b" };
      case "confirmed":
        return { ...baseStyle, backgroundColor: "rgba(16, 185, 129, 0.1)", color: "#10b981" };
      case "checked_in":
        return { ...baseStyle, backgroundColor: "rgba(99, 102, 241, 0.1)", color: "#6366f1" };
      case "checked_out":
      case "completed":
        return { ...baseStyle, backgroundColor: "rgba(59, 130, 246, 0.1)", color: "#3b82f6" };
      case "cancelled":
      case "rejected":
        return { ...baseStyle, backgroundColor: "rgba(244, 63, 94, 0.1)", color: "#f43f5e" };
      default:
        return { ...baseStyle, backgroundColor: "rgba(100, 116, 139, 0.1)", color: "#64748b" };
    }
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "80px 0" }}>
        <div style={{ fontSize: "16px", color: "#64748b", fontWeight: "500" }}>Memuat Reservasi...</div>
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
    <div>
      {/* Header and Add Button */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <div>
          <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: "14px" }}>
            Kelola alur konfirmasi, pembatalan, check-in, dan check-out tamu hotel secara real-time.
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
            gap: "8px"
          }}
        >
          <span>+</span> Tambah Reservasi Manual
        </button>
      </div>

      {/* Pencarian Kode Booking (Check-in Cepat) Widget */}
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "20px",
          border: "1px solid #e2e8f0",
          padding: "24px",
          marginBottom: "32px",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.02)"
        }}
      >
        <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", margin: "0 0 8px 0" }}>
          Pencarian Kode Booking (Check-in Cepat)
        </h3>
        <p style={{ margin: "0 0 16px 0", color: "#64748b", fontSize: "13px" }}>
          Cari berdasarkan Kode Booking (contoh: GH-2026-0001) untuk melakukan verifikasi check-in tamu.
        </p>

        <form onSubmit={handleSearchCheckIn} style={{ display: "flex", gap: "12px", maxWidth: "500px" }}>
          <input
            type="text"
            placeholder="Masukkan Kode Booking (e.g. GH-2026-0001)"
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
            style={{
              flex: 1,
              padding: "10px 16px",
              borderRadius: "10px",
              border: "1px solid #cbd5e1",
              fontSize: "14px",
              outline: "none"
            }}
          />
          <button
            type="submit"
            style={{
              padding: "10px 20px",
              borderRadius: "10px",
              border: "none",
              backgroundColor: "#6366f1",
              color: "#fff",
              fontWeight: "600",
              fontSize: "14px",
              cursor: "pointer"
            }}
          >
            Cari
          </button>
        </form>

        {searchMessage && (
          <div style={{ marginTop: "16px", padding: "12px", borderRadius: "8px", backgroundColor: "#fef2f2", color: "#ef4444", fontSize: "14px", fontWeight: "500" }}>
            {searchMessage}
          </div>
        )}

        {searchResult && (
          <div
            style={{
              marginTop: "20px",
              padding: "20px",
              borderRadius: "12px",
              backgroundColor: "#f8fafc",
              border: "1px solid #e2e8f0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "16px"
            }}
          >
            <div>
              <div style={{ fontSize: "15px", fontWeight: "700", color: "#0f172a" }}>
                {searchResult.booking_code || `Booking #${searchResult.id}`} - Kamar {searchResult.room_number || searchResult.room_id}
              </div>
              <div style={{ fontSize: "13px", color: "#475569", marginTop: "4px" }}>
                Tamu: <strong>{searchResult.guest_name}</strong> ({searchResult.guest_email || "-"})
              </div>
              <div style={{ fontSize: "13px", color: "#475569", marginTop: "2px" }}>
                Check-In: <strong>{formatDate(searchResult.check_in)}</strong> | Check-Out: <strong>{formatDate(searchResult.check_out)}</strong>
              </div>
              <div style={{ marginTop: "8px", display: "flex", gap: "8px", alignItems: "center" }}>
                <span style={getStatusBadgeStyle(searchResult.status)}>
                  Status: {searchResult.status}
                </span>
                <span style={{
                  fontSize: "12px",
                  fontWeight: "600",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  backgroundColor: searchResult.payment_status === "paid" ? "rgba(16, 185, 129, 0.1)" : (searchResult.payment_status === "cancelled" || searchResult.payment_status === "rejected") ? "rgba(244, 63, 94, 0.1)" : "rgba(245, 158, 11, 0.1)",
                  color: searchResult.payment_status === "paid" ? "#10b981" : (searchResult.payment_status === "cancelled" || searchResult.payment_status === "rejected") ? "#f43f5e" : "#f59e0b"
                }}>
                  Pembayaran: {searchResult.payment_status || "Pending"}
                </span>
              </div>
            </div>

            <div>
              {searchResult.status?.toLowerCase() === "confirmed" ? (
                <button
                  onClick={() => handleQuickCheckIn(searchResult)}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "10px",
                    border: "none",
                    backgroundColor: "#10b981",
                    color: "#fff",
                    fontWeight: "700",
                    fontSize: "14px",
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(16, 185, 129, 0.2)"
                  }}
                >
                  Proses Check-In
                </button>
              ) : (
                <button
                  onClick={() => handleQuickCheckIn(searchResult)}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "10px",
                    border: "none",
                    backgroundColor: "#ef4444",
                    color: "#fff",
                    fontWeight: "700",
                    fontSize: "14px",
                    cursor: "pointer"
                  }}
                >
                  Check-In Ditolak (Info)
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bookings Table */}
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
              <th style={{ padding: "18px 24px", fontSize: "12px", fontWeight: "600", color: "#475569", textTransform: "uppercase" }}>Booking / Tamu</th>
              <th style={{ padding: "18px 24px", fontSize: "12px", fontWeight: "600", color: "#475569", textTransform: "uppercase" }}>No Kamar</th>
              <th style={{ padding: "18px 24px", fontSize: "12px", fontWeight: "600", color: "#475569", textTransform: "uppercase" }}>Check In</th>
              <th style={{ padding: "18px 24px", fontSize: "12px", fontWeight: "600", color: "#475569", textTransform: "uppercase" }}>Check Out</th>
              <th style={{ padding: "18px 24px", fontSize: "12px", fontWeight: "600", color: "#475569", textTransform: "uppercase" }}>Total Harga</th>
              <th style={{ padding: "18px 24px", fontSize: "12px", fontWeight: "600", color: "#475569", textTransform: "uppercase" }}>Status</th>
              <th style={{ padding: "18px 24px", fontSize: "12px", fontWeight: "600", color: "#475569", textAlign: "right" }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
                  Belum ada data reservasi tamu terdaftar.
                </td>
              </tr>
            ) : (
              bookings.map((booking) => (
                <tr key={booking.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "18px 24px", fontSize: "14px", fontWeight: "600", color: "#0f172a" }}>
                    <div style={{ fontWeight: "700" }}>{booking.booking_code || `ID: #${booking.id}`}</div>
                    <div style={{ fontSize: "12px", color: "#64748b", fontWeight: "normal", marginTop: "2px" }}>
                      {booking.guest_name || `User ID: ${booking.user_id}`}
                    </div>
                    {booking.guest_email && (
                      <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "normal" }}>
                        {booking.guest_email}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: "18px 24px", fontSize: "14px", color: "#334155" }}>
                    {booking.room_number ? `Kamar ${booking.room_number}` : `Room ID: ${booking.room_id}`}
                  </td>
                  <td style={{ padding: "18px 24px", fontSize: "14px", color: "#475569" }}>
                    {formatDate(booking.check_in)}
                  </td>
                  <td style={{ padding: "18px 24px", fontSize: "14px", color: "#475569" }}>
                    {formatDate(booking.check_out)}
                  </td>
                  <td style={{ padding: "18px 24px", fontSize: "14px", fontWeight: "600", color: "#0f172a" }}>
                    {formatRupiah(booking.total_price)}
                  </td>
                  <td style={{ padding: "18px 24px" }}>
                    <span style={getStatusBadgeStyle(booking.status)}>{booking.status}</span>
                  </td>
                  <td style={{ padding: "18px 24px", textAlign: "right" }}>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", alignItems: "center" }}>
                      {/* Detail Button */}
                      <button
                        onClick={() => openDetailModal(booking)}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "6px",
                          border: "1px solid #cbd5e1",
                          backgroundColor: "#fff",
                          color: "#334155",
                          fontSize: "12px",
                          fontWeight: "600",
                          cursor: "pointer"
                        }}
                      >
                        Detail
                      </button>

                      {/* Alur Booking States */}
                      {(booking.status?.toLowerCase() === "pending" || booking.status?.toLowerCase() === "pending verification") && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(booking.id, "confirmed", "paid")}
                            style={{
                              padding: "6px 12px",
                              borderRadius: "6px",
                              border: "none",
                              backgroundColor: "#10b981",
                              color: "#fff",
                              fontSize: "12px",
                              fontWeight: "600",
                              cursor: "pointer"
                            }}
                          >
                            Setujui
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(booking.id, "cancelled", "rejected")}
                            style={{
                              padding: "6px 12px",
                              borderRadius: "6px",
                              border: "none",
                              backgroundColor: "#f43f5e",
                              color: "#fff",
                              fontSize: "12px",
                              fontWeight: "600",
                              cursor: "pointer"
                            }}
                          >
                            Tolak
                          </button>
                        </>
                      )}

                      {booking.status?.toLowerCase() === "confirmed" && (
                        <button
                          onClick={() => handleUpdateStatus(booking.id, "checked_in")}
                          style={{
                            padding: "6px 12px",
                            borderRadius: "6px",
                            border: "none",
                            backgroundColor: "#6366f1",
                            color: "#fff",
                            fontSize: "12px",
                            fontWeight: "600",
                            cursor: "pointer"
                          }}
                        >
                          Check In
                        </button>
                      )}

                      {booking.status?.toLowerCase() === "checked_in" && (
                        <button
                          onClick={() => handleUpdateStatus(booking.id, "checked_out")}
                          style={{
                            padding: "6px 12px",
                            borderRadius: "6px",
                            border: "none",
                            backgroundColor: "#3b82f6",
                            color: "#fff",
                            fontSize: "12px",
                            fontWeight: "600",
                            cursor: "pointer"
                          }}
                        >
                          Check Out
                        </button>
                      )}

                      {["checked_out", "completed", "cancelled"].includes(booking.status?.toLowerCase()) && (
                        <span style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "500" }}>Selesai</span>
                      )}

                      {/* Hard Delete Booking */}
                      <button
                        onClick={() => handleDelete(booking.id)}
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
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Manual Booking Modal */}
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
              width: "480px",
              backgroundColor: "#fff",
              borderRadius: "24px",
              padding: "24px 30px",
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
              border: "1px solid #e2e8f0",
              maxHeight: "85vh",
              overflowY: "auto"
            }}
          >
            <h3 style={{ fontSize: "20px", fontWeight: "700", color: "#0f172a", margin: "0 0 8px 0" }}>
              Tambah Reservasi Manual
            </h3>
            <p style={{ fontSize: "14px", color: "#64748b", margin: "0 0 28px 0" }}>
              Lengkapi detail pemesanan kamar walk-in di bawah ini.
            </p>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#64748b", marginBottom: "8px", textTransform: "uppercase" }}>
                  Pilih Tamu (Customer)
                </label>
                <select
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
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
                  <option value="" disabled>-- Pilih Tamu --</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#64748b", marginBottom: "8px", textTransform: "uppercase" }}>
                  Pilih Kamar
                </label>
                <select
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
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
                  <option value="" disabled>-- Pilih Kamar --</option>
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      Kamar {r.room_number} - {r.type_name || `Type ID: ${r.room_type_id}`} ({formatRupiah(r.price)}/malam) - Stok: {r.stock_kamar !== undefined ? r.stock_kamar : 5}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#64748b", marginBottom: "8px", textTransform: "uppercase" }}>
                    Check In
                  </label>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
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
                    Check Out
                  </label>
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
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

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "32px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#64748b", marginBottom: "8px", textTransform: "uppercase" }}>
                    Total Harga
                  </label>
                  <input
                    type="number"
                    value={totalPrice}
                    onChange={(e) => setTotalPrice(e.target.value)}
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
                    Status
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
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="checked_in">Checked In</option>
                    <option value="checked_out">Checked Out</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

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

      {/* Detail Booking Modal */}
      {isDetailModalOpen && selectedBooking && (
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
              width: "480px",
              backgroundColor: "#fff",
              borderRadius: "24px",
              padding: "24px 30px",
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
              border: "1px solid #e2e8f0",
              maxHeight: "85vh",
              overflowY: "auto"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#0f172a", margin: 0 }}>
                Detail Reservasi #{selectedBooking.id}
              </h3>
              <span style={getStatusBadgeStyle(selectedBooking.status)}>
                {selectedBooking.status}
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "24px" }}>
              {/* Guest Details */}
              <div style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: "12px" }}>
                <h4 style={{ fontSize: "11px", fontWeight: "600", color: "#64748b", margin: "0 0 6px 0", textTransform: "uppercase", letterSpacing: "0.5px" }}>Informasi Tamu</h4>
                <div style={{ fontSize: "14px", color: "#0f172a", fontWeight: "700" }}>{selectedBooking.guest_name || `User ID: ${selectedBooking.user_id}`}</div>
                <div style={{ fontSize: "12.5px", color: "#64748b", marginTop: "2px" }}>
                  Email: {selectedBooking.guest_email || "-"}
                </div>
                <div style={{ fontSize: "12.5px", color: "#64748b", marginTop: "2px" }}>
                  User ID: {selectedBooking.user_id} | Kode: <strong>{selectedBooking.booking_code || `ID: #${selectedBooking.id}`}</strong>
                </div>
              </div>

              {/* Room & Stay Details (2 columns) */}
              <div style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: "12px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <h4 style={{ fontSize: "11px", fontWeight: "600", color: "#64748b", margin: "0 0 6px 0", textTransform: "uppercase", letterSpacing: "0.5px" }}>Kamar</h4>
                  <div style={{ fontSize: "13.5px", color: "#0f172a", fontWeight: "700" }}>
                    {selectedBooking.room_number ? `Kamar ${selectedBooking.room_number}` : `Room ID: ${selectedBooking.room_id}`}
                  </div>
                  <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
                    ID: {selectedBooking.room_id}
                  </div>
                </div>
                <div>
                  <h4 style={{ fontSize: "11px", fontWeight: "600", color: "#64748b", margin: "0 0 6px 0", textTransform: "uppercase", letterSpacing: "0.5px" }}>Jadwal Menginap</h4>
                  <div style={{ fontSize: "13px", color: "#0f172a", fontWeight: "700" }}>
                    {formatDate(selectedBooking.check_in)}
                  </div>
                  <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
                    s/d {formatDate(selectedBooking.check_out)}
                  </div>
                </div>
              </div>

              {/* Price & Payment Details (2 columns) */}
              <div style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: "12px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <h4 style={{ fontSize: "11px", fontWeight: "600", color: "#64748b", margin: "0 0 6px 0", textTransform: "uppercase", letterSpacing: "0.5px" }}>Ringkasan Biaya</h4>
                  <div style={{ fontSize: "16px", color: "#0f172a", fontWeight: "800" }}>{formatRupiah(selectedBooking.total_price)}</div>
                  {selectedBooking.created_at && (
                    <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>
                      Dipesan: {formatDate(selectedBooking.created_at)}
                    </div>
                  )}
                </div>
                <div>
                  <h4 style={{ fontSize: "11px", fontWeight: "600", color: "#64748b", margin: "0 0 6px 0", textTransform: "uppercase", letterSpacing: "0.5px" }}>Pembayaran</h4>
                  <div style={{ fontSize: "13.5px", color: "#0f172a", fontWeight: "700" }}>
                    {selectedBooking.payment_method || "Transfer BCA"}
                  </div>
                  <div style={{ fontSize: "12px", color: selectedBooking.payment_status === "paid" ? "#16a34a" : selectedBooking.payment_status === "cancelled" ? "#ef4444" : "#f59e0b", fontWeight: "700", marginTop: "2px", textTransform: "uppercase" }}>
                    {selectedBooking.payment_status || "PENDING"}
                  </div>
                </div>
              </div>

              {/* Verification & Proof */}
              <div>
                {selectedBooking.verified_at && (
                  <div style={{
                    padding: "10px 12px",
                    borderRadius: "8px",
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    fontSize: "12px",
                    color: "#475569",
                    marginBottom: "12px",
                    lineHeight: "1.4"
                  }}>
                    ℹ️ <strong>Diverifikasi oleh:</strong> {selectedBooking.verified_by || "Admin"} pada {formatDate(selectedBooking.verified_at)}
                  </div>
                )}

                {selectedBooking.payment_proof ? (
                  <div style={{ marginTop: "12px" }}>
                    <span style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#64748b", marginBottom: "6px", textTransform: "uppercase" }}>Bukti Pembayaran:</span>
                    <a href={`http://localhost:5000${selectedBooking.payment_proof}`} target="_blank" rel="noreferrer">
                      <img
                        src={`http://localhost:5000${selectedBooking.payment_proof}`}
                        alt="Bukti Pembayaran"
                        style={{ maxWidth: "100%", maxHeight: "140px", objectFit: "contain", borderRadius: "8px", border: "1px solid #cbd5e1", cursor: "zoom-in" }}
                      />
                    </a>
                    {(selectedBooking.status?.toLowerCase() === "pending" || selectedBooking.status?.toLowerCase() === "pending verification") && (
                      <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                        <button
                          onClick={() => handleUpdateStatus(selectedBooking.id, "confirmed", "paid")}
                          style={{
                            flex: 1,
                            padding: "10px",
                            borderRadius: "8px",
                            border: "none",
                            backgroundColor: "#10b981",
                            color: "#fff",
                            fontWeight: "600",
                            fontSize: "12.5px",
                            cursor: "pointer",
                            textAlign: "center"
                          }}
                        >
                          Setujui Pembayaran
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(selectedBooking.id, "cancelled", "rejected")}
                          style={{
                            flex: 1,
                            padding: "10px",
                            borderRadius: "8px",
                            border: "none",
                            backgroundColor: "#f43f5e",
                            color: "#fff",
                            fontWeight: "600",
                            fontSize: "12.5px",
                            cursor: "pointer",
                            textAlign: "center"
                          }}
                        >
                          Tolak Pembayaran
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  selectedBooking.payment_method !== "Bayar di Hotel" ? (
                    <div style={{ fontSize: "12px", color: "#ef4444", fontWeight: "600", marginTop: "8px" }}>
                      ⚠️ Belum mengunggah bukti pembayaran.
                    </div>
                  ) : (
                    <div style={{ fontSize: "12px", color: "#16a34a", fontWeight: "600", marginTop: "8px" }}>
                      ✓ Pembayaran langsung saat check-in di hotel.
                    </div>
                  )
                )}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                style={{
                  padding: "10px 24px",
                  borderRadius: "10px",
                  border: "none",
                  backgroundColor: "#6366f1",
                  color: "#fff",
                  fontWeight: "600",
                  fontSize: "14px",
                  cursor: "pointer"
                }}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Bookings;
