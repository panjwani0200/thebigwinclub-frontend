import { useState } from "react";
import api from "../../services/api";

export default function PlaceBet() {
  const [userId, setUserId] = useState("");
  const [gameId, setGameId] = useState("");
  const [amount, setAmount] = useState("");

  const placeBet = async () => {
    const res = await api.post("/bet/place", {
      userId,
      gameId,
      amount: Number(amount),
    });

    alert(res.data.bet.result);
  };

  return (
    <div>
      <h3>Place Bet</h3>
      <input placeholder="User ID" onChange={e => setUserId(e.target.value)} />
      <input placeholder="Game ID" onChange={e => setGameId(e.target.value)} />
      <input placeholder="Amount" onChange={e => setAmount(e.target.value)} />
      <button onClick={placeBet}>Bet</button>
    </div>
  );
}
