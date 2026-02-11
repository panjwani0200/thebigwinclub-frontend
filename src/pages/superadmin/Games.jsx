import { useEffect, useState } from "react";
import api from "../../services/api";

export default function Games() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/api/super-admin/games");
      setGames(res.data || []);
    } catch (err) {
      console.error("SUPER ADMIN GAMES ERROR:", err);
      setError(err.response?.data?.message || "Failed to load games");
      setGames([]);
    } finally {
      setLoading(false);
    }
  };

  const toggle = async (id) => {
    try {
      await api.put(`/api/super-admin/games/${id}/toggle`);
      await load();
    } catch (err) {
      console.error("SUPER ADMIN TOGGLE GAME ERROR:", err);
      setError(err.response?.data?.message || "Failed to toggle game");
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <section>
      <h2 className="casino-section-title">Global Games</h2>
      <p className="casino-section-sub">Master game availability switch for all user roles</p>

      <div className="casino-actions mt-3">
        <button onClick={load} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {error ? <div className="casino-alert error">{error}</div> : null}

      {games.length === 0 ? (
        <div className="casino-empty mt-4">No games found.</div>
      ) : (
        <div className="casino-list mt-4">
          {games.map((g) => (
            <article key={g._id} className="casino-list-item">
              <div>
                <div className="casino-list-title">{g.name}</div>
                <div className="casino-list-sub">Slug: {g.slug || "-"}</div>
              </div>
              <div className="casino-actions">
                <span className={`casino-badge ${g.isActive ? "success" : "error"}`}>
                  {g.isActive ? "ACTIVE" : "DISABLED"}
                </span>
                <button className={g.isActive ? "casino-btn-danger" : ""} onClick={() => toggle(g._id)}>
                  {g.isActive ? "Disable" : "Enable"}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
