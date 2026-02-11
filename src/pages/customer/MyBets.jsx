import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";

const PAGE_SIZE = 20;

export default function MyBets() {
  const userId = localStorage.getItem("userId");
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!userId) return;

    api
      .get("/api/bet/my")
      .then((res) => setBets(res.data || []))
      .catch((err) => {
        console.error("MY BETS ERROR:", err);
        setBets([]);
      })
      .finally(() => setLoading(false));
  }, [userId]);

  const totalPages = Math.max(1, Math.ceil(bets.length / PAGE_SIZE));

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const pagedBets = useMemo(() => {
    const from = (currentPage - 1) * PAGE_SIZE;
    return bets.slice(from, from + PAGE_SIZE);
  }, [bets, currentPage]);

  const showingFrom = bets.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const showingTo = Math.min(currentPage * PAGE_SIZE, bets.length);

  if (loading) return <div className="casino-empty">Loading bets...</div>;

  return (
    <section>
      <h2 className="casino-section-title">My Bets</h2>
      <p className="casino-section-sub">Game name, bet amount and profit/loss summary</p>

      {bets.length === 0 ? (
        <div className="casino-empty mt-4">No bets placed yet.</div>
      ) : (
        <>
          <div className="casino-table-wrap mt-4">
            <table>
              <thead>
                <tr>
                  <th>Game Name</th>
                  <th>Bet Placed</th>
                  <th>Profit / Loss</th>
                </tr>
              </thead>
              <tbody>
                {pagedBets.map((bet) => {
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

          <div className="casino-actions mt-3">
            <div className="text-sm text-slate-400">
              Showing {showingFrom}-{showingTo} of {bets.length}
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
    </section>
  );
}
