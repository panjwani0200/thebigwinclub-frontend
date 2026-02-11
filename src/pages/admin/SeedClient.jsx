import { useState } from "react";
import api from "../../services/api";

export default function SeedClient() {
  const [clientCode, setClientCode] = useState("");
  const [clientUserId, setClientUserId] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const seed = async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("");
      const res = await api.post("/api/admin/seed", {
        clientCode: clientCode || undefined,
        clientId: clientUserId || undefined,
        amount: Number(amount),
      });
      setMessage(
        `Seed successful for ${res.data.userCode || ""} ${res.data.email || ""} | Balance: ?${res.data.balance}`
      );
      setAmount("");
    } catch (err) {
      setError(err.response?.data?.message || "Seed failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <h2 className="casino-section-title">Seed Client</h2>
      <p className="casino-section-sub">Add wallet credit to a client account</p>
      {error ? <div className="casino-alert error">{error}</div> : null}
      {message ? <div className="casino-alert success">{message}</div> : null}

      <div className="casino-grid-2 mt-4">
        <input
          placeholder="Client ID (CL0001)"
          value={clientCode}
          onChange={(e) => setClientCode(e.target.value)}
        />
        <input
          placeholder="Client User ID (optional)"
          value={clientUserId}
          onChange={(e) => setClientUserId(e.target.value)}
        />
      </div>

      <input
        placeholder="Amount"
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      <button onClick={seed} disabled={loading}>
        {loading ? "Processing..." : "Seed Client"}
      </button>
    </section>
  );
}
