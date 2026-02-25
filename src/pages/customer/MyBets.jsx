import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";

const PAGE_SIZE = 20;

function Pager({ total, page, setPage }) {
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="casino-actions mt-3">
      <div className="text-sm text-slate-400">
        Showing {from}-{to} of {total}
      </div>
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
  );
}

export default function MyBets() {
  const userId = localStorage.getItem("userId");

  const [normalBets, setNormalBets] = useState([]);
  const [matkaBets, setMatkaBets] = useState([]);
  const [loading, setLoading] = useState(true);

  const [normalPage, setNormalPage] = useState(1);
  const [matkaPage, setMatkaPage] = useState(1);

  useEffect(() => {
    if (!userId) return;

    Promise.allSettled([api.get("/api/bet/my"), api.get("/api/matka/bets/me")])
      .then((results) => {
        const normal = results[0].status === "fulfilled" ? results[0].value.data || [] : [];
        const matkaRaw = results[1].status === "fulfilled" ? results[1].value.data || [] : [];

        const matkaNormalized = matkaRaw.map((b) => {
          const amount = Number(b.amount || 0);
          const payout = Number(b.payout || 0);
          const status = String(b.status || "PENDING").toUpperCase();
          const profit = status === "WIN" ? payout - amount : status === "LOSE" ? -amount : 0;

          return {
            ...b,
            amount,
            payout,
            profit,
            status,
          };
        });

        setNormalBets(normal);
        setMatkaBets(matkaNormalized);
      })
      .catch(() => {
        setNormalBets([]);
        setMatkaBets([]);
      })
      .finally(() => setLoading(false));
  }, [userId]);

  const normalTotalPages = Math.max(1, Math.ceil(normalBets.length / PAGE_SIZE));
  const matkaTotalPages = Math.max(1, Math.ceil(matkaBets.length / PAGE_SIZE));

  useEffect(() => {
    if (normalPage > normalTotalPages) setNormalPage(normalTotalPages);
  }, [normalPage, normalTotalPages]);

  useEffect(() => {
    if (matkaPage > matkaTotalPages) setMatkaPage(matkaTotalPages);
  }, [matkaPage, matkaTotalPages]);

  const pagedNormal = useMemo(() => {
    const from = (normalPage - 1) * PAGE_SIZE;
    return normalBets.slice(from, from + PAGE_SIZE);
  }, [normalBets, normalPage]);

  const pagedMatka = useMemo(() => {
    const from = (matkaPage - 1) * PAGE_SIZE;
    return matkaBets.slice(from, from + PAGE_SIZE);
  }, [matkaBets, matkaPage]);

  if (loading) return <div className="casino-empty">Loading bets...</div>;

  return (
    <section>
      <h2 className="casino-section-title">My Bets</h2>
      <p className="casino-section-sub">Track your game and matka betting outcomes</p>

      <div className="mt-4">
        <h3 className="casino-list-title">Game Bets</h3>
        {normalBets.length === 0 ? (
          <div className="casino-empty mt-2">No game bets placed yet.</div>
        ) : (
          <>
            <div className="casino-table-wrap mt-2">
              <table>
                <thead>
                  <tr>
                    <th>Game Name</th>
                    <th>Bet Placed</th>
                    <th>Profit / Loss</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedNormal.map((bet) => {
                    const profit = Number(bet.profit || 0);
                    return (
                      <tr key={bet._id}>
                        <td>{bet.gameId?.name || bet.gameSlug || "Game"}</td>
                        <td>{`\u20B9${Number(bet.amount || 0)}`}</td>
                        <td className={profit >= 0 ? "text-casino-success" : "text-casino-danger"}>
                          {`\u20B9${profit}`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pager total={normalBets.length} page={normalPage} setPage={setNormalPage} />
          </>
        )}
      </div>

      <div className="mt-6">
        <h3 className="casino-list-title">Matka Bets</h3>
        {matkaBets.length === 0 ? (
          <div className="casino-empty mt-2">No matka bets placed yet.</div>
        ) : (
          <>
            <div className="casino-table-wrap mt-2">
              <table>
                <thead>
                  <tr>
                    <th>Market</th>
                    <th>Type</th>
                    <th>Session</th>
                    <th>Number</th>
                    <th>Amount</th>
                    <th>Profit / Loss</th>
                    <th>Result</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedMatka.map((bet) => (
                    <tr key={bet._id}>
                      <td>{bet.marketId || "-"}</td>
                      <td>{bet.betType || "-"}</td>
                      <td>{bet.session || "-"}</td>
                      <td>{bet.number || "-"}</td>
                      <td>{`\u20B9${Number(bet.amount || 0)}`}</td>
                      <td className={(bet.profit || 0) >= 0 ? "text-casino-success" : "text-casino-danger"}>
                        {`\u20B9${Number(bet.profit || 0)}`}
                      </td>
                      <td>
                        <span
                          className={`casino-badge ${
                            bet.status === "WIN" ? "success" : bet.status === "LOSE" ? "error" : "warn"
                          }`}
                        >
                          {bet.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pager total={matkaBets.length} page={matkaPage} setPage={setMatkaPage} />
          </>
        )}
      </div>
    </section>
  );
}
