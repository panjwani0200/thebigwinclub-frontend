import { useEffect, useState } from "react";
import api from "../../services/api";

const PAGE_SIZE = 20;

export default function CustomerBets() {
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [resultFilter, setResultFilter] = useState("ALL");
  const [searchText, setSearchText] = useState("");
  const [singleCustomer, setSingleCustomer] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await api.get("/api/bet/all");
        setBets(res.data || []);
      } catch (err) {
        console.error("ADMIN CUSTOMER BETS ERROR:", err);
        setError(err.response?.data?.message || "Failed to load bets");
        setBets([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [resultFilter, searchText, singleCustomer]);

  const filteredBets = bets.filter((b) => {
    const result = (b.result || "PENDING").toUpperCase();
    const customerName = (b.userId?.name || b.userId?.email || "").toLowerCase();
    const customerCode = (b.userId?.userCode || "").toLowerCase();
    const customerId = String(b.userId?._id || "").toLowerCase();
    const gameName = (b.gameId?.name || b.gameSlug || "").toLowerCase();
    const q = searchText.trim().toLowerCase();
    const exact = singleCustomer.trim().toLowerCase();

    const resultMatch =
      resultFilter === "ALL"
        ? true
        : resultFilter === "LOSE"
          ? result === "LOSE" || result === "LOSS"
          : result === resultFilter;
    const searchMatch =
      !q || customerName.includes(q) || customerCode.includes(q) || gameName.includes(q);
    const singleCustomerMatch =
      !exact ||
      customerCode === exact ||
      customerId === exact ||
      customerName.includes(exact);

    return resultMatch && searchMatch && singleCustomerMatch;
  });

  const totalBets = filteredBets.length;
  const totalAmount = filteredBets.reduce((sum, b) => sum + Number(b.amount || 0), 0);
  const totalPayout = filteredBets.reduce((sum, b) => sum + Number(b.payout || 0), 0);
  const totalProfit = filteredBets.reduce((sum, b) => sum + Number(b.profit || 0), 0);

  const totalPages = Math.max(1, Math.ceil(filteredBets.length / PAGE_SIZE));
  const pageStartIndex = (currentPage - 1) * PAGE_SIZE;
  const pageEndIndex = pageStartIndex + PAGE_SIZE;
  const pagedBets = filteredBets.slice(pageStartIndex, pageEndIndex);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const formatInr = (value) => `\u20B9${Number(value || 0)}`;
  const showingFrom = filteredBets.length === 0 ? 0 : pageStartIndex + 1;
  const showingTo = Math.min(pageEndIndex, filteredBets.length);

  return (
    <section>
      <h2 className="casino-section-title">Customer Bets</h2>
      <p className="casino-section-sub">
        Web-style global bet report across customers and games
      </p>

      {loading ? <div className="casino-empty mt-4">Loading bets...</div> : null}
      {error ? <div className="casino-alert error">{error}</div> : null}

      {!loading && !error && bets.length === 0 ? (
        <div className="casino-empty mt-4">No bets found.</div>
      ) : null}

      {!loading && bets.length > 0 ? (
        <div className="mt-4 space-y-4">
          <div className="casino-grid-auto">
            <article className="casino-kpi">
              <div className="casino-kpi-label">Filtered Bets</div>
              <div className="casino-kpi-value">{totalBets}</div>
            </article>
            <article className="casino-kpi">
              <div className="casino-kpi-label">Total Amount</div>
              <div className="casino-kpi-value">{formatInr(totalAmount)}</div>
            </article>
            <article className="casino-kpi">
              <div className="casino-kpi-label">Total Payout</div>
              <div className="casino-kpi-value">{formatInr(totalPayout)}</div>
            </article>
            <article className="casino-kpi">
              <div className="casino-kpi-label">Net Profit</div>
              <div
                className={`casino-kpi-value ${
                  totalProfit >= 0 ? "text-casino-success" : "text-casino-danger"
                }`}
              >
                {formatInr(totalProfit)}
              </div>
            </article>
          </div>

          <div className="casino-actions">
            <input
              className="max-w-xs"
              placeholder="Single customer (code or user id)"
              value={singleCustomer}
              onChange={(e) => setSingleCustomer(e.target.value)}
            />
            <input
              className="max-w-md"
              placeholder="Search customer name, code, or game"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <button
              className={resultFilter === "ALL" ? "" : "casino-btn-ghost"}
              onClick={() => setResultFilter("ALL")}
            >
              All
            </button>
            <button
              className={resultFilter === "WIN" ? "" : "casino-btn-ghost"}
              onClick={() => setResultFilter("WIN")}
            >
              Wins
            </button>
            <button
              className={resultFilter === "LOSE" ? "" : "casino-btn-ghost"}
              onClick={() => setResultFilter("LOSE")}
            >
              Losses
            </button>
            <button
              className={resultFilter === "PENDING" ? "" : "casino-btn-ghost"}
              onClick={() => setResultFilter("PENDING")}
            >
              Pending
            </button>
          </div>

          {filteredBets.length === 0 ? (
            <div className="casino-empty">No bets found for selected filters.</div>
          ) : (
            <>
              <div className="casino-table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Customer</th>
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
                        <td>
                          {b.userId?.name || b.userId?.email || "Unknown"}
                          <div className="text-xs text-slate-400">{b.userId?.userCode || "-"}</div>
                        </td>
                        <td>{b.gameId?.name || b.gameSlug || "Game"}</td>
                        <td>{b.roundId || "-"}</td>
                        <td>{formatInr(b.amount)}</td>
                        <td>{formatInr(b.payout)}</td>
                        <td className={(b.profit || 0) >= 0 ? "text-casino-success" : "text-casino-danger"}>
                          {formatInr(b.profit)}
                        </td>
                        <td>
                          <span
                            className={`casino-badge ${
                              b.result === "WIN"
                                ? "success"
                                : b.result === "LOSE"
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

              <div className="casino-actions">
                <div className="text-sm text-slate-400">
                  Showing {showingFrom}-{showingTo} of {filteredBets.length}
                </div>
                <button
                  className="casino-btn-ghost"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  {"<"}
                </button>
                <span className="text-sm text-slate-200">
                  Page {currentPage} / {totalPages}
                </span>
                <button
                  className="casino-btn-ghost"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                >
                  {">"}
                </button>
              </div>
            </>
          )}
        </div>
      ) : null}
    </section>
  );
}
