import { useState } from "react";
import api from "../../services/api";

export default function CreateCustomer() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const create = async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("");
      await api.post("/api/customer/create", { name, email, password });
      setMessage("Customer created successfully.");
      setName("");
      setEmail("");
      setPassword("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create customer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <h2 className="casino-section-title">Create Customer</h2>
      <p className="casino-section-sub">Register a new customer under your client account</p>
      {error ? <div className="casino-alert error">{error}</div> : null}
      {message ? <div className="casino-alert success">{message}</div> : null}

      <div className="casino-grid-2 mt-4">
        <input
          placeholder="Customer Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
        />
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
      </div>
      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="new-password"
      />
      <button onClick={create} disabled={loading}>
        {loading ? "Creating..." : "Create Customer"}
      </button>
    </section>
  );
}
