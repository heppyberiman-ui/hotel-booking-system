import { useNavigate, useLocation, Link, Outlet } from "react-router-dom";

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

function CustomerLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUserFromToken();

  const handleLogout = () => {
    if (window.confirm("Apakah Anda yakin ingin logout?")) {
      localStorage.removeItem("token");
      navigate("/");
    }
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Rooms", path: "/rooms-list" },
    { name: "About", path: "/about" }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", fontFamily: "'Inter', sans-serif", backgroundColor: "#fafaf9" }}>
      {/* Top Navbar */}
      <header
        style={{
          height: "80px",
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(231, 229, 228, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 60px",
          position: "sticky",
          top: 0,
          zIndex: 100,
          boxShadow: "0 4px 20px rgba(0,0,0,0.03)"
        }}
      >
        {/* Brand Logo */}
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", color: "#1c1917" }}>
          <span style={{ fontSize: "32px" }}>🏨</span>
          <div>
            <h1 style={{ fontSize: "20px", fontWeight: "800", margin: 0, letterSpacing: "-0.5px" }}>
              Grand Horizon
            </h1>
            <span style={{ fontSize: "11px", color: "#b45309", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1px" }}>
              Luxury Hotel
            </span>
          </div>
        </Link>

        {/* Center Links */}
        <nav style={{ display: "flex", gap: "32px" }}>
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                style={{
                  textDecoration: "none",
                  color: isActive ? "#b45309" : "#57534e",
                  fontWeight: isActive ? "700" : "500",
                  fontSize: "15px",
                  transition: "color 0.2s",
                  borderBottom: isActive ? "2px solid #b45309" : "2px solid transparent",
                  padding: "8px 0"
                }}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Right Auth / Profile actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          {user ? (
            /* Logged in customer view */
            <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
              <div style={{ display: "flex", gap: "16px" }}>
                <Link
                  to="/history"
                  style={{
                    textDecoration: "none",
                    color: location.pathname === "/history" ? "#b45309" : "#57534e",
                    fontWeight: "600",
                    fontSize: "14px"
                  }}
                >
                  My Bookings
                </Link>
                <Link
                  to="/profile"
                  style={{
                    textDecoration: "none",
                    color: location.pathname === "/profile" ? "#b45309" : "#57534e",
                    fontWeight: "600",
                    fontSize: "14px"
                  }}
                >
                  Profile
                </Link>
              </div>

              {/* Avatar and Logout */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", borderLeft: "1px solid #e7e5e4", paddingLeft: "20px" }}>
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.name}
                    style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover", border: "2px solid #b45309" }}
                  />
                ) : (
                  <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "14px", color: "#4b5563" }}>
                    {user.name ? user.name.charAt(0).toUpperCase() : "T"}
                  </div>
                )}
                <span style={{ fontSize: "14px", fontWeight: "600", color: "#1c1917" }}>
                  Halo, {(user.name || "Tamu").split(" ")[0]}
                </span>
                <button
                  onClick={handleLogout}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "8px",
                    border: "1px solid #d6d3d1",
                    backgroundColor: "transparent",
                    color: "#78716c",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            /* Guest user login/register links */
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <Link
                to="/customer-login"
                style={{
                  textDecoration: "none",
                  color: "#57534e",
                  fontWeight: "600",
                  fontSize: "14px",
                  padding: "10px 20px"
                }}
              >
                Sign In
              </Link>
              <Link
                to="/customer-register"
                style={{
                  textDecoration: "none",
                  backgroundColor: "#b45309",
                  color: "#fff",
                  fontWeight: "600",
                  fontSize: "14px",
                  padding: "10px 22px",
                  borderRadius: "10px",
                  boxShadow: "0 4px 10px rgba(180, 83, 9, 0.15)",
                  transition: "all 0.2s"
                }}
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Main Child Page Content */}
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      {/* Footer Section */}
      <footer style={{ backgroundColor: "#1c1917", color: "#a8a29e", padding: "60px 60px 30px 60px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "60px", marginBottom: "40px" }}>
          <div>
            <h3 style={{ color: "#fff", fontSize: "18px", fontWeight: "700", margin: "0 0 16px 0" }}>
              Grand Horizon Hotel & Resort
            </h3>
            <p style={{ fontSize: "14px", lineHeight: "1.6", maxWidth: "360px", margin: 0 }}>
              Menawarkan pemandangan pesisir pantai eksotis Bali, pelayanan butler pribadi 24 jam, jacuzzi, dan fasilitas premium untuk mewujudkan liburan impian Anda.
            </p>
          </div>

          <div>
            <h4 style={{ color: "#fff", fontSize: "15px", fontWeight: "600", margin: "0 0 16px 0", textTransform: "uppercase", letterSpacing: "1px" }}>
              Navigasi
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "14px" }}>
              <Link to="/" style={{ color: "#a8a29e", textDecoration: "none" }}>Beranda</Link>
              <Link to="/rooms-list" style={{ color: "#a8a29e", textDecoration: "none" }}>Daftar Kamar</Link>
              <Link to="/about" style={{ color: "#a8a29e", textDecoration: "none" }}>Tentang Kami</Link>
            </div>
          </div>

          <div>
            <h4 style={{ color: "#fff", fontSize: "15px", fontWeight: "600", margin: "0 0 16px 0", textTransform: "uppercase", letterSpacing: "1px" }}>
              Hubungi Kami
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "14px" }}>
              <span>📍 Jl. Horizon Indah No. 88, Bali, Indonesia</span>
              <span>📞 +62 21 9999 8888</span>
              <span>✉️ info@grandhorizon.com</span>
              <a
                href="https://wa.me/6282288110375"
                target="_blank"
                rel="noreferrer"
                style={{ color: "#a8a29e", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "8px", transition: "color 0.2s" }}
                onMouseEnter={(e) => e.currentTarget.style.color = "#fbbf24"}
                onMouseLeave={(e) => e.currentTarget.style.color = "#a8a29e"}
              >
                <span>💬</span> WhatsApp: 082288110375
              </a>
              <a
                href="https://instagram.com/grandhorizon"
                target="_blank"
                rel="noreferrer"
                style={{ color: "#a8a29e", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "8px", transition: "color 0.2s" }}
                onMouseEnter={(e) => e.currentTarget.style.color = "#fbbf24"}
                onMouseLeave={(e) => e.currentTarget.style.color = "#a8a29e"}
              >
                <span>📸</span> Instagram: @grandhorizon
              </a>
              <a
                href="https://facebook.com/grandhorizon"
                target="_blank"
                rel="noreferrer"
                style={{ color: "#a8a29e", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "8px", transition: "color 0.2s" }}
                onMouseEnter={(e) => e.currentTarget.style.color = "#fbbf24"}
                onMouseLeave={(e) => e.currentTarget.style.color = "#a8a29e"}
              >
                <span>👥</span> Facebook: Grand Horizon
              </a>
            </div>
          </div>
        </div>

        <div style={{ borderTop: "1px solid #44403c", paddingTop: "24px", display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
          <span>© {new Date().getFullYear()} Grand Horizon Hotel. All Rights Reserved.</span>
          <div style={{ display: "flex", gap: "16px" }}>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default CustomerLayout;
