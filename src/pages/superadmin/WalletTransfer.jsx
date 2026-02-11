import { useState } from "react";
import api from "../../services/api";

export default function WalletTransfer() {
  const [fromId, setFromId] = useState("");
  const [toId, setToId] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const transfer = async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("");
      await api.post("/api/super-admin/transfer", {
        fromId,
        toId,
        amount: Number(amount),
      });
      setMessage("Wallet transfer successful.");
      setAmount("");
    } catch (err) {
      console.error("WALLET TRANSFER ERROR:", err);
      setError(err.response?.data?.message || "Transfer failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <h2 className="casino-section-title">Wallet Transfer</h2>
      <p className="casino-section-sub">Move balance between two wallet owners</p>

      <div className="casino-grid-3 mt-4">
        <input placeholder="From User ID" value={fromId} onChange={(e) => setFromId(e.target.value)} />
        <input placeholder="To User ID" value={toId} onChange={(e) => setToId(e.target.value)} />
        <input
          placeholder="Amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>

      <button onClick={transfer} disabled={loading}>
        {loading ? "Processing..." : "Transfer"}
      </button>

      {message ? <div className="casino-alert success">{message}</div> : null}
      {error ? <div className="casino-alert error">{error}</div> : null}
    </section>
  );
}
