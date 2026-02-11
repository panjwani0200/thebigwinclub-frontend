import { useEffect, useState } from "react";
import api from "../../services/api";

export default function WithdrawLogs() {
  const [clientCode, setClientCode] = useState("");
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadLogs = async (code = "") => {
    try {
      setLoading(true);
      setError("");
      const url = code
        ? `/api/admin/withdraw-logs?clientCode=${encodeURIComponent(code)}`
        : "/api/admin/withdraw-logs";
      const res = await api.get(url);
      setLogs(res.data || []);
    } catch (err) {
      console.error("ADMIN WITHDRAW LOGS ERROR:", err);
      setError(err.response?.data?.message || "Failed to load withdraw logs");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  return (
    <section>
      <h2 className="casino-section-title">Withdraw Logs</h2>
      <p className="casino-section-sub">Track customer and client withdrawals with audit trail</p>

      <div className="casino-actions mt-3">
        <input
          className="max-w-xs"
          placeholder="Client Code (CL0001)"
          value={clientCode}
          onChange={(e) => setClientCode(e.target.value)}
        />
        <button onClick={() => loadLogs(clientCode.trim())}>Search</button>
        <button className="casino-btn-ghost" onClick={() => {
          setClientCode("");
          loadLogs();
        }}>
          Clear
        </button>
      </div>

      {loading ? <div className="casino-empty mt-4">Loading logs...</div> : null}
      {error ? <div className="casino-alert error">{error}</div> : null}

      {!loading && !error && logs.length === 0 ? (
        <div className="casino-empty mt-4">No withdraw logs found.</div>
      ) : null}

      {!loading && logs.length > 0 ? (
        <div className="casino-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Customer</th>
                <th>Client</th>
                <th>Admin</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log._id}>
                  <td>{new Date(log.createdAt).toLocaleString()}</td>
                  <td>{log.withdrawType || "CUSTOMER"}</td>
                  <td>
                    {log.customerId?.name || "-"}
                    <div className="text-xs text-slate-400">{log.customerId?.userCode || "-"}</div>
                  </td>
                  <td>
                    {log.clientId?.name || "-"}
                    <div className="text-xs text-slate-400">{log.clientId?.userCode || "-"}</div>
                  </td>
                  <td>
                    {log.adminId?.name || "-"}
                    <div className="text-xs text-slate-400">{log.adminId?.userCode || "-"}</div>
                  </td>
                  <td>{"\u20B9"}{log.amount}</td>
                  <td>
                    <span className={`casino-badge ${log.status === "SUCCESS" ? "success" : "warn"}`}>
                      {log.status || "SUCCESS"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}
