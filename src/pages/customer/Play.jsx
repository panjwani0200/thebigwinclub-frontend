import { useEffect, useState } from "react";
import api from "../../services/api";

export default function Play({ onPlay }) {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/api/game")
      .then((res) => setGames((res.data || []).filter((g) => g.isActive)))
      .catch(() => setGames([]))
      .finally(() => setLoading(false));
  }, []);

  const resolveSlug = (game) => {
    const raw = game?.slug || game?.gameSlug || game?.name || "";
    return String(raw).toLowerCase().trim().replace(/\s+/g, "-");
  };

  const logoBySlug = (slug) => {
    if (slug === "teen-patti-ab") return "/assets/teenpatti/teenpatti-logo.png";
    if (slug === "andar-bahar") return "/assets/andarbahar/andarbahar-logo.png";
    return "/assets/pappu/pappu-logo.webp";
  };

  return (
    <section className="mx-auto w-full max-w-[460px]">
      <h2 className="casino-section-title text-center">Available Games</h2>
      {loading ? (
        <div className="casino-empty mt-4">Loading games...</div>
      ) : games.length === 0 ? (
        <div className="casino-empty mt-4">No active games available.</div>
      ) : (
        <div className="mt-4 space-y-4">
          {games.map((game) => (
            <article key={game._id} className="casino-game-card">
              <div className="flex items-center gap-3">
                <img
                  src={logoBySlug(game.slug)}
                  alt={game.name}
                  className="h-12 w-12 rounded-md border border-slate-700/50 object-cover"
                />
                <div className="flex-1">
                  <h3 className="mb-2 text-base font-bold leading-tight tracking-tight">
                    {game.name}
                  </h3>
                  <button onClick={() => onPlay(resolveSlug(game))} className="w-full max-w-[140px]">
                    Play Now
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
