import { useEffect, useState } from "react";
import api from "../../services/api";

export default function SeedCustomer() {
  const [customerCode, setCustomerCode] = useState("");
  const [amount, setAmount] = useState("");
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadLogs = async () => {
    try {
      setLoadingLogs(true);
      const res = await api.get("/api/customer/deposit-logs");
      setLogs(res.data || []);
    } catch (err) {
      console.error("DEPOSIT LOGS ERROR:", err);
      setLogs([]);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const seed = async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("");
      const res = await api.post("/api/customer/seed", {
        customerCode,
        amount: Number(amount),
      });
      setMessage(
        `Deposit successful. Client balance: ?${res.data.clientBalance} | Customer balance: ?${res.data.customerBalance}`
      );
      setAmount("");
      await loadLogs();
    } catch (err) {
      console.error("SEED CUSTOMER ERROR:", err);
      setError(err.response?.data?.message || "Seed failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <h2 className="casino-section-title">Seed Customer</h2>
      <p className="casino-section-sub">Deposit funds to customer wallets and keep audit logs</p>

      <div className="casino-grid-2 mt-4">
        <input
          placeholder="Customer Code (CS0001)"
          value={customerCode}
          onChange={(e) => setCustomerCode(e.target.value)}
        />
        <input
          placeholder="Amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>

      <div className="casino-actions mt-2">
        <button onClick={seed} disabled={loading}>
          {loading ? "Processing..." : "Seed"}
        </button>
      </div>

      {message ? <div className="casino-alert success">{message}</div> : null}
      {error ? <div className="casino-alert error">{error}</div> : null}

      <h3 className="mt-5">Deposit Logs</h3>
      {loadingLogs ? <div className="casino-empty">Loading logs...</div> : null}
      {!loadingLogs && logs.length === 0 ? <div className="casino-empty">No deposit logs yet.</div> : null}

      {!loadingLogs && logs.length > 0 ? (
        <div className="casino-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log._id}>
                  <td>{new Date(log.createdAt).toLocaleString()}</td>
                  <td>
                    {log.customerId?.name || "Customer"}
                    <div className="text-xs text-slate-400">{log.customerId?.userCode || "-"}</div>
                  </td>
                  <td>{"\u20B9"}{log.amount}</td>
                  <td><span className="casino-badge success">SUCCESS</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}
