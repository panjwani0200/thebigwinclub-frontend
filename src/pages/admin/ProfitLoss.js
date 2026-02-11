import { useEffect, useState } from "react";
import api from "../../services/api";

export default function ProfitLoss() {
  const [data, setData] = useState(null);
  const [type, setType] = useState("daily");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchData(type);
  }, [type]);

  const fetchData = async (period) => {
    try {
      setError("");
      const res = await api.get(`/api/bet/profit-loss/${period}`);
      setData(res.data);
    } catch (err) {
      console.error("PROFIT LOSS ERROR:", err);
      setData(null);
      setError(err.response?.data?.message || "Failed to load profit/loss");
    }
  };

  return (
    <section>
      <h2 className="casino-section-title">Profit / Loss Report</h2>
      <p className="casino-section-sub">Financial report by period</p>

      <div className="casino-actions mt-3">
        <button onClick={() => setType("daily")} className={type === "daily" ? "" : "casino-btn-ghost"}>
          Daily
        </button>
        <button onClick={() => setType("weekly")} className={type === "weekly" ? "" : "casino-btn-ghost"}>
          Weekly
        </button>
        <button onClick={() => setType("monthly")} className={type === "monthly" ? "" : "casino-btn-ghost"}>
          Monthly
        </button>
      </div>

      {error ? <div className="casino-alert error">{error}</div> : null}

      {data ? (
        <div className="casino-grid-2 mt-4">
          <article className="casino-kpi">
            <div className="casino-kpi-label">Period</div>
            <div className="casino-kpi-value">{data.period}</div>
          </article>
          <article className="casino-kpi">
            <div className="casino-kpi-label">Total Bet</div>
            <div className="casino-kpi-value">{"\u20B9"}{data.totalBet}</div>
          </article>
          <article className="casino-kpi">
            <div className="casino-kpi-label">Total Win</div>
            <div className="casino-kpi-value">{"\u20B9"}{data.totalWin}</div>
          </article>
          <article className="casino-kpi">
            <div className="casino-kpi-label">Profit / Loss</div>
            <div className={`casino-kpi-value ${data.profitLoss >= 0 ? "text-casino-success" : "text-casino-danger"}`}>
              {"\u20B9"}{data.profitLoss}
            </div>
          </article>
        </div>
      ) : (
        <div className="casino-empty mt-4">No report data available.</div>
      )}
    </section>
  );
}
