import { useEffect, useState } from "react";
import api from "../../services/api";

export default function GameControl() {
  const [games, setGames] = useState([]);
  const [loadingId, setLoadingId] = useState(null);

  const loadGames = async () => {
    const res = await api.get("/api/game");
    setGames(res.data || []);
  };

  const toggleGame = async (id) => {
    try {
      setLoadingId(id);
      await api.post(`/api/game/toggle/${id}`);
      await loadGames();
    } finally {
      setLoadingId(null);
    }
  };

  const updateControl = async (slug, payload) => {
    try {
      setLoadingId(slug);
      await api.post("/api/admin/game/rtp", { slug, ...payload });
      await loadGames();
    } finally {
      setLoadingId(null);
    }
  };

  const handleRtpChange = (id, value) => {
    setGames((prev) => prev.map((g) => (g._id === id ? { ...g, rtp: Number(value) } : g)));
  };

  useEffect(() => {
    loadGames();
  }, []);

  return (
    <div>
      <h2>Game Control</h2>
      <p className="opacity-70">RTP and force-result control panel</p>
      <div className="mt-3 grid gap-3">
        {games.map((game) => (
          <div
            key={game._id}
            className="rounded-xl border border-slate-700/40 bg-slate-950/70 p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-lg font-bold">{game.name}</div>
                <div className="text-xs text-slate-400">
                  Slug: {game.slug} | Force: {game.forceResult || "NORMAL"} | RTP: {game.rtp}%
                </div>
              </div>
              <button
                onClick={() => toggleGame(game._id)}
                disabled={loadingId === game._id}
                className={game.isActive ? "" : "casino-btn-danger"}
              >
                {game.isActive ? "ON" : "OFF"}
              </button>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <span className="text-sm">RTP: {game.rtp}%</span>
              <input
                type="range"
                min="0"
                max="100"
                value={game.rtp ?? 90}
                onChange={(e) => handleRtpChange(game._id, e.target.value)}
                className="m-0 max-w-sm"
              />
              <button onClick={() => updateControl(game.slug, { rtp: game.rtp })}>
                Update RTP
              </button>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={() => updateControl(game.slug, { forceResult: "WIN" })}
                disabled={loadingId === game.slug}
              >
                Force Win
              </button>
              <button
                className="casino-btn-danger"
                onClick={() => updateControl(game.slug, { forceResult: "LOSE" })}
                disabled={loadingId === game.slug}
              >
                Force Lose
              </button>
              <button
                className="casino-btn-ghost"
                onClick={() => updateControl(game.slug, { forceResult: null })}
                disabled={loadingId === game.slug}
              >
                Normal Mode
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
