import { useEffect, useMemo, useRef, useState } from "react";
import api from "../../services/api";

export default function InlineBetHistory({
  title = "Previous Bets",
  gameSlugs = [],
  limit = 10,
  perPage,
  enablePagination = false,
  compact = false,
  resultAsDots = false,
  refreshKey,
}) {
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const hasLoadedRef = useRef(false);

  const normalizedSlugs = useMemo(
    () => gameSlugs.map((slug) => String(slug || "").toLowerCase()),
    [gameSlugs]
  );

  useEffect(() => {
    setPage(1);
  }, [refreshKey, normalizedSlugs]);

  useEffect(() => {
    const load = async () => {
      try {
        const firstLoad = !hasLoadedRef.current;
        if (firstLoad) setLoading(true);
        setError("");
        const res = await api.get("/api/bet/my");
        const all = res.data || [];

        const filtered = all.filter((b) =>
          normalizedSlugs.includes(String(b.gameSlug || "").toLowerCase())
        );
        const capped = filtered.slice(0, Math.max(limit, 1));
        const deduped = Array.from(
          new Map(capped.map((row) => [String(row?._id || ""), row])).values()
        ).filter((row) => row && row._id);

        setBets(deduped);
        hasLoadedRef.current = true;
      } catch (err) {
        console.error("INLINE BET HISTORY ERROR:", err);
        if (!hasLoadedRef.current) setBets([]);
        setError("Failed to load previous bets");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [limit, normalizedSlugs, refreshKey]);

  const pageSize = Math.max(Number(perPage || limit || 10), 1);
  const totalPages = Math.max(1, Math.ceil(bets.length / pageSize));
  const pageStart = (page - 1) * pageSize;
  const pageBets = enablePagination ? bets.slice(pageStart, pageStart + pageSize) : bets;

  return (
    <section className="casino-page mt-4">
      <h3 className={`casino-section-title ${compact ? "casino-inline-title-compact" : ""}`}>{title}</h3>
      <p className={`casino-section-sub ${compact ? "casino-inline-sub-compact" : ""}`}>
        Latest bets for this game while you play
      </p>

      {loading ? <div className="casino-empty mt-3">Loading previous bets...</div> : null}
      {error ? <div className="casino-alert error mt-3">{error}</div> : null}

      {!loading && !error && bets.length === 0 ? (
        <div className="casino-empty mt-3">No previous bets for this game.</div>
      ) : null}

      {!loading && bets.length > 0 ? (
        <div className={`casino-table-wrap casino-inline-table-wrap ${compact ? "casino-inline-compact-wrap" : ""}`}>
          <table className={`casino-inline-table ${compact ? "casino-inline-table-compact" : ""}`}>
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
              {pageBets.map((b) => (
                <tr key={b._id}>
                  <td>{b.roundId || "-"}</td>
                  <td>{b.side || b.symbol || "-"}</td>
                  <td>{`\u20B9${Number(b.amount || 0)}`}</td>
                  <td>{`\u20B9${Number(b.payout || 0)}`}</td>
                  <td>
                    {resultAsDots ? (
                      <span className="casino-inline-result-dot-wrap">
                        <span
                          className={`casino-result-dot ${
                            b.result === "WIN"
                              ? "win-blue"
                              : b.result === "LOSE" || b.result === "LOSS"
                                ? "lose-red"
                                : "pending-gray"
                          }`}
                        />
                        <span className="casino-inline-dot-label">{b.result || "PENDING"}</span>
                      </span>
                    ) : (
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
                    )}
                  </td>
                  <td>{b.createdAt ? new Date(b.createdAt).toLocaleString() : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {enablePagination && bets.length > pageSize ? (
        <div className="casino-actions mt-2">
          <button
            className="casino-btn-ghost"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            {"<"}
          </button>
          <span className="text-sm text-slate-200">
            Page {page} / {totalPages}
          </span>
          <button
            className="casino-btn-ghost"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            {">"}
          </button>
        </div>
      ) : null}
    </section>
  );
}
