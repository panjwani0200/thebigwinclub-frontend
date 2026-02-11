import { useState } from "react";
import api from "../../services/api";

export default function WithdrawClient() {
  const [clientCode, setClientCode] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("");
      const res = await api.post("/api/admin/withdraw-client", {
        clientCode,
        amount: Number(amount),
      });
      setMessage(
        `Withdrawal complete. Client balance: ?${res.data.clientBalance} | Admin balance: ?${res.data.adminBalance}`
      );
      setAmount("");
    } catch (err) {
      console.error("ADMIN WITHDRAW CLIENT ERROR:", err);
      setError(err.response?.data?.message || "Withdraw failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <h2 className="casino-section-title">Withdraw From Client</h2>
      <p className="casino-section-sub">Transfer funds from a client wallet back to admin wallet</p>

      <div className="casino-grid-2 mt-4">
        <input
          placeholder="Client Code (CL0001)"
          value={clientCode}
          onChange={(e) => setClientCode(e.target.value)}
        />
        <input
          placeholder="Amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>

      <div className="casino-actions mt-2">
        <button onClick={submit} disabled={loading}>
          {loading ? "Processing..." : "Withdraw"}
        </button>
      </div>

      {message ? <div className="casino-alert success">{message}</div> : null}
      {error ? <div className="casino-alert error">{error}</div> : null}
    </section>
  );
}
