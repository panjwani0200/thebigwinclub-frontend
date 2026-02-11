import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";

export default function Dashboard() {
  const [clients, setClients] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const [clientsRes, customersRes, betsRes] = await Promise.all([
          api.get("/api/admin/clients"),
          api.get("/api/admin/customers"),
          api.get("/api/bet/all"),
        ]);
        setClients(clientsRes.data || []);
        setCustomers(customersRes.data || []);
        setBets(betsRes.data || []);
      } catch (err) {
        console.error("ADMIN DASHBOARD ERROR:", err);
        setError(err.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const stats = useMemo(() => {
    const totalWager = bets.reduce((sum, b) => sum + Number(b.amount || 0), 0);
    const totalPayout = bets.reduce((sum, b) => sum + Number(b.payout || 0), 0);
    return {
      totalClients: clients.length,
      totalCustomers: customers.length,
      totalBets: bets.length,
      totalWager,
      totalPayout,
      profitLoss: totalWager - totalPayout,
    };
  }, [bets, clients.length, customers.length]);

  if (loading) {
    return <div className="casino-empty">Loading dashboard data...</div>;
  }

  return (
    <section>
      <h1 className="casino-section-title">Admin Dashboard</h1>
      <p className="casino-section-sub">
        Live operations across clients, customers, markets, and payouts
      </p>

      {error ? <div className="casino-alert error">{error}</div> : null}

      <div className="casino-grid-auto mt-4">
        <article className="casino-kpi">
          <div className="casino-kpi-label">Total Clients</div>
          <div className="casino-kpi-value">{stats.totalClients}</div>
        </article>
        <article className="casino-kpi">
          <div className="casino-kpi-label">Total Customers</div>
          <div className="casino-kpi-value">{stats.totalCustomers}</div>
        </article>
        <article className="casino-kpi">
          <div className="casino-kpi-label">Total Bets</div>
          <div className="casino-kpi-value">{stats.totalBets}</div>
        </article>
        <article className="casino-kpi">
          <div className="casino-kpi-label">Total Wager</div>
          <div className="casino-kpi-value">{"\u20B9"}{stats.totalWager}</div>
        </article>
        <article className="casino-kpi">
          <div className="casino-kpi-label">Total Payout</div>
          <div className="casino-kpi-value">{"\u20B9"}{stats.totalPayout}</div>
        </article>
        <article className="casino-kpi">
          <div className="casino-kpi-label">Profit / Loss</div>
          <div
            className={`casino-kpi-value ${
              stats.profitLoss >= 0 ? "text-casino-success" : "text-casino-danger"
            }`}
          >
            {"\u20B9"}{stats.profitLoss}
          </div>
        </article>
      </div>

      <div className="casino-grid-2 mt-4">
        <div className="casino-kpi">
          <div className="casino-kpi-label">Recent Clients</div>
          <div className="casino-list mt-2">
            {clients.slice(0, 6).map((client) => (
              <div className="casino-list-item" key={client._id}>
                <div>
                  <div className="casino-list-title">{client.userCode || "-"}</div>
                  <div className="casino-list-sub">{client.name || client.email}</div>
                </div>
                <div className="casino-list-sub">
                  {new Date(client.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
            {clients.length === 0 ? (
              <div className="casino-empty">No clients created yet.</div>
            ) : null}
          </div>
        </div>

        <div className="casino-kpi">
          <div className="casino-kpi-label">Recent Bets</div>
          <div className="casino-list mt-2">
            {bets.slice(0, 6).map((bet) => (
              <div className="casino-list-item" key={bet._id}>
                <div>
                  <div className="casino-list-title">{"\u20B9"}{bet.amount}</div>
                  <div className="casino-list-sub">{bet.gameSlug || bet.gameId?.name || "Game"}</div>
                </div>
                <div>
                  <span
                    className={`casino-badge ${
                      bet.result === "WIN" ? "success" : bet.result === "LOSE" ? "error" : "warn"
                    }`}
                  >
                    {bet.result || "PENDING"}
                  </span>
                </div>
              </div>
            ))}
            {bets.length === 0 ? <div className="casino-empty">No bets available yet.</div> : null}
          </div>
        </div>
      </div>
    </section>
  );
}
