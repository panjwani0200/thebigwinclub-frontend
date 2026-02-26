import { useEffect, useRef, useState } from "react";
import api from "../../../services/api";
import "./PappuPlayingPictures.css";
import { PAPPU_SYMBOLS } from "../../../data/pappuSymbols";
import InlineBetHistory from "../../../components/customer/InlineBetHistory";
import BetOutcomePopup from "../../../components/customer/BetOutcomePopup";

const DISPLAY_ORDER = [
  "football",
  "kabutar",
  "umbrella",
  "coin",
  "diya",
  "rose",
  "star",
  "cow",
  "joker",
  "butterfly",
  "rabbit",
  "bucket",
];

export default function PappuPlayingPictures({ onBack }) {
  const [betMap, setBetMap] = useState({});
  const [amount, setAmount] = useState(20);
  const [roundId, setRoundId] = useState(null);
  const [status, setStatus] = useState("Select a picture to begin.");
  const [result, setResult] = useState(null);
  const [pendingResult, setPendingResult] = useState(null);
  const [resultSymbol, setResultSymbol] = useState(null);
  const [scratchActive, setScratchActive] = useState(false);
  const [autoReveal, setAutoReveal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pendingPayout, setPendingPayout] = useState(0);
  const [pendingStake, setPendingStake] = useState(0);
  const [outcomePopup, setOutcomePopup] = useState({
    open: false,
    result: null,
    amount: 0,
    payout: 0,
  });
  const { playScratch, playWin, playLose } = useScratchSounds();

  const symbolsByKey = PAPPU_SYMBOLS.reduce((acc, symbol) => {
    acc[symbol.key] = symbol;
    return acc;
  }, {});
  const orderedSymbols = DISPLAY_ORDER.map((key) => symbolsByKey[key]).filter(Boolean);
  const selectedKeys = Object.keys(betMap).filter((key) => Number(betMap[key]) > 0);
  const totalUnits = selectedKeys.reduce((sum, key) => sum + Number(betMap[key] || 0), 0);
  const totalStake = totalUnits * Number(amount || 0);

  const startRound = async () => {
    try {
      setLoading(true);
      setBetMap({});
      setResult(null);
      setResultSymbol(null);
      setRoundId(null);
      setStatus("Round started. Tap pictures to place chips.");

      const res = await api.post("/api/game/pappu/start");
      setRoundId(res.data.roundId);
    } catch (err) {
      console.error("PAPPU START ERROR:", err);
      setStatus("Could not start the round. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const placeBet = async () => {
    if (!roundId) return setStatus("Click Play to start a round.");
    if (!selectedKeys.length) return setStatus("Select at least one picture to bet.");
    if (!Number.isFinite(Number(amount)) || Number(amount) < 20) {
      return setStatus("Minimum bet is ₹20.");
    }

    try {
      setLoading(true);
      setStatus("Revealing result...");

      const res = await api.post("/api/bet/place", {
        roundId,
        betMap,
        amount: Number(amount),
      });

      const gameResult = res.data.result;
      setPendingResult(gameResult);
      setResultSymbol(res.data.winningSymbol || null);
      setPendingPayout(Number(res.data.payout || 0));
      setPendingStake(Number(res.data.totalBet || totalStake));
      setScratchActive(true);
      setAutoReveal(true);
    } catch (err) {
      setStatus(err.response?.data?.message || "Bet failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleScratchComplete = () => {
    if (!pendingResult) return;
    setScratchActive(false);
    setResult(pendingResult);
    setStatus(pendingResult === "WIN" ? "You won. Nice play." : "Try again.");
    setOutcomePopup({
      open: true,
      result: pendingResult,
      amount: Number(pendingStake || totalStake),
      payout: Number(pendingPayout || 0),
    });
    if (pendingResult === "WIN") playWin();
    else playLose();

    setPendingResult(null);
    setPendingPayout(0);
    setPendingStake(0);
    setAutoReveal(false);
    setBetMap({});

    setTimeout(async () => {
      try {
        const res = await api.post("/api/game/pappu/start");
        setRoundId(res.data.roundId);
        setStatus("New round started. Tap pictures to place chips.");
      } catch (err) {
        console.error("PAPPU NEXT ROUND ERROR:", err);
        setRoundId(null);
        setStatus("Could not start next round. Press Play.");
      }
    }, 250);
  };

  const revealed = PAPPU_SYMBOLS.find((s) => s.key === resultSymbol);

  return (
    <div className="ppx-shell">
      <div className="ppx-stage">
        <div className="ppx-topbar">
          <div className="ppx-brand">
            <img
              className="ppx-logo-img"
              src="/assets/pappu/pappu-logo.webp"
              alt="Pappu Playing Pictures"
            />
            <div>
              <div className="ppx-title">Pappu Playing Pictures</div>
              <div className="ppx-subtitle">Trusted play • Fast rounds</div>
            </div>
          </div>
          {onBack && (
            <button className="ppx-back" onClick={onBack}>
              Back to games
            </button>
          )}
        </div>

        <div className="ppx-grid-wrap">
          <div className="ppx-board">
            <div className="ppx-status">
              <div className="ppx-status-text">{status}</div>
              <div className="ppx-status-indicator" aria-hidden />
            </div>

            <div className="ppx-grid">
              {orderedSymbols.map((s) => (
                <button
                  key={s.key}
                  className={`ppx-tile ${Number(betMap[s.key] || 0) > 0 ? "is-active" : ""}`}
                  onClick={() => {
                    if (loading) return;
                    setBetMap((prev) => {
                      const hasKey = Number(prev[s.key] || 0) > 0;
                      const uniqueCount = Object.keys(prev).filter((k) => Number(prev[k] || 0) > 0).length;
                      if (!hasKey && uniqueCount >= 5) return prev;
                      return { ...prev, [s.key]: Number(prev[s.key] || 0) + 1 };
                    });
                  }}
                  disabled={loading}
                >
                  {Number(betMap[s.key] || 0) > 0 && (
                    <div className="ppx-chip-badge">₹{Number(betMap[s.key]) * Number(amount || 0)}</div>
                  )}

                  <div className="ppx-tile-inner">
                    <img src={s.src} alt={s.label} className="ppx-tile-img" />
                    <div className="ppx-tile-label">{s.label}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="ppx-panel">
            <div className="ppx-reveal-area ppx-reveal-area--compact">
              <div className={`ppx-reveal-banner ${result ? result.toLowerCase() : ""}`}>
                {result ? (result === "WIN" ? "YOU WON" : "YOU LOST") : "RESULT"}
              </div>
              <div className="ppx-reveal-card">
                {resultSymbol && (
                  <>
                    <img src={revealed?.src} alt="Declared result" className="ppx-reveal-img" />
                    <div className="ppx-reveal-label">{revealed?.label || resultSymbol}</div>
                  </>
                )}
                {scratchActive && (
                  <ScratchCanvas
                    onScratch={playScratch}
                    onComplete={handleScratchComplete}
                    autoReveal={autoReveal}
                  />
                )}
                {scratchActive && <div className="ppx-scratch-hint">Revealing...</div>}
              </div>
            </div>

            <div className="ppx-card">
              <div className="ppx-card-title">Bet Amount</div>
              <div className="ppx-chips">
                {[20, 50, 100, 500, 1000].map((v) => (
                  <button
                    key={v}
                    className={`ppx-chip ${amount === v ? "is-active" : ""}`}
                    onClick={() => setAmount(v)}
                    disabled={loading}
                  >
                    ₹{v}
                  </button>
                ))}
              </div>
              <div className="ppx-custom">
                <label className="ppx-custom-label">Min bet: ₹20</label>
                <label className="ppx-custom-label">Selected icons: {selectedKeys.length}/5</label>
                <label className="ppx-custom-label">Total units: {totalUnits}</label>
                <label className="ppx-custom-label">Total bet: ₹{totalStake}</label>
                <label className="ppx-custom-label">Custom Amount</label>
                <input
                  className="ppx-custom-input"
                  type="number"
                  min="20"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="ppx-card">
              <div className="ppx-actions ppx-actions--three">
                <button className="ppx-btn ppx-btn-primary" onClick={startRound} disabled={loading}>
                  Play
                </button>
                <button
                  className="ppx-btn ppx-btn-accent"
                  onClick={placeBet}
                  disabled={loading || !roundId || !totalUnits}
                >
                  Bet
                </button>
                <button
                  className="ppx-btn ppx-btn-clear"
                  onClick={() => setBetMap({})}
                  disabled={loading || !totalUnits}
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="ppx-card ppx-card-mini">
              <div className="ppx-mini">
                <div className="ppx-mini-title">Quick Tips</div>
                <div className="ppx-mini-text">
                  Tap any icon multiple times to add chips. Total deduction is unit amount × total chips.
                </div>
              </div>
            </div>
          </div>
        </div>

        {result ? (
          <InlineBetHistory
            title="Previous Pappu Bets"
            gameSlugs={["pappu-playing-pictures"]}
            refreshKey={`${result || ""}-${roundId || ""}`}
            limit={60}
            perPage={6}
            enablePagination
            compact
          />
        ) : null}

        <div className="ppx-footer">
          Play responsibly. 18+ only. This is a UI mock for a premium gaming feel.
        </div>
      </div>

      <BetOutcomePopup
        open={outcomePopup.open}
        result={outcomePopup.result}
        amount={outcomePopup.amount}
        payout={outcomePopup.payout}
        gameName="Pappu Playing Pictures"
        onClose={() => setOutcomePopup((prev) => ({ ...prev, open: false }))}
      />
    </div>
  );
}

function ScratchCanvas({ onScratch, onComplete, autoReveal }) {
  const canvasRef = useRef(null);

  const getCanvas = () => canvasRef.current;
  const setCanvas = (el) => {
    canvasRef.current = el;
    if (el) initCanvas(el);
  };

  const initCanvas = (canvas) => {
    const ctx = canvas.getContext("2d");
    const { width, height } = canvas.getBoundingClientRect();
    canvas.width = Math.floor(width);
    canvas.height = Math.floor(height);
    ctx.fillStyle = "#0b1220";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = "destination-out";
  };

  const scratchAt = (canvas, x, y) => {
    const ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.arc(x, y, 28, 0, Math.PI * 2);
    ctx.fill();
  };

  const checkCompletion = (canvas) => {
    const ctx = canvas.getContext("2d");
    const { width, height } = canvas;
    const imageData = ctx.getImageData(0, 0, width, height);
    let transparent = 0;
    for (let i = 3; i < imageData.data.length; i += 4) {
      if (imageData.data[i] === 0) transparent++;
    }
    const ratio = transparent / (imageData.data.length / 4);
    if (ratio > 0.18) onComplete();
  };

  const autoScratch = (canvas) => {
    const { width, height } = canvas;
    const cols = 8;
    const rows = 4;
    let i = 0;
    const total = cols * rows;
    const stepX = width / cols;
    const stepY = height / rows;
    const timer = setInterval(() => {
      const cx = (i % cols) * stepX + stepX / 2;
      const cy = Math.floor(i / cols) * stepY + stepY / 2;
      scratchAt(canvas, cx, cy);
      onScratch();
      i += 1;
      if (i >= total) {
        clearInterval(timer);
        checkCompletion(canvas);
        onComplete();
      }
    }, 35);
  };

  useEffect(() => {
    const canvas = getCanvas();
    if (autoReveal && canvas) {
      autoScratch(canvas);
    }
  }, [autoReveal]);

  return <canvas ref={setCanvas} className="ppx-scratch" aria-hidden />;
}

function useScratchSounds() {
  const getCtx = () => {
    if (!window.__ppxAudioCtx) {
      window.__ppxAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return window.__ppxAudioCtx;
  };

  const playTone = (freq, duration = 0.2, type = "sine", gainValue = 0.08) => {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = gainValue;
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  };

  const playScratch = () => {
    const ctx = getCtx();
    const buffer = ctx.createBuffer(1, 400, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.3;
    }
    const source = ctx.createBufferSource();
    const gain = ctx.createGain();
    gain.gain.value = 0.08;
    source.buffer = buffer;
    source.connect(gain).connect(ctx.destination);
    source.start();
  };

  const playWin = () => {
    playTone(880, 0.18, "triangle", 0.1);
    setTimeout(() => playTone(1175, 0.2, "triangle", 0.09), 120);
  };

  const playLose = () => {
    playTone(220, 0.25, "sawtooth", 0.08);
    setTimeout(() => playTone(170, 0.22, "sawtooth", 0.07), 120);
  };

  return { playScratch, playWin, playLose };
}

