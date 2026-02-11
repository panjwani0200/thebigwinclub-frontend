import { useEffect, useState } from "react";
import api from "../../services/api";

export default function Transactions() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadTransactions = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/api/super-admin/transactions");
      if (Array.isArray(res.data)) {
        setList(res.data);
      } else if (Array.isArray(res.data.transactions)) {
        setList(res.data.transactions);
      } else {
        setList([]);
      }
    } catch (err) {
      console.error("TRANSACTIONS ERROR:", err);
      setError(err.response?.data?.message || "Failed to load transactions");
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  return (
    <section>
      <h2 className="casino-section-title">Transactions</h2>
      <p className="casino-section-sub">System-wide transfer and wallet movement logs</p>

      <div className="casino-actions mt-3">
        <button onClick={loadTransactions} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {error ? <div className="casino-alert error">{error}</div> : null}

      {!loading && list.length === 0 ? (
        <div className="casino-empty mt-4">No transactions found.</div>
      ) : null}

      {list.length > 0 ? (
        <div className="casino-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>From</th>
                <th>To</th>
                <th>Type</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {list.map((t) => (
                <tr key={t._id}>
                  <td>{new Date(t.createdAt).toLocaleString()}</td>
                  <td>{t.from?.name || t.from?.email || "System"}</td>
                  <td>{t.to?.name || t.to?.email || "User"}</td>
                  <td>{t.type || "-"}</td>
                  <td>{"\u20B9"}{t.amount || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}
