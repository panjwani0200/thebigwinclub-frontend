import { NavLink } from "react-router-dom";

export default function AdminSidebar() {
  const linkStyle = ({ isActive }) => ({
    padding: "12px 16px",
    display: "block",
    textDecoration: "none",
    color: isActive ? "#22c55e" : "#ffffff",
    background: isActive ? "#1e293b" : "transparent",
    borderRadius: 6,
    marginBottom: 6,
    fontWeight: 500,
  });

  return (
    <div
      style={{
        width: 240,
        minHeight: "100vh",
        background: "#0f172a",
        padding: 16,
      }}
    >
      <h2 style={{ color: "white", marginBottom: 20 }}>
        Admin Panel
      </h2>

      <NavLink to="/admin/dashboard" style={linkStyle}>
        📊 Dashboard
      </NavLink>

      <NavLink to="/admin/users" style={linkStyle}>
        👥 Users
      </NavLink>

      <NavLink to="/admin/profit-loss" style={linkStyle}>
        💰 Profit / Loss
      </NavLink>
    </div>
  );
}
