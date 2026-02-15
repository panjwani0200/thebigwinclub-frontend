import "./BetOutcomePopup.css";

export default function BetOutcomePopup({
  open,
  result,
  amount = 0,
  payout = 0,
  gameName = "Game",
  onClose,
}) {
  if (!open) return null;

  const stake = Number(amount) || 0;
  const totalPayout = Number(payout) || 0;
  const isWin = String(result || "").toUpperCase() === "WIN";
  const netAmount = isWin ? totalPayout - stake : -stake;

  return (
    <div className="bop-backdrop" role="dialog" aria-modal="true">
      <div className={`bop-card ${isWin ? "win" : "lose"}`}>
        <div className="bop-title">{isWin ? "You Won" : "You Lost"}</div>
        <div className="bop-game">{gameName}</div>
        <div className={`bop-amount ${isWin ? "win" : "lose"}`}>
          {isWin ? "+" : "-"}₹{Math.abs(netAmount).toFixed(2)}
        </div>
        <div className="bop-meta">
          <div>Bet: ₹{stake.toFixed(2)}</div>
          <div>Payout: ₹{totalPayout.toFixed(2)}</div>
        </div>
        <button className="bop-close" onClick={onClose}>
          OK
        </button>
      </div>
    </div>
  );
}

