import { useEffect, useState } from "react";
import api from "../../services/api";

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/api/admin/clients");
      setClients(res.data || []);
    } catch (err) {
      console.error("FETCH CLIENTS ERROR:", err);
      setError(err.response?.data?.message || "Failed to fetch clients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const removeClient = async (client) => {
    const ok = window.confirm(
      `Delete client ${client.userCode || client.email}? This will also remove linked customers and their bets.`
    );
    if (!ok) return;

    try {
      setDeletingId(client._id);
      setError("");
      await api.delete(`/api/admin/clients/${client._id}`);
      setClients((prev) => prev.filter((c) => c._id !== client._id));
    } catch (err) {
      console.error("DELETE CLIENT ERROR:", err);
      setError(err.response?.data?.message || "Failed to delete client");
    } finally {
      setDeletingId("");
    }
  };

  return (
    <div>
      <h2>Clients</h2>
      <p className="opacity-70">Client identities and onboarding timestamps</p>
      <button onClick={load} disabled={loading}>
        {loading ? "Refreshing..." : "Refresh"}
      </button>
      {error ? <p className="text-casino-danger">{error}</p> : null}

      {clients.length === 0 ? (
        <div className="casino-empty mt-4">No clients available.</div>
      ) : (
        <table className="mt-4">
          <thead>
            <tr>
              <th>Client Code</th>
              <th>User ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Created At</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => (
              <tr key={c._id}>
                <td>
                  <b>{c.userCode || "-"}</b>
                </td>
                <td className="text-xs text-slate-400">{c._id}</td>
                <td>{c.name || "-"}</td>
                <td>{c.email}</td>
                <td>{new Date(c.createdAt).toLocaleString()}</td>
                <td>
                  <button
                    className="casino-btn-danger"
                    onClick={() => removeClient(c)}
                    disabled={deletingId === c._id}
                  >
                    {deletingId === c._id ? "Deleting..." : "Delete"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
