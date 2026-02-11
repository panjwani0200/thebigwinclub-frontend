import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";

const BET_TYPES = [
  { key: "SINGLE_ANK", label: "Single Ank", hint: "Single digit (0-9)" },
  { key: "SINGLE_PATTI", label: "Single Patti", hint: "Select from list only" },
  { key: "DOUBLE_PATTI", label: "Double Patti", hint: "Select from list only" },
  { key: "TRIPLE_PATTI", label: "Triple Patti", hint: "Select from list only" },
  { key: "JODI", label: "Jodi", hint: "Select from 00 to 99" },
];

const SINGLE_PATTI_GROUPS = [
  { ank: 0, list: ["127", "136", "145", "190", "235", "280", "370", "389", "460", "479", "569", "578"] },
  { ank: 1, list: ["128", "137", "146", "236", "245", "290", "380", "470", "489", "560", "579", "678"] },
  { ank: 2, list: ["129", "138", "147", "156", "237", "246", "345", "390", "480", "570", "589", "679"] },
  { ank: 3, list: ["120", "139", "148", "157", "238", "247", "256", "346", "490", "580", "670", "689"] },
  { ank: 4, list: ["130", "149", "158", "167", "239", "248", "257", "347", "356", "590", "680", "789"] },
  { ank: 5, list: ["140", "159", "168", "230", "249", "258", "267", "348", "357", "456", "690", "780"] },
  { ank: 6, list: ["123", "150", "169", "178", "240", "259", "268", "349", "358", "367", "457", "790"] },
  { ank: 7, list: ["124", "160", "179", "250", "269", "278", "340", "359", "368", "458", "467", "890"] },
  { ank: 8, list: ["125", "134", "170", "189", "260", "279", "350", "369", "378", "459", "468", "567"] },
  { ank: 9, list: ["126", "135", "180", "234", "270", "289", "360", "379", "450", "469", "478", "568"] },
];

const DOUBLE_PATTI_GROUPS = [
  { ank: 0, list: ["118", "226", "244", "299", "334", "488", "550", "668", "677"] },
  { ank: 1, list: ["100", "119", "155", "227", "335", "344", "399", "588", "669"] },
  { ank: 2, list: ["110", "200", "228", "255", "336", "499", "660", "688", "778"] },
  { ank: 3, list: ["166", "229", "300", "337", "355", "445", "599", "779", "788"] },
  { ank: 4, list: ["112", "220", "266", "338", "400", "446", "455", "699", "770"] },
  { ank: 5, list: ["113", "122", "177", "339", "366", "447", "500", "799", "889"] },
  { ank: 6, list: ["114", "277", "330", "448", "466", "556", "600", "880", "899"] },
  { ank: 7, list: ["115", "133", "188", "223", "377", "449", "557", "566", "700"] },
  { ank: 8, list: ["116", "224", "233", "288", "440", "477", "558", "800", "990"] },
  { ank: 9, list: ["117", "144", "199", "225", "388", "559", "577", "667", "900"] },
];

const TRIPLE_PATTI_LIST = ["000", "111", "222", "333", "444", "555", "666", "777", "888", "999"];
const JODI_LIST = Array.from({ length: 100 }, (_, i) => String(i).padStart(2, "0"));
const BET_AMOUNTS = [50, 100, 500, 1000, 5000];

