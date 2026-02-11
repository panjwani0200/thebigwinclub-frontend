import { useState } from "react";
import api from "../../services/api";

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setMessage("");
      setError("");
      await api.post("/api/auth/change-password", { currentPassword, newPassword });
      setMessage("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <h2 className="casino-section-title">Change Password</h2>
      <p className="casino-section-sub">Update your account password securely</p>

      <form onSubmit={submit} className="mt-4 max-w-md">
        <label className="mb-2 block text-sm text-slate-300">Current Password</label>
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          autoComplete="current-password"
          required
        />

        <label className="mb-2 block text-sm text-slate-300">New Password</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          autoComplete="new-password"
          minLength={6}
          required
        />

        <button disabled={loading} type="submit">
          {loading ? "Updating..." : "Update Password"}
        </button>
      </form>

      {message ? <div className="casino-alert success mt-3">{message}</div> : null}
      {error ? <div className="casino-alert error mt-3">{error}</div> : null}
    </section>
  );
}

