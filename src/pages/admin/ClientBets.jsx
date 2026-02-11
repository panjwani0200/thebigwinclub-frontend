import { useState } from "react";
import api from "../../services/api";

export default function ClientBets() {
  const [clientId, setClientId] = useState("");
  const [bets, setBets] = useState([]);

  const load = async () => {
    const res = await api.get(`/admin/bets/${clientId}`);
    setBets(res.data);
  };

  return (
    <div>
      <h3>Client Bets</h3>
      <input placeholder="Client ID" onChange={e => setClientId(e.target.value)} />
      <button onClick={load}>Load</button>

      {bets.map(b => (
        <p key={b._id}>
          {b.gameId?.name} — ₹{b.amount} — {b.result}
        </p>
      ))}
    </div>
  );
}
