import { useState } from "react";
import api from "../../services/api";

export default function SeedCoins() {
  const [userId, setUserId] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const seed = async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("");
      await api.post("/api/super-admin/seed", { userId, amount: Number(amount) });
      setMessage("Coins seeded successfully.");
      setAmount("");
    } catch (err) {
      console.error("SUPER ADMIN SEED ERROR:", err);
      setError(err.response?.data?.message || "Seed failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <h2 className="casino-section-title">Seed Coins</h2>
      <p className="casino-section-sub">Credit wallet balance directly by user ID</p>

      <div className="casino-grid-2 mt-4">
        <input placeholder="User ID" value={userId} onChange={(e) => setUserId(e.target.value)} />
        <input
          placeholder="Amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>

      <button onClick={seed} disabled={loading}>
        {loading ? "Processing..." : "Seed"}
      </button>

      {message ? <div className="casino-alert success">{message}</div> : null}
      {error ? <div className="casino-alert error">{error}</div> : null}
    </section>
  );
}
