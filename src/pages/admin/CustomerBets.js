import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";

const PAGE_SIZE = 20;

const formatInr = (value) => `\u20B9${Number(value || 0)}`;

function Pager({ total, page, setPage }) {
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="casino-actions">
      <div className="text-sm text-slate-400">Showing {from}-{to} of {total}</div>
      <button className="casino-btn-ghost" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
        {"<"}
      </button>
      <span className="text-sm text-slate-200">Page {page} / {totalPages}</span>
      <button className="casino-btn-ghost" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
        {">"}
      </button>
    </div>
  );
}

export default function CustomerBets() {
  const [gameBets, setGameBets] = useState([]);
  const [matkaBets, setMatkaBets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [resultFilter, setResultFilter] = useState("ALL");
  const [searchText, setSearchText] = useState("");
  const [singleCustomer, setSingleCustomer] = useState("");

  const [gamePage, setGamePage] = useState(1);
  const [matkaPage, setMatkaPage] = useState(1);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const [gameRes, matkaRes] = await Promise.allSettled([
          api.get("/api/bet/all"),
          api.get("/api/admin/matka/bets?limit=1000"),
        ]);

        const gRows = gameRes.status === "fulfilled" ? gameRes.value.data || [] : [];
        const mRows = matkaRes.status === "fulfilled" ? matkaRes.value.data || [] : [];

        setGameBets(gRows);
        setMatkaBets(mRows);

        if (gameRes.status === "rejected" && matkaRes.status === "rejected") {
          throw gameRes.reason || matkaRes.reason;
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load bets");
        setGameBets([]);
        setMatkaBets([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  useEffect(() => {
    setGamePage(1);
    setMatkaPage(1);
  }, [resultFilter, searchText, singleCustomer]);

  const q = searchText.trim().toLowerCase();
  const exact = singleCustomer.trim().toLowerCase();

  const gameFiltered = useMemo(() => {
    return gameBets.filter((b) => {
      const result = String(b.result || "PENDING").toUpperCase();
      const customerName = String(b.userId?.name || b.userId?.email || "").toLowerCase();
      const customerCode = String(b.userId?.userCode || "").toLowerCase();
      const customerId = String(b.userId?._id || "").toLowerCase();
      const gameName = String(b.gameId?.name || b.gameSlug || "").toLowerCase();

      const resultMatch =
        resultFilter === "ALL"
          ? true
          : resultFilter === "LOSE"
            ? result === "LOSE" || result === "LOSS"
            : result === resultFilter;

      const searchMatch = !q || customerName.includes(q) || customerCode.includes(q) || gameName.includes(q);
      const customerMatch = !exact || customerCode === exact || customerId === exact || customerName.includes(exact);

      return resultMatch && searchMatch && customerMatch;
    });
  }, [gameBets, q, exact, resultFilter]);

  const matkaFiltered = useMemo(() => {
    return matkaBets.filter((b) => {
      const result = String(b.status || "PENDING").toUpperCase();
      const customerName = String(b.userId?.name || b.userId?.email || "").toLowerCase();
      const customerCode = String(b.userId?.userCode || "").toLowerCase();
      const customerId = String(b.userId?._id || "").toLowerCase();
      const market = String(b.marketId || "").toLowerCase();
      const number = String(b.number || "").toLowerCase();

      const resultMatch =
        resultFilter === "ALL"
          ? true
          : resultFilter === "LOSE"
            ? result === "LOSE" || result === "LOSS"
            : result === resultFilter;

      const searchMatch = !q || customerName.includes(q) || customerCode.includes(q) || market.includes(q) || number.includes(q);
      const customerMatch = !exact || customerCode === exact || customerId === exact || customerName.includes(exact);

      return resultMatch && searchMatch && customerMatch;
    });
  }, [matkaBets, q, exact, resultFilter]);

  const gameStats = useMemo(() => ({
    total: gameFiltered.length,
    amount: gameFiltered.reduce((sum, b) => sum + Number(b.amount || 0), 0),
    payout: gameFiltered.reduce((sum, b) => sum + Number(b.payout || 0), 0),
    profit: gameFiltered.reduce((sum, b) => sum + Number(b.profit || 0), 0),
  }), [gameFiltered]);

  const matkaStats = useMemo(() => ({
    total: matkaFiltered.length,
    amount: matkaFiltered.reduce((sum, b) => sum + Number(b.amount || 0), 0),
    payout: matkaFiltered.reduce((sum, b) => sum + Number(b.payout || 0), 0),
    profit: matkaFiltered.reduce((sum, b) => sum + Number(b.profit || 0), 0),
  }), [matkaFiltered]);

  const gamePageRows = gameFiltered.slice((gamePage - 1) * PAGE_SIZE, gamePage * PAGE_SIZE);
  const matkaPageRows = matkaFiltered.slice((matkaPage - 1) * PAGE_SIZE, matkaPage * PAGE_SIZE);

  return (
    <section>
      <h2 className="casino-section-title">Customer Bets</h2>
      <p className="casino-section-sub">Global bet report for game + matka bets</p>

      {loading ? <div className="casino-empty mt-4">Loading bets...</div> : null}
      {error ? <div className="casino-alert error">{error}</div> : null}

      {!loading && !error && gameBets.length === 0 && matkaBets.length === 0 ? (
        <div className="casino-empty mt-4">No bets found.</div>
      ) : null}

      {!loading && (gameBets.length > 0 || matkaBets.length > 0) ? (
        <div className="mt-4 space-y-4">
          <div className="casino-actions">
            <input
              className="max-w-xs"
              placeholder="Single customer (code or user id)"
              value={singleCustomer}
              onChange={(e) => setSingleCustomer(e.target.value)}
            />
            <input
              className="max-w-md"
              placeholder="Search customer / game / market / number"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <button className={resultFilter === "ALL" ? "" : "casino-btn-ghost"} onClick={() => setResultFilter("ALL")}>All</button>
            <button className={resultFilter === "WIN" ? "" : "casino-btn-ghost"} onClick={() => setResultFilter("WIN")}>Wins</button>
            <button className={resultFilter === "LOSE" ? "" : "casino-btn-ghost"} onClick={() => setResultFilter("LOSE")}>Losses</button>
            <button className={resultFilter === "PENDING" ? "" : "casino-btn-ghost"} onClick={() => setResultFilter("PENDING")}>Pending</button>
          </div>

          <div className="casino-grid-auto">
            <article className="casino-kpi">
              <div className="casino-kpi-label">Game Bets</div>
              <div className="casino-kpi-value">{gameStats.total}</div>
            </article>
            <article className="casino-kpi">
              <div className="casino-kpi-label">Matka Bets</div>
              <div className="casino-kpi-value">{matkaStats.total}</div>
            </article>
            <article className="casino-kpi">
              <div className="casino-kpi-label">Total Amount</div>
              <div className="casino-kpi-value">{formatInr(gameStats.amount + matkaStats.amount)}</div>
            </article>
            <article className="casino-kpi">
              <div className="casino-kpi-label">Net Profit</div>
              <div className={`casino-kpi-value ${(gameStats.profit + matkaStats.profit) >= 0 ? "text-casino-success" : "text-casino-danger"}`}>
                {formatInr(gameStats.profit + matkaStats.profit)}
              </div>
            </article>
          </div>

          {gameFiltered.length > 0 ? (
            <div>
              <h3 className="casino-list-title">Game Bets</h3>
              <div className="casino-table-wrap mt-2">
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
                    {gamePageRows.map((b) => (
                      <tr key={b._id}>
                        <td>
                          {b.userId?.name || b.userId?.email || "Unknown"}
                          <div className="text-xs text-slate-400">{b.userId?.userCode || "-"}</div>
                        </td>
                        <td>{b.gameId?.name || b.gameSlug || "Game"}</td>
                        <td>{b.roundId || "-"}</td>
                        <td>{formatInr(b.amount)}</td>
                        <td>{formatInr(b.payout)}</td>
                        <td className={(b.profit || 0) >= 0 ? "text-casino-success" : "text-casino-danger"}>{formatInr(b.profit)}</td>
                        <td>
                          <span className={`casino-badge ${b.result === "WIN" ? "success" : b.result === "LOSE" ? "error" : "warn"}`}>
                            {b.result || "PENDING"}
                          </span>
                        </td>
                        <td>{b.createdAt ? new Date(b.createdAt).toLocaleString() : "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pager total={gameFiltered.length} page={gamePage} setPage={setGamePage} />
            </div>
          ) : null}

          {matkaFiltered.length > 0 ? (
            <div>
              <h3 className="casino-list-title">Matka Bets</h3>
              <div className="casino-table-wrap mt-2">
                <table>
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Market</th>
                      <th>Type</th>
                      <th>Session</th>
                      <th>Number</th>
                      <th>Amount</th>
                      <th>Payout</th>
                      <th>Profit</th>
                      <th>Result</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matkaPageRows.map((b) => (
                      <tr key={b._id}>
                        <td>
                          {b.userId?.name || b.userId?.email || "Unknown"}
                          <div className="text-xs text-slate-400">{b.userId?.userCode || "-"}</div>
                        </td>
                        <td>{b.marketId || "-"}</td>
                        <td>{b.betType || "-"}</td>
                        <td>{b.session || "-"}</td>
                        <td>{b.number || "-"}</td>
                        <td>{formatInr(b.amount)}</td>
                        <td>{formatInr(b.payout)}</td>
                        <td className={(b.profit || 0) >= 0 ? "text-casino-success" : "text-casino-danger"}>{formatInr(b.profit)}</td>
                        <td>
                          <span className={`casino-badge ${b.status === "WIN" ? "success" : b.status === "LOSE" ? "error" : "warn"}`}>
                            {b.status || "PENDING"}
                          </span>
                        </td>
                        <td>{b.createdAt ? new Date(b.createdAt).toLocaleString() : "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pager total={matkaFiltered.length} page={matkaPage} setPage={setMatkaPage} />
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
