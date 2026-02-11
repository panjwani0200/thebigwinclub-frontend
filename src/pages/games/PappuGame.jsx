import { useEffect, useState } from "react";
import api from "../../services/api";
import { PAPPU_SYMBOLS } from "../../data/pappuSymbols";
import ScratchCard from "../../components/ScratchCard";
import "./PappuGame.css";

export default function PappuPlayingPictures({ onBack }) {
  const [selected, setSelected] = useState(null);
  const [amount, setAmount] = useState("");
  const [roundId, setRoundId] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [roundLocked, setRoundLocked] = useState(false);
  const [lastResults, setLastResults] = useState([]);

  // 🔹 Fetch last 10 results
  const fetchLastResults = async () => {
    try {
      const res = await api.get("/api/game/pappu/last-results");
      setLastResults(res.data || []);
    } catch (e) {}
  };

  useEffect(() => {
    fetchLastResults();
  }, []);

  // 🔹 Start New Round
  const startGame = async () => {
    try {
      setLoading(true);

      // Reset state
      setSelected(null);
      setAmount("");
      setResult(null);
      setRoundLocked(false);
      setRoundId(null);

      const res = await api.post("/api/game/pappu/start");
      setRoundId(res.data.roundId);
    } catch (err) {
      alert("Failed to start game");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Place Bet (Locks round)
  const placeBet = async () => {
    if (!roundId) return alert("Start game first");
    if (!selected) return alert("Select one option");
    if (!amount || Number(amount) <= 0) return alert("Enter valid amount");

    try {
      setLoading(true);
      setRoundLocked(true);

      const res = await api.post("/api/bet/place", {
        roundId,
        symbol: selected,
        amount: Number(amount),
      });

      setResult(res.data.result); // WIN / LOSS
      fetchLastResults(); // 🔥 refresh strip
    } catch (err) {
      setRoundLocked(false);
      alert(err.response?.data?.message || "Bet failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pappu-container">
      <h2>Pappu Playing Pictures</h2>

      {/* LAST RESULTS STRIP */}
      <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 10 }}>
        {lastResults.map((r, i) => (
          <div key={i} className="card" style={{ padding: 6, fontSize: 12 }}>
            {r.resultSymbol}
          </div>
        ))}
      </div>

      {/* SYMBOL GRID */}
      <div className="grid">
        {PAPPU_SYMBOLS.map((s) => (
          <div
            key={s.key}
            className={`card ${selected === s.key ? "active" : ""}`}
            onClick={() => !roundLocked && setSelected(s.key)}
            style={{
              pointerEvents: roundLocked ? "none" : "auto",
              opacity: roundLocked ? 0.5 : 1,
            }}
          >
            {s.label}
          </div>
        ))}
      </div>

      {/* CHIP BUTTONS */}
      <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 10 }}>
        {[10, 50, 100, 500].map((chip) => (
          <button
            key={chip}
            onClick={() => setAmount(chip)}
            disabled={roundLocked || loading}
          >
            ₹{chip}
          </button>
        ))}
      </div>

      {/* BET INPUT */}
      <input
        type="number"
        placeholder="Bet Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        disabled={roundLocked || loading}
      />

      {/* ACTION BUTTONS */}
      <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
        <button onClick={startGame} disabled={loading}>
          Start
        </button>

        <button
          onClick={placeBet}
          disabled={loading || roundLocked || !roundId}
        >
          Bet
        </button>
      </div>

      {/* SCRATCH CARD + NEXT ROUND */}
      {result && (
        <>
          <ScratchCard result={result} onReveal={() => {}} />

          <button style={{ marginTop: 15 }} onClick={startGame}>
            Next Round
          </button>
        </>
      )}
    </div>
  );
}

  return (
    <div style={{ color: "white" }}>
      {onBack && <button onClick={onBack}>⬅ Back</button>}
      <h2>Pappu Playing Pictures</h2>
    </div>
  );
