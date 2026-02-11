import { useEffect, useState } from "react";
import api from "../../services/api";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/api/super-admin/users");
      setUsers(res.data || []);
    } catch (err) {
      console.error("SUPER ADMIN USERS ERROR:", err);
      setError(err.response?.data?.message || "Failed to load users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleUser = async (id) => {
    try {
      await api.put(`/api/super-admin/users/${id}/toggle`);
      await loadUsers();
    } catch (err) {
      console.error("USER TOGGLE ERROR:", err);
      setError(err.response?.data?.message || "Failed to update user status");
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <section>
      <h2 className="casino-section-title">All Users</h2>
      <p className="casino-section-sub">Global user management across all roles</p>

      <div className="casino-actions mt-3">
        <button onClick={loadUsers} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {error ? <div className="casino-alert error">{error}</div> : null}

      {users.length === 0 ? (
        <div className="casino-empty mt-4">No users found.</div>
      ) : (
        <div className="casino-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>User Code</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td>{u.name || "-"}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>{u.userCode || "-"}</td>
                  <td>
                    <span className={`casino-badge ${u.isActive ? "success" : "error"}`}>
                      {u.isActive ? "ACTIVE" : "BLOCKED"}
                    </span>
                  </td>
                  <td>
                    <button
                      className={u.isActive ? "casino-btn-danger" : ""}
                      onClick={() => toggleUser(u._id)}
                    >
                      {u.isActive ? "Block" : "Unblock"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
