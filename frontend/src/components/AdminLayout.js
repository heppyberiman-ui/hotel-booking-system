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

function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUserFromToken();

  const handleLogout = () => {
    if (window.confirm("Apakah Anda yakin ingin keluar?")) {
      localStorage.removeItem("token");
      navigate("/login");
    }
  };

  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="9" rx="1" />
          <rect x="14" y="3" width="7" height="5" rx="1" />
          <rect x="14" y="12" width="7" height="9" rx="1" />
          <rect x="3" y="16" width="7" height="5" rx="1" />
        </svg>
      )
    },
    {
      name: "Rooms",
      path: "/rooms",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8v9" />
        </svg>
      )
    },
    {
      name: "Room Types",
      path: "/room-types",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 2 7 12 12 22 7 12 2" />
          <polygon points="2 17 12 22 22 17" />
          <polygon points="2 12 12 17 22 12" />
        </svg>
      )
    },
    {
      name: "Facilities",
      path: "/facilities",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
      )
    },
    {
      name: "Bookings",
      path: "/bookings",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      )
    },
    {
      name: "Users",
      path: "/users",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      )
    }
  ];

  const getPageTitle = () => {
    const currentRoute = menuItems.find((item) => item.path === location.pathname);
    return currentRoute ? currentRoute.name : "Grand Horizon";
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      {/* Sidebar navigation */}
      <div
        style={{
          width: "260px",
          backgroundColor: "#0f172a",
          color: "#94a3b8",
          height: "100vh",
          position: "fixed",
          top: 0,
          left: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "24px 16px",
          boxSizing: "border-box",
          borderRight: "1px solid #1e293b",
          zIndex: 100
        }}
      >
        <div>
          {/* Logo Brand */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px 8px 32px 8px",
              borderBottom: "1px solid #1e293b",
              marginBottom: "24px"
            }}
          >
            <span style={{ fontSize: "28px" }}>🏨</span>
            <div>
              <h2 style={{ fontSize: "16px", fontWeight: "700", color: "#fff", margin: 0 }}>
                Grand Horizon
              </h2>
              <span style={{ fontSize: "11px", color: "#6366f1", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1px" }}>
                Admin Portal
              </span>
            </div>
          </div>

          {/* Links list */}
          <nav style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "12px 16px",
                    borderRadius: "12px",
                    color: isActive ? "#fff" : "#94a3b8",
                    backgroundColor: isActive ? "#6366f1" : "transparent",
                    textDecoration: "none",
                    fontWeight: isActive ? "600" : "500",
                    fontSize: "14px",
                    transition: "all 0.2s ease",
                    boxShadow: isActive ? "0 4px 12px rgba(99, 102, 241, 0.25)" : "none"
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", opacity: isActive ? 1 : 0.7 }}>
                    {item.icon}
                  </span>
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Sidebar & Logout */}
        <div>
          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px 16px",
              borderRadius: "12px",
              color: "#f43f5e",
              backgroundColor: "rgba(244, 63, 94, 0.08)",
              border: "none",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "14px",
              transition: "all 0.2s ease",
              boxSizing: "border-box"
            }}
          >
            <span style={{ display: "flex", alignItems: "center" }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </span>
            Logout
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div style={{ marginLeft: "260px", flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Navigation Bar */}
        <header
          style={{
            height: "70px",
            backgroundColor: "#fff",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 40px",
            position: "sticky",
            top: 0,
            zIndex: 90
          }}
        >
          <h1 style={{ fontSize: "20px", fontWeight: "700", color: "#1e293b", margin: 0 }}>
            {getPageTitle()}
          </h1>

          {/* User profile info */}
          {user && (
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "14px", fontWeight: "600", color: "#0f172a" }}>{user.name || "Admin"}</div>
                <div style={{ fontSize: "11px", color: "#64748b", textTransform: "capitalize" }}>{user.role}</div>
              </div>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  backgroundColor: "#6366f1",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "700",
                  fontSize: "16px"
                }}
              >
                {(user.name || "Admin").charAt(0).toUpperCase()}
              </div>
            </div>
          )}
        </header>

        {/* Content Container */}
        <main style={{ padding: "40px", flex: 1, backgroundColor: "#f8fafc" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
