import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";

export default function PersonalGameControl() {
  const [q, setQ] = useState("");
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [controlsBySlug, setControlsBySlug] = useState({});
  const [games, setGames] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [updatingSlug, setUpdatingSlug] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadGames = async () => {
    try {
      const res = await api.get("/api/game");
      setGames(res.data || []);
    } catch {
      setGames([]);
    }
  };

  const searchCustomers = async () => {
    try {
      setLoadingSearch(true);
      setError("");
      const res = await api.get("/api/admin/personal-game-control/customers", {
        params: { q },
      });
      setCustomers(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to search customers");
      setCustomers([]);
    } finally {
      setLoadingSearch(false);
    }
  };

  const loadCustomerControls = async (customer) => {
    try {
      setLoadingDetails(true);
      setError("");
      setMessage("");
      const res = await api.get(`/api/admin/personal-game-control/${customer._id}`);
      setSelectedCustomer(res.data.customer || customer);
      const map = {};
      (res.data.controls || []).forEach((c) => {
        map[c.gameSlug] = c.isEnabled;
      });
      setControlsBySlug(map);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load customer controls");
    } finally {
      setLoadingDetails(false);
    }
  };

  const toggleCustomerGame = async (gameSlug, nextEnabled) => {
    if (!selectedCustomer?._id) return;
    try {
      setUpdatingSlug(gameSlug);
      setError("");
      setMessage("");
      await api.patch(`/api/admin/personal-game-control/${selectedCustomer._id}`, {
        gameSlug,
        isEnabled: nextEnabled,
      });
      setControlsBySlug((prev) => ({ ...prev, [gameSlug]: nextEnabled }));
      setMessage(`Updated ${gameSlug} for ${selectedCustomer.userCode}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update game control");
    } finally {
      setUpdatingSlug("");
    }
  };

  useEffect(() => {
    loadGames();
    searchCustomers();
  }, []);

  const rows = useMemo(() => {
    return games.map((g) => ({
      slug: g.slug,
      name: g.name,
      enabled: controlsBySlug[g.slug] !== false,
    }));
  }, [games, controlsBySlug]);

  return (
    <section>
      <h2 className="casino-section-title">Personal Game Control</h2>
      <p className="casino-section-sub">
        Enable or disable games for a specific customer by customer ID/code
      </p>

      <div className="casino-actions mt-3">
        <input
          className="max-w-md"
          placeholder="Search customer by code / name / email"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button onClick={searchCustomers} disabled={loadingSearch}>
          {loadingSearch ? "Searching..." : "Search"}
        </button>
      </div>

      {error ? <div className="casino-alert error mt-3">{error}</div> : null}
      {message ? <div className="casino-alert success mt-3">{message}</div> : null}

      <div className="casino-grid-2 mt-4">
        <article className="casino-kpi">
          <div className="casino-kpi-label">Customers</div>
          <div className="casino-list mt-3">
            {customers.map((c) => (
              <button
                key={c._id}
                className={`casino-list-item ${selectedCustomer?._id === c._id ? "border-yellow-400" : ""}`}
                onClick={() => loadCustomerControls(c)}
              >
                <div>
                  <div className="casino-list-title">{c.name || c.email || "Customer"}</div>
                  <div className="casino-list-sub">{c.userCode || c._id}</div>
                </div>
              </button>
            ))}
            {!loadingSearch && customers.length === 0 ? (
              <div className="casino-empty">No customers found.</div>
            ) : null}
          </div>
        </article>

        <article className="casino-kpi">
          <div className="casino-kpi-label">Game Access</div>
          {!selectedCustomer ? <div className="casino-empty mt-3">Select a customer</div> : null}
          {selectedCustomer ? (
            <>
              <div className="mt-2 text-sm text-slate-300">
                {selectedCustomer.name || selectedCustomer.email} ({selectedCustomer.userCode || selectedCustomer._id})
              </div>
              <div className="casino-list mt-3">
                {rows.map((row) => (
                  <div key={row.slug} className="casino-list-item">
                    <div>
                      <div className="casino-list-title">{row.name}</div>
                      <div className="casino-list-sub">{row.slug}</div>
                    </div>
                    <button
                      className={row.enabled ? "" : "casino-btn-danger"}
                      disabled={loadingDetails || updatingSlug === row.slug}
                      onClick={() => toggleCustomerGame(row.slug, !row.enabled)}
                    >
                      {updatingSlug === row.slug
                        ? "Saving..."
                        : row.enabled
                          ? "Enabled"
                          : "Disabled"}
                    </button>
                  </div>
                ))}
              </div>
            </>
          ) : null}
        </article>
      </div>
    </section>
  );
}