export default function MatkaPlay() {
  const { marketId } = useParams();
  const navigate = useNavigate();

  const [market, setMarket] = useState(null);
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [betType, setBetType] = useState(null);
  const [session, setSession] = useState("OPEN");
  const [number, setNumber] = useState("");
  const [amount, setAmount] = useState("100");

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const [marketRes, betsRes] = await Promise.all([
        api.get(`/api/matka/markets/${marketId}`),
        api.get("/api/matka/bets/me"),
      ]);
      setMarket(marketRes.data);
      setBets((betsRes.data || []).filter((b) => b.marketId === marketId));
    } catch (err) {
      console.error("MATKA PLAY ERROR:", err);
      setError(err.response?.data?.message || "Failed to load market");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [marketId]);

  const openModal = (type) => {
    setBetType(type);
    setSession("OPEN");
    setNumber("");
    setAmount("100");
    setMessage("");
    setError("");
    setModalOpen(true);
  };

  const placeBet = async () => {
    if (!Number.isFinite(Number(amount)) || Number(amount) < 50) {
      setError("Minimum bet is ₹50");
      return;
    }
    try {
      setError("");
      setMessage("");
      await api.post("/api/matka/bet", {
        marketId,
        betType: betType.key,
        session,
        number,
        amount: Number(amount),
      });
      setModalOpen(false);
      await load();
      setMessage("Bet placed successfully.");
    } catch (err) {
      console.error("MATKA BET UI ERROR:", err);
      setError(err.response?.data?.message || "Bet failed");
    }
  };

  const renderDigitPicker = () => {
    if (!betType) return null;

    if (betType.key === "JODI") {
      return (
        <div className="matka-patti-group">
          <div className="matka-patti-title">Jodi Numbers</div>
          <div className="matka-patti-grid matka-jodi-grid">
            {JODI_LIST.map((n) => (
              <button
                key={n}
                className={`matka-patti-btn ${number === n ? "active" : ""}`}
                onClick={() => setNumber(n)}
                type="button"
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (betType.key === "TRIPLE_PATTI") {
      return (
        <div className="matka-patti-group">
          <div className="matka-patti-title">Triple Patti</div>
          <div className="matka-patti-grid">
            {TRIPLE_PATTI_LIST.map((n) => (
              <button
                key={n}
                className={`matka-patti-btn ${number === n ? "active" : ""}`}
                onClick={() => setNumber(n)}
                type="button"
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (betType.key === "SINGLE_PATTI" || betType.key === "DOUBLE_PATTI") {
      const groups = betType.key === "SINGLE_PATTI" ? SINGLE_PATTI_GROUPS : DOUBLE_PATTI_GROUPS;
      return groups.map((g) => (
        <div key={g.ank} className="matka-patti-group">
          <div className="matka-patti-title">Panna of ank {g.ank}</div>
          <div className="matka-patti-grid">
            {g.list.map((n) => (
              <button
                key={n}
                className={`matka-patti-btn ${number === n ? "active" : ""}`}
                onClick={() => setNumber(n)}
                type="button"
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      ));
    }

    return (
      <input
        className="matka-input"
        value={number}
        onChange={(e) => setNumber(e.target.value)}
        placeholder="Enter number"
      />
    );
  };

  if (loading) return <div className="casino-empty mt-4">Loading market...</div>;
  if (!market) return <div className="casino-empty mt-4">Market not found.</div>;

  return (
    <section className="mt-4">
      <div className="casino-actions" style={{ justifyContent: "space-between" }}>
        <div>
          <h2 className="casino-section-title">{market.name} - Betting Dashboard</h2>
          <p className="casino-section-sub">
            Status: {market.status === "running" ? "Betting Running" : "Betting Closed"}
          </p>
        </div>
        <button className="matka-btn" onClick={() => navigate("/matka")}>
          Back to markets
        </button>
      </div>

      {market.result ? (
        <div className="matka-card mt-3">
          <div className="text-xs text-slate-400">Result Declared</div>
          <div className="matka-result">{market.result}</div>
        </div>
      ) : null}

      {message ? <div className="casino-alert success">{message}</div> : null}
      {error ? <div className="casino-alert error">{error}</div> : null}

      <div className="matka-play">
        <div className="matka-panel">
          <h3 className="mb-3">Bet Types</h3>
          <div className="matka-bet-types">
            {BET_TYPES.map((t) => (
              <button
                key={t.key}
                className="matka-bet-card"
                onClick={() => market.status === "running" && openModal(t)}
                disabled={market.status !== "running"}
              >
                <div className="font-bold">{t.label}</div>
                <div className="text-xs text-slate-400">{t.hint}</div>
              </button>
            ))}
          </div>

          {market.status !== "running" ? (
            <div className="casino-alert error mt-3">Betting is closed for this market.</div>
          ) : null}
        </div>

        <div className="matka-panel">
          <h3 className="mb-3">Your Bets</h3>
          {bets.length === 0 ? <div className="casino-empty">No bets yet.</div> : null}
          {bets.length > 0 ? (
            <table className="matka-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Session</th>
                  <th>Number</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bets.map((b) => (
                  <tr key={b._id}>
                    <td>{b.betType}</td>
                    <td>{b.session}</td>
                    <td>{b.number}</td>
                    <td>{"\u20B9"}{b.amount}</td>
                    <td>{b.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}
        </div>
      </div>

      {modalOpen && betType ? (
        <div className="matka-modal">
          <div className="matka-modal-card">
            <h3 className="mt-0">{betType.label}</h3>
            <div className="text-xs text-slate-400">{betType.hint}</div>

            <label className="block mt-3 text-sm">Session</label>
            <select className="matka-input" value={session} onChange={(e) => setSession(e.target.value)}>
              <option value="OPEN">Open</option>
              <option value="CLOSE">Close</option>
            </select>

            <label className="block mt-3 text-sm">Number</label>
            {(betType.key === "SINGLE_PATTI" ||
              betType.key === "DOUBLE_PATTI" ||
              betType.key === "TRIPLE_PATTI" ||
              betType.key === "JODI") ? (
              <div className="matka-patti">{renderDigitPicker()}</div>
            ) : (
              renderDigitPicker()
            )}

            <label className="block mt-3 text-sm">Amount</label>
            <label className="block mt-1 text-xs text-slate-400">Min bet: {"\u20B9"}50</label>
            <div className="casino-actions mt-1 mb-2">
              {BET_AMOUNTS.map((chip) => (
                <button
                  key={chip}
                  className={String(chip) === String(amount) ? "" : "casino-btn-ghost"}
                  type="button"
                  onClick={() => setAmount(String(chip))}
                >
                  {"\u20B9"}{chip}
                </button>
              ))}
            </div>
            <input
              className="matka-input"
              type="number"
              min="50"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
            />

            <div className="matka-actions">
              <button className="matka-cta" onClick={placeBet}>Place Bet</button>
              <button className="matka-btn" onClick={() => setModalOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
