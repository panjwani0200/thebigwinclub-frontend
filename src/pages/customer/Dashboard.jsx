import { useEffect, useState } from "react";
import api from "../../services/api";

export default function Dashboard() {
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!userId) return;

    api
      .get(`/api/wallet/${userId}`)
      .then((res) => setBalance(res.data.balance || 0))
      .catch((err) => console.error("WALLET FETCH ERROR:", err))
      .finally(() => setLoading(false));
  }, [userId]);

  return (
    <section className="mx-auto w-full max-w-[460px]">
      <h2 className="casino-section-title text-center">Wallet Dashboard</h2>
      <p className="casino-section-sub text-center">Real-time wallet summary and account health</p>

      <div className="casino-grid-3 mt-4">
        <article className="casino-kpi">
          <div className="casino-kpi-label">Current Balance</div>
          <div className="casino-kpi-value text-casino-success">{loading ? "..." : `\u20B9 ${balance}`}</div>
          <div className="mt-2 text-xs text-slate-400">Wallet updates after each settled round</div>
        </article>

        <article className="casino-kpi">
          <div className="casino-kpi-label">Status</div>
          <div className="casino-kpi-value text-casino-gold !text-xl">Active</div>
          <div className="mt-2 text-xs text-slate-400">Play responsibly. 18+ only.</div>
        </article>

        <article className="casino-kpi">
          <div className="casino-kpi-label">Security</div>
          <div className="casino-kpi-value !text-xl">Protected Session</div>
          <div className="mt-2 text-xs text-slate-400">Token-based authenticated wallet access</div>
        </article>
      </div>
    </section>
  );
}
