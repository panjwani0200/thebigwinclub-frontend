import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

export default function MatkaHome() {
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await api.get("/api/matka/markets");
        setMarkets(res.data || []);
      } catch (err) {
        console.error("MATKA MARKETS UI ERROR:", err);
        setError(err.response?.data?.message || "Failed to load markets");
        setMarkets([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) return <div className="casino-empty mt-4">Loading markets...</div>;

  return (
    <section className="mt-4">
      <h2 className="casino-section-title">Matka Markets</h2>
      <p className="casino-section-sub">Manual-result markets with strict betting windows</p>
      {error ? <div className="casino-alert error">{error}</div> : null}

      {markets.length === 0 ? (
        <div className="casino-empty mt-4">No markets available.</div>
      ) : (
        <div className="matka-grid">
          {markets.map((m) => (
            <article className="matka-card" key={m.marketId}>
              <h3>{m.name}</h3>
              <div className="text-xs text-slate-400">
                {m.openTime} - {m.closeTime}
              </div>
              <div className={`matka-status ${m.status}`}>
                {m.status === "running" ? "Betting Running" : "Betting Closed"}
              </div>
              {m.result ? (
                <div className="matka-result">{m.result}</div>
              ) : (
                <div className="mt-2 text-xs text-slate-400">Result awaiting admin declaration</div>
              )}
              <button
                className={`matka-cta ${m.status !== "running" ? "disabled" : ""}`}
                disabled={m.status !== "running"}
                onClick={() => navigate(`/matka/play/${m.marketId}`)}
              >
                {m.status === "running" ? "Play Now" : "Closed"}
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
