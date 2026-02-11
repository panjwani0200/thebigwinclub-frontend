import { useEffect, useState } from "react";
import api from "../../services/api";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/api/admin/customers");
      setCustomers(res.data || []);
    } catch (err) {
      console.error("CUSTOMERS FETCH ERROR:", err);
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
      await api.delete(`/api/admin/customers/${customer._id}`);
      setCustomers((prev) => prev.filter((c) => c._id !== customer._id));
    } catch (err) {
      console.error("DELETE CUSTOMER ERROR:", err);
      setError(err.response?.data?.message || "Failed to delete customer");
    } finally {
      setDeletingId("");
    }
  };

  return (
    <section>
      <h2 className="casino-section-title">Customers</h2>
      <p className="casino-section-sub">Customer accounts and the linked owner client</p>

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
                <th>Customer</th>
                <th>Customer ID</th>
                <th>Email</th>
                <th>Client</th>
                <th>Created</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c._id}>
                  <td>{c.name || "Customer"}</td>
                  <td>{c.userCode || "-"}</td>
                  <td>{c.email || "-"}</td>
                  <td>
                    {c.createdByClient?.name || c.createdByClient?.email || "N/A"}
                    <div className="text-xs text-slate-400">{c.createdByClient?.userCode || "-"}</div>
                  </td>
                  <td>{new Date(c.createdAt).toLocaleString()}</td>
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
