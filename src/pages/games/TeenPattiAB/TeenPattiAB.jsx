import { useEffect, useMemo, useRef, useState } from "react";
import api from "../../../services/api";
import "./TeenPattiAB.css";
import InlineBetHistory from "../../../components/customer/InlineBetHistory";
import BetOutcomePopup from "../../../components/customer/BetOutcomePopup";

export default function TeenPattiAB({ onBack }) {
  const [selectedSide, setSelectedSide] = useState(null);
  const [amount, setAmount] = useState(100);
  const [status, setStatus] = useState("Place your bet");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [roundId, setRoundId] = useState(null);
  const [polling, setPolling] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [aCards, setACards] = useState([0, 1, 2]);
  const [bCards, setBCards] = useState([3, 4, 5]);
  const [betSnapshot, setBetSnapshot] = useState(null);
  const [betPlacedAt, setBetPlacedAt] = useState(null);
  const [outcomePopup, setOutcomePopup] = useState({
    open: false,
    result: null,
    amount: 0,
    payout: 0,
  });
  const roundResolvedRef = useRef(false);
  const isMobile =
    typeof window !== "undefined" && window.matchMedia("(max-width: 720px)").matches;

  const cardPool = useMemo(
    () => [
      "/assets/teenpatti/a1.png",
      "/assets/teenpatti/a2.png",
      "/assets/teenpatti/a3.png",
      "/assets/teenpatti/b1.png",
      "/assets/teenpatti/b2.png",
      "/assets/teenpatti/b3.png",
    ],
    []
  );

  useEffect(() => {
    const start = async () => {
      try {
        const res = await api.post("/api/game/teenpatti-ab/start");
        setRoundId(res.data.roundId);
      } catch {
        setStatus("Unable to start round");
      }
    };
    start();
  }, []);

  const placeBet = async () => {
    if (!selectedSide) {
      setStatus("Select Player A or Player B");
      return;
    }
    if (!roundId) {
      setStatus("Round not ready. Try again.");
      return;
    }
    if (!Number.isFinite(Number(amount)) || Number(amount) < 20) {
      setStatus("Minimum bet is ₹20");
      return;
    }

    try {
      setLoading(true);
      setResult(null);
      setStatus("Waiting for result...");
      setSpinning(true);
      setBetPlacedAt(Date.now());
      roundResolvedRef.current = false;

      await api.post("/api/game/teenpatti-ab/bet", {
        roundId,
        side: selectedSide,
        amount,
      });

      setBetSnapshot({ side: selectedSide, amount: Number(amount) });
      setPolling(true);
    } catch (err) {
      setStatus(err.response?.data?.message || "Bet failed");
    } finally {
      setLoading(false);
    }
  };

  const nextRound = () => {
    roundResolvedRef.current = false;
    setSelectedSide(null);
    setResult(null);
    setStatus("Place your bet");
    setPolling(false);
    setRoundId(null);
    setBetSnapshot(null);
    setBetPlacedAt(null);
    api.post("/api/game/teenpatti-ab/start").then((res) => {
      setRoundId(res.data.roundId);
    });
  };

  useEffect(() => {
    if (!polling || !roundId) return;
    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/api/game/teenpatti-ab/round/${roundId}`);
        if (res.data.status === "CLOSED" && !roundResolvedRef.current) {
          roundResolvedRef.current = true;
          const betSide = betSnapshot?.side || selectedSide;
          const betAmount = Number(betSnapshot?.amount || amount);
          const win = res.data.winner === betSide;
          const gameResult = win ? "WIN" : "LOSE";
          const payout = win ? Number((betAmount * 1.98).toFixed(2)) : 0;

          const elapsed = betPlacedAt ? Date.now() - betPlacedAt : 0;
          const minAnimationMs = 3200;
          const maxAnimationMs = 4000;
          const pendingMinDelay = Math.max(0, minAnimationMs - elapsed);
          const boundedDelay = Math.min(
            pendingMinDelay,
            Math.max(0, maxAnimationMs - elapsed)
          );

          setPolling(false);
          setAnimating(true);
          setTimeout(() => {
            setResult(gameResult);
            setStatus(gameResult === "WIN" ? "You Won" : "You Lost");
            setOutcomePopup({
              open: true,
              result: gameResult,
              amount: betAmount,
              payout,
            });
            setSpinning(false);
            setAnimating(false);
          }, boundedDelay);

          setTimeout(() => nextRound(), boundedDelay + 2200);
        }
      } catch {
        // ignore
      }
    }, 300);
    return () => clearInterval(interval);
  }, [polling, roundId, selectedSide, amount, betSnapshot, betPlacedAt]);

  useEffect(() => {
    if (!spinning) return;
    const spinInterval = setInterval(() => {
      setACards((prev) => prev.map((i) => (i + 1) % cardPool.length));
      setBCards((prev) => prev.map((i) => (i + 2) % cardPool.length));
    }, isMobile ? 160 : 120);
    return () => clearInterval(spinInterval);
  }, [spinning, cardPool.length, isMobile]);

  return (
    <div className="tp-shell">
      <div className="tp-stage">
        <div className="tp-topbar">
          <div className="tp-title-wrap">
            <img
              className="tp-logo"
              src="/assets/teenpatti/teenpatti-logo.png"
              alt="20-20 Live Teen Patti"
            />
            <div className="tp-title">20-20 Live Teen Patti</div>
          </div>
          <button className="tp-back" onClick={onBack}>
            Back
          </button>
        </div>

        <div className="tp-status">{status}</div>

        <div className="tp-players">
          <button
            className={`tp-player ${selectedSide === "A" ? "is-active" : ""}`}
            onClick={() => setSelectedSide("A")}
            disabled={loading}
          >
            <div className="tp-player-label">Player A</div>
            <div className="tp-cards">
              {aCards.map((idx, i) => (
                <img
                  key={`a-${i}`}
                  className={`tp-card-img ${spinning ? "is-spinning" : ""}`}
                  src={cardPool[idx]}
                  alt={`Player A card ${i + 1}`}
                />
              ))}
            </div>
          </button>

          <div className="tp-vs">VS</div>

          <button
            className={`tp-player ${selectedSide === "B" ? "is-active" : ""}`}
            onClick={() => setSelectedSide("B")}
            disabled={loading}
          >
            <div className="tp-player-label">Player B</div>
            <div className="tp-cards">
              {bCards.map((idx, i) => (
                <img
                  key={`b-${i}`}
                  className={`tp-card-img ${spinning ? "is-spinning" : ""}`}
                  src={cardPool[idx]}
                  alt={`Player B card ${i + 1}`}
                />
              ))}
            </div>
          </button>
        </div>

        <div className="tp-bet-panel">
          <div className="tp-bet-title">Bet Amount</div>
          <div className="tp-chips">
            {[20, 100, 500, 1000, 5000].map((v) => (
              <button
                key={v}
                className={`tp-chip ${amount === v ? "is-active" : ""}`}
                onClick={() => setAmount(v)}
                disabled={loading}
              >
                ₹{v}
              </button>
            ))}
          </div>
          <div className="tp-custom">
            <label className="tp-custom-label">Min bet: ₹20</label>
            <label className="tp-custom-label">Custom Amount</label>
            <input
              className="tp-custom-input"
              type="number"
              min="20"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              disabled={loading}
            />
          </div>
          <button className="tp-bet-btn" onClick={placeBet} disabled={loading}>
            PLACE BET
          </button>
        </div>

        <div
          className={`tp-result ${result ? result.toLowerCase() : ""} ${
            animating ? "is-animating" : ""
          }`}
        >
          {result || "RESULT"}
        </div>

        <button className="tp-next" onClick={nextRound} disabled={loading}>
          New Round
        </button>

        {result ? (
          <InlineBetHistory
            title="Previous Teen Patti Bets"
            gameSlugs={["teen-patti-ab"]}
            refreshKey={`${result || ""}-${roundId || ""}`}
            resultAsDots
          />
        ) : null}
      </div>
      <BetOutcomePopup
        open={outcomePopup.open}
        result={outcomePopup.result}
        amount={outcomePopup.amount}
        payout={outcomePopup.payout}
        gameName="20-20 Live Teen Patti"
        onClose={() => setOutcomePopup((prev) => ({ ...prev, open: false }))}
      />
    </div>
  );
}

