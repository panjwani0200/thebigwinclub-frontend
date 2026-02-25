import { useEffect, useState } from "react";
import api from "../../services/api";

export default function MatkaResults() {
  const [markets, setMarkets] = useState([]);
  const [selected, setSelected] = useState("");
  const [result, setResult] = useState("");
  const [openTime, setOpenTime] = useState("");
  const [closeTime, setCloseTime] = useState("");
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

  useEffect(() => {
    const active = markets.find((m) => m.marketId === selected);
    if (!active) {
      setOpenTime("");
      setCloseTime("");
      return;
    }
    setOpenTime(active.openTime || "");
    setCloseTime(active.closeTime || "");
  }, [selected, markets]);

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

  const updateSession = async (sessionType, action) => {
    if (!selected) return;
    try {
      setLoading(true);
      setError("");
      setMessage("");
      await api.post(`/api/admin/matka/markets/${selected}/session/${sessionType}/${action}`);
      setMessage(`${sessionType.toUpperCase()} session ${action === "open" ? "opened" : "closed"}.`);
      await loadMarkets();
    } catch (err) {
      console.error("MATKA SESSION UPDATE ERROR:", err);
      setError(err.response?.data?.message || "Failed to update session");
    } finally {
      setLoading(false);
    }
  };

  const updateTiming = async () => {
    if (!selected) return;
    if (!openTime.trim() || !closeTime.trim()) {
      setError("Both open and close time are required");
      return;
    }
    try {
      setLoading(true);
      setError("");
      setMessage("");
      await api.patch(`/api/admin/matka/markets/${selected}/timing`, {
        openTime: openTime.trim(),
        closeTime: closeTime.trim(),
      });
      setMessage("Market timing updated.");
      await loadMarkets();
    } catch (err) {
      console.error("MATKA TIMING UPDATE ERROR:", err);
      setError(err.response?.data?.message || "Failed to update timing");
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

      <div className="casino-grid-2 mt-2">
        <input
          value={openTime}
          onChange={(e) => setOpenTime(e.target.value)}
          placeholder="Open Time (e.g. 10:00 AM)"
        />
        <input
          value={closeTime}
          onChange={(e) => setCloseTime(e.target.value)}
          placeholder="Close Time (e.g. 02:30 PM)"
        />
      </div>

      <div className="casino-actions mt-1">
        <button onClick={declareResult} disabled={loading}>
          {loading ? "Saving..." : "Declare Result"}
        </button>
        <button className="casino-btn-ghost" onClick={updateTiming} disabled={loading}>
          Update Timing
        </button>
        <button className="casino-btn-ghost" onClick={openMarket} disabled={loading}>
          Open Market
        </button>
        <button className="casino-btn-danger" onClick={closeMarket} disabled={loading}>
          Close Market
        </button>
      </div>

      <div className="casino-actions mt-2">
        <button className="casino-btn-ghost" onClick={() => updateSession("open", "open")} disabled={loading}>
          Open Panel: Open
        </button>
        <button className="casino-btn-danger" onClick={() => updateSession("open", "close")} disabled={loading}>
          Open Panel: Close
        </button>
        <button className="casino-btn-ghost" onClick={() => updateSession("close", "open")} disabled={loading}>
          Close Panel: Open
        </button>
        <button className="casino-btn-danger" onClick={() => updateSession("close", "close")} disabled={loading}>
          Close Panel: Close
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
              <div className="mt-2 text-xs text-slate-400">
                OPEN: {(m.openSessionStatus || "running").toUpperCase()} | CLOSE: {(m.closeSessionStatus || "running").toUpperCase()}
              </div>
              <div className="mt-2 text-sm font-bold">{m.result || "-"}</div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
