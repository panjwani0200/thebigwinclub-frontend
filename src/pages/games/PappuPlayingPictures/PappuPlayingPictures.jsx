import { useEffect, useRef, useState } from "react";
import api from "../../../services/api";
import "./PappuPlayingPictures.css";
import { PAPPU_SYMBOLS } from "../../../data/pappuSymbols";
import InlineBetHistory from "../../../components/customer/InlineBetHistory";

export default function PappuPlayingPictures({ onBack }) {
  const [selected, setSelected] = useState(null);
  const [amount, setAmount] = useState(50);
  const [roundId, setRoundId] = useState(null);
  const [status, setStatus] = useState("Select a picture to begin.");
  const [result, setResult] = useState(null);
  const [pendingResult, setPendingResult] = useState(null);
  const [scratchActive, setScratchActive] = useState(false);
  const [autoReveal, setAutoReveal] = useState(false);
  const [loading, setLoading] = useState(false);
  const { playScratch, playWin, playLose } = useScratchSounds();

  // Start a new round (UI drives the state; backend handles RNG)
  const startRound = async () => {
    try {
      setLoading(true);
      setSelected(null);
      setResult(null);
      setRoundId(null);
      setStatus("Round started. Pick one picture.");

      const res = await api.post("/api/game/pappu/start");
      setRoundId(res.data.roundId);
    } catch (err) {
      console.error("PAPPU START ERROR:", err);
      setStatus("Could not start the round. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // Place bet on the selected picture
  const placeBet = async () => {
    if (!roundId) return setStatus("Click Play to start a round.");
    if (!selected) return setStatus("Select one picture to bet.");
    if (!Number.isFinite(Number(amount)) || Number(amount) < 50) {
      return setStatus("Minimum bet is \u20B950.");
    }

    try {
      setLoading(true);
      setStatus("Scratch to reveal the result.");

      const res = await api.post("/api/bet/place", {
        roundId,
        symbol: selected,
        amount: Number(amount),
      });

      const gameResult = res.data.result; // WIN / LOSE
      setPendingResult(gameResult);
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
    if (pendingResult === "WIN") playWin();
    else playLose();
    setPendingResult(null);
    setAutoReveal(false);
  };

  return (
    <div className="ppx-shell">
      <div className="ppx-stage">
        {/* Top bar for navigation + trust cues */}
        <div className="ppx-topbar">
          <div className="ppx-brand">
            <img
              className="ppx-logo-img"
              src="/assets/pappu/pappu-logo.webp"
              alt="Pappu Playing Pictures"
            />
            <div>
              <div className="ppx-title">Pappu Playing Pictures</div>
              <div className="ppx-subtitle">Trusted play â€¢ Fast rounds</div>
            </div>
          </div>
          {onBack && (
            <button className="ppx-back" onClick={onBack}>
              Back to games
            </button>
          )}
        </div>

        <div className="ppx-reveal-area">
          <div className={`ppx-reveal-banner ${result ? result.toLowerCase() : ""}`}>
            {result ? (result === "WIN" ? "YOU WON" : "YOU LOST") : "RESULT"}
          </div>
          <div className="ppx-reveal-card">
            {selected && (
              <>
                <img
                  src={PAPPU_SYMBOLS.find((s) => s.key === selected)?.src}
                  alt="Selected"
                  className="ppx-reveal-img"
                />
                <div className="ppx-reveal-label">
                  {PAPPU_SYMBOLS.find((s) => s.key === selected)?.label}
                </div>
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

        <div className="ppx-grid-wrap">
          {/* Game board */}
          <div className="ppx-board">
            <div className="ppx-status">
              <div className="ppx-status-text">{status}</div>
              <div className="ppx-status-indicator" aria-hidden />
            </div>

            <div className="ppx-grid">
              {PAPPU_SYMBOLS.map((s) => (
                <button
                  key={s.key}
                  className={`ppx-tile ${selected === s.key ? "is-active" : ""}`}
                  onClick={() => !loading && setSelected(s.key)}
                  disabled={loading}
                >
                  <div className="ppx-tile-inner">
                    <img src={s.src} alt={s.label} className="ppx-tile-img" />
                    <div className="ppx-tile-label">{s.label}</div>
                  </div>

                  {/* scratch moved to single reveal card above */}
                </button>
              ))}
            </div>
          </div>

          {/* Control panel */}
          <div className="ppx-panel">
            <div className="ppx-card">
              <div className="ppx-card-title">Bet Amount</div>
              <div className="ppx-chips">
                {[50, 100, 500, 1000].map((v) => (
                  <button
                    key={v}
                    className={`ppx-chip ${amount === v ? "is-active" : ""}`}
                    onClick={() => setAmount(v)}
                    disabled={loading}
                  >
                    {"\u20B9"}{v}
                  </button>
                ))}
              </div>
              <div className="ppx-custom">
                <label className="ppx-custom-label">Min bet: {"\u20B9"}50</label>
                <label className="ppx-custom-label">Custom Amount</label>
                <input
                  className="ppx-custom-input"
                  type="number"
                  min="50"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="ppx-card">
              <div className="ppx-actions">
                <button
                  className="ppx-btn ppx-btn-primary"
                  onClick={startRound}
                  disabled={loading}
                >
                  Play
                </button>
                <button
                  className="ppx-btn ppx-btn-accent"
                  onClick={placeBet}
                  disabled={loading || !roundId || !selected}
                >
                  Bet
                </button>
              </div>
            </div>

            <div className="ppx-card ppx-card-mini">
              <div className="ppx-mini">
                <div className="ppx-mini-title">Quick Tips</div>
                <div className="ppx-mini-text">
                  Pick one picture and place your bet. Results are instant.
                </div>
              </div>
            </div>
          </div>
        </div>

        <InlineBetHistory
          title="Previous Pappu Bets"
          gameSlugs={["pappu-playing-pictures"]}
          refreshKey={`${result || ""}-${roundId || ""}`}
        />

        {/* Footer strip for responsible play */}
        <div className="ppx-footer">
          Play responsibly. 18+ only. This is a UI mock for a premium gaming feel.
        </div>
      </div>
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
        // Force completion in case of edge pixels
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

  return (
    <canvas
      ref={setCanvas}
      className="ppx-scratch"
      aria-hidden
    />
  );
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
