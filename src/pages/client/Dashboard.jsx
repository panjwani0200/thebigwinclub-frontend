import { useEffect, useState } from "react";
import api from "../../services/api";

export default function Dashboard() {
  const [balance, setBalance] = useState("...");
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");

  const fetchWallet = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/api/client/wallet");
      setProfile({
        name: res.data.name,
        email: res.data.email,
        userCode: res.data.userCode,
        role: res.data.role,
        userId: res.data.userId,
      });
      setBalance(res.data.balance);
    } catch (err) {
      console.error("WALLET API ERROR:", err);
      setBalance("ERR");
      setError(err.response?.data?.message || "Failed to fetch wallet balance");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  return (
    <section>
      <h2 className="casino-section-title">Client Dashboard</h2>
      <p className="casino-section-sub">Customer operations and balance control center</p>

      {profile ? (
        <div className="casino-pill mt-2">
          {profile.name || profile.email} ({profile.userCode || "no-code"})
        </div>
      ) : null}
      {error ? <div className="casino-alert error">{error}</div> : null}

      <div className="casino-grid-2 mt-4">
        <article className="casino-kpi">
          <div className="casino-kpi-label">Wallet Balance</div>
          <div className="casino-kpi-value text-casino-success">? {balance}</div>
          <div className="casino-actions mt-3">
            <button onClick={fetchWallet} disabled={loading}>
              {loading ? "Refreshing..." : "Refresh Balance"}
            </button>
          </div>
        </article>

        <article className="casino-kpi">
          <div className="casino-kpi-label">Account Metadata</div>
          <div className="mt-3 text-sm leading-7">
            <div>
              <span className="text-slate-400">User ID:</span> {profile?.userId || "-"}
            </div>
            <div>
              <span className="text-slate-400">Role:</span> {profile?.role || "-"}
            </div>
            <div>
              <span className="text-slate-400">Email:</span> {profile?.email || "-"}
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
