import { useMemo, useState } from "react";
import api from "../../services/api";

const PAGE_SIZE = 20;

export default function CustomerBets() {
  const [customerCode, setCustomerCode] = useState("");
  const [bets, setBets] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [resultFilter, setResultFilter] = useState("ALL");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const formatInr = (value) => `\u20B9${Number(value || 0)}`;

  const load = async () => {
    try {
      if (!customerCode.trim()) {
        setError("Enter customer code");
        return;
      }
      setLoading(true);
      setError("");
      const res = await api.get(`/api/customer/bets/${customerCode.trim()}`);
      setBets(res.data || []);
      setCurrentPage(1);
    } catch (err) {
      console.error("CUSTOMER BETS ERROR:", err);
      setBets([]);
      setError(err.response?.data?.message || "Failed to load bets");
    } finally {
      setLoading(false);
    }
  };

  const filteredBets = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    return bets.filter((b) => {
      const result = String(b.result || "PENDING").toUpperCase();
      const game = String(b.gameId?.name || b.gameSlug || "").toLowerCase();
      const roundId = String(b.roundId || "").toLowerCase();
      const resultMatch =
        resultFilter === "ALL"
          ? true
          : resultFilter === "LOSE"
            ? result === "LOSE" || result === "LOSS"
            : result === resultFilter;
      const searchMatch = !q || game.includes(q) || roundId.includes(q) || result.toLowerCase().includes(q);
      return resultMatch && searchMatch;
    });
  }, [bets, searchText, resultFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredBets.length / PAGE_SIZE));
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pageEnd = pageStart + PAGE_SIZE;
  const pagedBets = filteredBets.slice(pageStart, pageEnd);
  const showingFrom = filteredBets.length === 0 ? 0 : pageStart + 1;
  const showingTo = Math.min(pageEnd, filteredBets.length);

  const onPrev = () => setCurrentPage((p) => Math.max(1, p - 1));
  const onNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

  return (
    <section>
      <h2 className="casino-section-title">Customer Bets</h2>
      <p className="casino-section-sub">Load and review a single customer's full betting history</p>

      <div className="casino-actions mt-3">
        <input
          className="max-w-xs"
          placeholder="Customer Code (CS0001)"
          value={customerCode}
          onChange={(e) => setCustomerCode(e.target.value)}
        />
        <button onClick={load} disabled={loading}>
          {loading ? "Loading..." : "Load"}
        </button>
      </div>

      {bets.length > 0 ? (
        <div className="casino-actions mt-2">
          <input
            className="max-w-md"
            placeholder="Search game / round / result"
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
              setCurrentPage(1);
            }}
          />
          <button
            className={resultFilter === "ALL" ? "" : "casino-btn-ghost"}
            onClick={() => {
              setResultFilter("ALL");
              setCurrentPage(1);
            }}
          >
            All
          </button>
          <button
            className={resultFilter === "WIN" ? "" : "casino-btn-ghost"}
            onClick={() => {
              setResultFilter("WIN");
              setCurrentPage(1);
            }}
          >
            Wins
          </button>
          <button
            className={resultFilter === "LOSE" ? "" : "casino-btn-ghost"}
            onClick={() => {
              setResultFilter("LOSE");
              setCurrentPage(1);
            }}
          >
            Losses
          </button>
        </div>
      ) : null}

      {error ? <div className="casino-alert error">{error}</div> : null}

      {!loading && !error && bets.length === 0 ? (
        <div className="casino-empty mt-4">No bets to display.</div>
      ) : null}

      {bets.length > 0 ? (
        <>
        <div className="casino-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Game</th>
                <th>Round</th>
                <th>Amount</th>
                <th>Payout</th>
                <th>Profit</th>
                <th>Result</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {pagedBets.map((b) => (
                <tr key={b._id}>
                  <td>{b.gameId?.name || b.gameSlug || "Game"}</td>
                  <td>{b.roundId || "-"}</td>
                  <td>{formatInr(b.amount)}</td>
                  <td>{formatInr(b.payout ?? 0)}</td>
                  <td className={(b.profit || 0) >= 0 ? "text-casino-success" : "text-casino-danger"}>
                    {formatInr(b.profit || 0)}
                  </td>
                  <td>
                    <span
                      className={`casino-badge ${
                        b.result === "WIN" ? "success" : b.result === "LOSE" ? "error" : "warn"
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

        <div className="casino-actions mt-3">
          <div className="text-sm text-slate-400">
            Showing {showingFrom}-{showingTo} of {filteredBets.length}
          </div>
          <button className="casino-btn-ghost" disabled={currentPage <= 1} onClick={onPrev}>
            {"<"}
          </button>
          <span className="text-sm text-slate-200">
            Page {currentPage} / {totalPages}
          </span>
          <button className="casino-btn-ghost" disabled={currentPage >= totalPages} onClick={onNext}>
            {">"}
          </button>
        </div>
        </>
      ) : null}
    </section>
  );
}
