import { useEffect, useState } from "react";
import api from "../../services/api";

export default function MyCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/api/customer/my-customers");
      setCustomers(res.data || []);
    } catch (err) {
      console.error("MY CUSTOMERS ERROR:", err);
      setError(err.response?.data?.message || "Failed to load customers");
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const removeCustomer = async (customer) => {
    const ok = window.confirm(
      `Delete customer ${customer.userCode || customer.email}? This will remove wallet and bet records.`
    );
    if (!ok) return;

    try {
      setDeletingId(customer._id);
      setError("");
      await api.delete(`/api/client/my-customers/${customer._id}`);
      setCustomers((prev) => prev.filter((c) => c._id !== customer._id));
    } catch (err) {
      console.error("DELETE MY CUSTOMER ERROR:", err);
      setError(err.response?.data?.message || "Failed to delete customer");
    } finally {
      setDeletingId("");
    }
  };

  return (
    <section>
      <h2 className="casino-section-title">My Customers</h2>
      <p className="casino-section-sub">Customers created under your client account</p>

      <div className="casino-actions mt-3">
        <button onClick={load} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {error ? <div className="casino-alert error">{error}</div> : null}

      {customers.length === 0 ? (
        <div className="casino-empty mt-4">No customers found.</div>
      ) : (
        <div className="casino-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Customer ID</th>
                <th>Email</th>
                <th>Created</th>
                <th>Mongo ID</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c._id}>
                  <td>{c.name || "Customer"}</td>
                  <td>{c.userCode || "-"}</td>
                  <td>{c.email || "-"}</td>
                  <td>{new Date(c.createdAt).toLocaleString()}</td>
                  <td className="text-xs text-slate-400">{c._id}</td>
                  <td>
                    <button
                      className="casino-btn-danger"
                      onClick={() => removeCustomer(c)}
                      disabled={deletingId === c._id}
                    >
                      {deletingId === c._id ? "Deleting..." : "Delete"}
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
