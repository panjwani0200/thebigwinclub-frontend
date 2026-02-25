import { useMemo, useState } from "react";
import api from "../../services/api";

const PAGE_SIZE = 20;

function paginate(rows, page) {
  const start = (page - 1) * PAGE_SIZE;
  return rows.slice(start, start + PAGE_SIZE);
}

function Pager({ total, page, setPage }) {
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="casino-actions mt-3">
      <div className="text-sm text-slate-400">Showing {from}-{to} of {total}</div>
      <button className="casino-btn-ghost" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
        {"<"}
      </button>
      <span className="text-sm text-slate-200">Page {page} / {totalPages}</span>
      <button
        className="casino-btn-ghost"
        disabled={page >= totalPages}
        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
      >
        {">"}
      </button>
    </div>
  );
}

export default function CustomerBets() {
  const [customerCode, setCustomerCode] = useState("");
  const [bets, setBets] = useState([]);
  const [matkaBets, setMatkaBets] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [resultFilter, setResultFilter] = useState("ALL");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [gamePage, setGamePage] = useState(1);
  const [matkaPage, setMatkaPage] = useState(1);

  const formatInr = (value) => `\u20B9${Number(value || 0)}`;

  const load = async () => {
    try {
      const code = customerCode.trim();
      if (!code) {
        setError("Enter customer code");
        return;
      }

      setLoading(true);
      setError("");

      const [gameRes, matkaRes] = await Promise.allSettled([
        api.get(`/api/customer/bets/${code}`),
        api.get(`/api/customer/matka-bets/${code}`),
      ]);

      const gameRows = gameRes.status === "fulfilled" ? gameRes.value.data || [] : [];
      const matkaRowsRaw =
        matkaRes.status === "fulfilled" ? matkaRes.value.data?.bets || [] : [];

      const matkaRows = matkaRowsRaw.map((b) => ({
        ...b,
        status: String(b.status || "PENDING").toUpperCase(),
        profit: Number(b.profit || 0),
      }));

      setBets(gameRows);
      setMatkaBets(matkaRows);
      setGamePage(1);
      setMatkaPage(1);

      if (gameRes.status === "rejected" && matkaRes.status === "rejected") {
        throw gameRes.reason || matkaRes.reason;
      }
    } catch (err) {
      setBets([]);
      setMatkaBets([]);
      setError(err.response?.data?.message || "Failed to load bets");
    } finally {
      setLoading(false);
    }
  };

  const filteredGameBets = useMemo(() => {
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

  const filteredMatkaBets = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    return matkaBets.filter((b) => {
      const result = String(b.status || "PENDING").toUpperCase();
      const market = String(b.marketId || "").toLowerCase();
      const number = String(b.number || "").toLowerCase();
      const type = String(b.betType || "").toLowerCase();

      const resultMatch =
        resultFilter === "ALL"
          ? true
          : resultFilter === "LOSE"
            ? result === "LOSE" || result === "LOSS"
            : result === resultFilter;

      const searchMatch = !q || market.includes(q) || number.includes(q) || type.includes(q);
      return resultMatch && searchMatch;
    });
  }, [matkaBets, searchText, resultFilter]);

  const pagedGame = paginate(filteredGameBets, gamePage);
  const pagedMatka = paginate(filteredMatkaBets, matkaPage);

  return (
    <section>
      <h2 className="casino-section-title">Customer Bets</h2>
      <p className="casino-section-sub">Load and review a single customer's game + matka history</p>

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

      {(bets.length > 0 || matkaBets.length > 0) ? (
        <div className="casino-actions mt-2">
          <input
            className="max-w-md"
            placeholder="Search game / market / number / round"
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
              setGamePage(1);
              setMatkaPage(1);
            }}
          />
          <button className={resultFilter === "ALL" ? "" : "casino-btn-ghost"} onClick={() => setResultFilter("ALL")}>All</button>
          <button className={resultFilter === "WIN" ? "" : "casino-btn-ghost"} onClick={() => setResultFilter("WIN")}>Wins</button>
          <button className={resultFilter === "LOSE" ? "" : "casino-btn-ghost"} onClick={() => setResultFilter("LOSE")}>Losses</button>
          <button className={resultFilter === "PENDING" ? "" : "casino-btn-ghost"} onClick={() => setResultFilter("PENDING")}>Pending</button>
        </div>
      ) : null}

      {error ? <div className="casino-alert error">{error}</div> : null}
      {!loading && !error && bets.length === 0 && matkaBets.length === 0 ? (
        <div className="casino-empty mt-4">No bets to display.</div>
      ) : null}

      {filteredGameBets.length > 0 ? (
        <div className="mt-4">
          <h3 className="casino-list-title">Game Bets</h3>
          <div className="casino-table-wrap mt-2">
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
                {pagedGame.map((b) => (
                  <tr key={b._id}>
                    <td>{b.gameId?.name || b.gameSlug || "Game"}</td>
                    <td>{b.roundId || "-"}</td>
                    <td>{formatInr(b.amount)}</td>
                    <td>{formatInr(b.payout ?? 0)}</td>
                    <td className={(b.profit || 0) >= 0 ? "text-casino-success" : "text-casino-danger"}>
                      {formatInr(b.profit || 0)}
                    </td>
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
          <Pager total={filteredGameBets.length} page={gamePage} setPage={setGamePage} />
        </div>
      ) : null}

      {filteredMatkaBets.length > 0 ? (
        <div className="mt-6">
          <h3 className="casino-list-title">Matka Bets</h3>
          <div className="casino-table-wrap mt-2">
            <table>
              <thead>
                <tr>
                  <th>Market</th>
                  <th>Type</th>
                  <th>Session</th>
                  <th>Number</th>
                  <th>Amount</th>
                  <th>Profit</th>
                  <th>Result</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {pagedMatka.map((b) => (
                  <tr key={b._id}>
                    <td>{b.marketId || "-"}</td>
                    <td>{b.betType || "-"}</td>
                    <td>{b.session || "-"}</td>
                    <td>{b.number || "-"}</td>
                    <td>{formatInr(b.amount)}</td>
                    <td className={(b.profit || 0) >= 0 ? "text-casino-success" : "text-casino-danger"}>
                      {formatInr(b.profit || 0)}
                    </td>
                    <td>
                      <span className={`casino-badge ${b.status === "WIN" ? "success" : b.status === "LOSE" ? "error" : "warn"}`}>
                        {b.status}
                      </span>
                    </td>
                    <td>{b.createdAt ? new Date(b.createdAt).toLocaleString() : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pager total={filteredMatkaBets.length} page={matkaPage} setPage={setMatkaPage} />
        </div>
      ) : null}
    </section>
  );
}
