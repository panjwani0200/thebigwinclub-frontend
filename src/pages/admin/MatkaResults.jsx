import { useEffect, useState } from "react";
import api from "../../services/api";

export default function MatkaResults() {
  const [markets, setMarkets] = useState([]);
  const [selected, setSelected] = useState("");
  const [result, setResult] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loadMarkets = async () => {
    try {
      const res = await api.get("/api/admin/matka/markets");
      setMarkets(res.data || []);
    } catch (err) {
      console.error("MATKA ADMIN MARKETS ERROR:", err);
      setError("Failed to load market list");
    }
  };

  useEffect(() => {
    loadMarkets();
  }, []);

  const declareResult = async () => {
    if (!selected || !result) return;
    try {
      setLoading(true);
      setError("");
      setMessage("");
      await api.post("/api/admin/matka/results", { marketId: selected, result });
      setMessage("Result declared successfully.");
      setResult("");
      await loadMarkets();
    } catch (err) {
      console.error("MATKA RESULT ERROR:", err);
      setError(err.response?.data?.message || "Failed to declare result");
    } finally {
      setLoading(false);
    }
  };

  const openMarket = async () => {
    if (!selected) return;
    try {
      setLoading(true);
      setError("");
      setMessage("");
      await api.post(`/api/admin/matka/markets/${selected}/open`);
      setMessage("Market opened for new round.");
      await loadMarkets();
    } catch (err) {
      console.error("MATKA OPEN ERROR:", err);
      setError(err.response?.data?.message || "Failed to open market");
    } finally {
      setLoading(false);
    }
  };

  const closeMarket = async () => {
    if (!selected) return;
    try {
      setLoading(true);
      setError("");
      setMessage("");
      await api.post(`/api/admin/matka/markets/${selected}/close`);
      setMessage("Market closed.");
      await loadMarkets();
    } catch (err) {
      console.error("MATKA CLOSE ERROR:", err);
      setError(err.response?.data?.message || "Failed to close market");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <h2 className="casino-section-title">Matka Results</h2>
      <p className="casino-section-sub">Declare results manually using format: XXX-YY-XXX</p>

      <div className="casino-grid-2 mt-3">
        <select value={selected} onChange={(e) => setSelected(e.target.value)}>
          <option value="">Select Market</option>
          {markets.map((m) => (
            <option key={m.marketId} value={m.marketId}>
              {m.name} ({m.status})
            </option>
          ))}
        </select>
        <input
          value={result}
          onChange={(e) => setResult(e.target.value)}
          placeholder="Result (XXX-YY-XXX)"
        />
      </div>

      <div className="casino-actions mt-1">
        <button onClick={declareResult} disabled={loading}>
          {loading ? "Saving..." : "Declare Result"}
        </button>
        <button className="casino-btn-ghost" onClick={openMarket} disabled={loading}>
          Open Market
        </button>
        <button className="casino-btn-danger" onClick={closeMarket} disabled={loading}>
          Close Market
        </button>
      </div>

      {message ? <div className="casino-alert success">{message}</div> : null}
      {error ? <div className="casino-alert error">{error}</div> : null}

      <div className="casino-list mt-4">
        {markets.map((m) => (
          <article className="casino-list-item" key={m.marketId}>
            <div>
              <div className="casino-list-title">{m.name}</div>
              <div className="casino-list-sub">
                {m.openTime} - {m.closeTime}
              </div>
            </div>
            <div className="text-right">
              <span className={`casino-badge ${m.status === "running" ? "success" : "error"}`}>
                {m.status}
              </span>
              <div className="mt-2 text-sm font-bold">{m.result || "-"}</div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
