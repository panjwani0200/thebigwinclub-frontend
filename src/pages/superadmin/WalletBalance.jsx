import { useState } from "react";
import api from "../../services/api";

export default function WalletBalance() {
  const [userId, setUserId] = useState("");
  const [balance, setBalance] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const checkBalance = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get(`/api/wallet/${userId}`);
      setBalance(res.data.balance);
    } catch (err) {
      console.error("WALLET BALANCE ERROR:", err);
      setError(err.response?.data?.message || "Failed to fetch wallet");
      setBalance(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <h2 className="casino-section-title">Wallet Balance Lookup</h2>
      <p className="casino-section-sub">Check current wallet by user ID</p>

      <div className="casino-actions mt-3">
        <input
          className="max-w-md"
          placeholder="User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />
        <button onClick={checkBalance} disabled={loading}>
          {loading ? "Checking..." : "Check"}
        </button>
      </div>

      {error ? <div className="casino-alert error">{error}</div> : null}
      {balance !== null ? (
        <div className="casino-kpi mt-4 max-w-md">
          <div className="casino-kpi-label">Current Balance</div>
          <div className="casino-kpi-value text-casino-success">{"\u20B9"}{balance}</div>
        </div>
      ) : null}
    </section>
  );
}
