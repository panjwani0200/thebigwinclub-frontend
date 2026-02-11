import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";

export default function InlineBetHistory({
  title = "Previous Bets",
  gameSlugs = [],
  limit = 10,
  refreshKey,
}) {
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const normalizedSlugs = useMemo(
    () => gameSlugs.map((slug) => String(slug || "").toLowerCase()),
    [gameSlugs]
  );

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await api.get("/api/bet/my");
        const all = res.data || [];

        const filtered = all
          .filter((b) => normalizedSlugs.includes(String(b.gameSlug || "").toLowerCase()))
          .slice(0, limit);

        setBets(filtered);
      } catch (err) {
        console.error("INLINE BET HISTORY ERROR:", err);
        setBets([]);
        setError("Failed to load previous bets");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [limit, normalizedSlugs, refreshKey]);

  return (
    <section className="casino-page mt-4">
      <h3 className="casino-section-title">{title}</h3>
      <p className="casino-section-sub">Latest bets for this game while you play</p>

      {loading ? <div className="casino-empty mt-3">Loading previous bets...</div> : null}
      {error ? <div className="casino-alert error mt-3">{error}</div> : null}

      {!loading && !error && bets.length === 0 ? (
        <div className="casino-empty mt-3">No previous bets for this game.</div>
      ) : null}

      {!loading && bets.length > 0 ? (
        <div className="casino-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Round</th>
                <th>Selection</th>
                <th>Amount</th>
                <th>Payout</th>
                <th>Result</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {bets.map((b) => (
                <tr key={b._id}>
                  <td>{b.roundId || "-"}</td>
                  <td>{b.side || b.symbol || "-"}</td>
                  <td>{`\u20B9${Number(b.amount || 0)}`}</td>
                  <td>{`\u20B9${Number(b.payout || 0)}`}</td>
                  <td>
                    <span
                      className={`casino-badge ${
                        b.result === "WIN"
                          ? "success"
                          : b.result === "LOSE" || b.result === "LOSS"
                            ? "error"
                            : "warn"
                      }`}
                    >
                      {b.result || "PENDING"}
                    </span>
                  </td>
                  <td>{b.createdAt ? new Date(b.createdAt).toLocaleString() : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}
