import { useEffect, useMemo, useState } from "react";
import api from "../../../services/api";
import "./AndarBahar.css";
import InlineBetHistory from "../../../components/customer/InlineBetHistory";

export default function AndarBahar({ onBack }) {
  const [roundId, setRoundId] = useState(null);
  const [jokerCard, setJokerCard] = useState(null);
  const [status, setStatus] = useState("Betting Open");
  const [selected, setSelected] = useState(null); // ANDAR | BAHAR
  const [amount, setAmount] = useState(100);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);
  const [declaring, setDeclaring] = useState(false);
  const [dealt, setDealt] = useState({ andar: null, bahar: null });
  const [history, setHistory] = useState([]);

  const cardToPath = (code) => {
    if (!code) return "";
    const rank = code.slice(0, -1);
    const suit = code.slice(-1);
    const rankMap = {
      A: "ace",
      J: "jack",
      Q: "queen",
      K: "king",
    };
    const suitMap = {
      H: "hearts",
      D: "diamonds",
      C: "clubs",
      S: "spades",
    };
    const r = rankMap[rank] || rank;
    const s = suitMap[suit] || suit;
    return `/assets/cards/${r}_of_${s}.png`;
  };

  const [andarCard, baharCard] = useMemo(() => [dealt.andar, dealt.bahar], [dealt]);

  useEffect(() => {
    const start = async () => {
      try {
        const res = await api.post("/api/game/andarbahar/start");
        setRoundId(res.data.roundId);
        setJokerCard(res.data.jokerCard);
        setStatus("Betting Open");
        setResult(null);
        setDeclaring(false);
        setDealt({ andar: null, bahar: null });
      } catch {
        setStatus("Unable to start round");
      }
    };
    start();
  }, []);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await api.get("/api/game/andarbahar/history?limit=10");
        setHistory(res.data || []);
      } catch {
        setHistory([]);
      }
    };
    loadHistory();
  }, [result]);

  const placeBet = async () => {
    if (!selected) return setStatus("Select Andar or Bahar");
    if (!roundId) return setStatus("Round not ready");
    if (!Number.isFinite(Number(amount)) || Number(amount) < 50) {
      return setStatus("Minimum bet is ₹50");
    }
    try {
      setLoading(true);
      setStatus("Waiting for result...");
      await api.post("/api/game/andarbahar/bet", {
        roundId,
        side: selected,
        amount,
      });
      setPolling(true);
    } catch (err) {
      setStatus(err.response?.data?.message || "Bet failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!polling || !roundId) return;
    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/api/game/andarbahar/round/${roundId}`);
        if (res.data.status === "CLOSED") {
          setPolling(false);
          setDeclaring(true);
          setStatus("Declaring result...");

          const cards = res.data.dealtCards || [];
          const andar = cards[0] || null;
          const bahar = cards[1] || null;
          setDealt({ andar: null, bahar: null });
          setTimeout(() => setDealt((prev) => ({ ...prev, andar })), 40);
          setTimeout(() => setDealt((prev) => ({ ...prev, bahar })), 220);

          setTimeout(() => {
            setDeclaring(false);
            setResult(res.data.winner);
            setStatus(res.data.winner === "ANDAR" ? "Andar Wins" : "Bahar Wins");
          }, 1300);

          setTimeout(async () => {
            const next = await api.post("/api/game/andarbahar/start");
            setRoundId(next.data.roundId);
            setJokerCard(next.data.jokerCard);
            setStatus("Betting Open");
            setResult(null);
            setSelected(null);
            setDeclaring(false);
            setDealt({ andar: null, bahar: null });
          }, 2200);
        }
      } catch {
        // ignore
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [polling, roundId]);

  return (
    <div className="ab-shell">
      <div className="ab-stage">
        <div className="ab-topbar">
          <div className="ab-title-wrap">
            <img className="ab-logo" src="/assets/andarbahar/andarbahar-logo.png" alt="Andar Bahar" />
            <div className="ab-title">Andar Bahar Live</div>
          </div>
          <button className="ab-back" onClick={onBack}>
            Back
          </button>
        </div>

        <div className="ab-joker">
          <div className="ab-joker-label">JOKER CARD</div>
          {jokerCard && <img className="ab-joker-img" src={cardToPath(jokerCard)} alt="Joker card" />}
          <div className="ab-joker-code">{jokerCard}</div>
        </div>

        <div className="ab-status">{status}</div>

        <div className="ab-sides">
          <button
            className={`ab-side ${selected === "ANDAR" ? "is-active" : ""}`}
            onClick={() => setSelected("ANDAR")}
            disabled={loading}
          >
            <div className="ab-side-title">ANDAR</div>
            <div className="ab-odds">1.98</div>
            <div className="ab-cards">
              {andarCard ? (
                <img
                  key={`a-${andarCard}`}
                  className="ab-card"
                  style={{ "--deal-delay": "0ms" }}
                  src={cardToPath(andarCard)}
                  alt="Andar card"
                />
              ) : (
                <div className="ab-card-slot" />
              )}
            </div>
          </button>

          <button
            className={`ab-side ${selected === "BAHAR" ? "is-active" : ""}`}
            onClick={() => setSelected("BAHAR")}
            disabled={loading}
          >
            <div className="ab-side-title">BAHAR</div>
            <div className="ab-odds">1.98</div>
            <div className="ab-cards">
              {baharCard ? (
                <img
                  key={`b-${baharCard}`}
                  className="ab-card"
                  style={{ "--deal-delay": "80ms" }}
                  src={cardToPath(baharCard)}
                  alt="Bahar card"
                />
              ) : (
                <div className="ab-card-slot" />
              )}
            </div>
          </button>
        </div>

        <div className="ab-bet-panel">
          <div className="ab-bet-title">Bet Amount</div>
          <div className="ab-chips">
            {[100, 500, 1000, 5000].map((v) => (
              <button
                key={v}
                className={`ab-chip ${amount === v ? "is-active" : ""}`}
                onClick={() => setAmount(v)}
                disabled={loading}
              >
                {"\u20B9"}
                {v}
              </button>
            ))}
          </div>
          <div className="ab-custom">
            <label className="ab-custom-label">Min bet: {"\u20B9"}50</label>
            <label className="ab-custom-label">Custom Amount</label>
            <input
              className="ab-custom-input"
              type="number"
              min="50"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              disabled={loading}
            />
          </div>
          <button className="ab-bet-btn" onClick={placeBet} disabled={loading}>
            PLACE BET
          </button>
        </div>

        <div className={`ab-result ${declaring ? "is-declaring" : ""} ${result ? result.toLowerCase() : ""}`}>
          {declaring ? "DECLARING..." : result || "RESULT"}
        </div>

        <div className="ab-history">
          {history.map((h) => (
            <div
              key={h.roundId}
              className={`ab-dot ${h.winner === "ANDAR" ? "andar" : "bahar"}`}
              title={`${h.roundId} - ${h.winner}`}
            />
          ))}
        </div>

        <InlineBetHistory
          title="Previous Andar Bahar Bets"
          gameSlugs={["andar-bahar"]}
          refreshKey={`${result || ""}-${roundId || ""}`}
        />
      </div>
    </div>
  );
}
