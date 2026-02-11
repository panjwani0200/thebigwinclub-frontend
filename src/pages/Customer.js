import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import CasinoFooter from "../components/layout/CasinoFooter";
import Dashboard from "./customer/Dashboard";
import Play from "./customer/Play";
import MyBets from "./customer/MyBets";
import PappuPlayingPictures from "./games/PappuPlayingPictures/PappuPlayingPictures";
import TeenPattiAB from "./games/TeenPattiAB/TeenPattiAB";
import AndarBahar from "./games/AndarBahar/AndarBahar";

export default function Customer() {
  const [active, setActive] = useState("dashboard");
  const [currentGame, setCurrentGame] = useState(null);
  const [customerName, setCustomerName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await api.get("/api/auth/me");
        setCustomerName(res.data?.name || "");
      } catch (err) {
        console.error("CUSTOMER PROFILE ERROR:", err);
      }
    };

    loadProfile();
  }, []);

  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  const renderGame = () => {
    const gameKey = (currentGame || "").toLowerCase();
    const isPappu = gameKey === "pappu-playing-pictures" || gameKey.includes("pappu");
    const isTeenPatti = gameKey === "teen-patti-ab" || gameKey.includes("teen");
    const isAndarBahar = gameKey === "andar-bahar" || gameKey.includes("andar");

    if (isPappu) return <PappuPlayingPictures onBack={() => setCurrentGame(null)} />;
    if (isTeenPatti) return <TeenPattiAB onBack={() => setCurrentGame(null)} />;
    if (isAndarBahar) return <AndarBahar onBack={() => setCurrentGame(null)} />;

    return (
      <div className="casino-page">
        <h3>Game Not Available</h3>
        <p>This game is not mapped in the customer app yet.</p>
        <button onClick={() => setCurrentGame(null)}>Back to games</button>
      </div>
    );
  };

  return (
    <div className="casino-main customer-mobile-shell min-h-screen">
      <header className="casino-header">
        <div>
          <div className="casino-header-title">BigWinClub</div>
          <div className="casino-header-sub">Customer Lounge</div>
        </div>
        <div className="flex items-center gap-3">
          {customerName ? <span className="casino-pill">Hey {customerName}</span> : null}
          <button className="casino-btn-danger" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      {!currentGame ? (
        <div className="casino-content customer-mobile-content pt-4">
          <div className="casino-tabs">
            <button
              className={`casino-tab ${active === "dashboard" ? "is-active" : ""}`}
              onClick={() => setActive("dashboard")}
            >
              Wallet
            </button>
            <button
              className={`casino-tab ${active === "play" ? "is-active" : ""}`}
              onClick={() => setActive("play")}
            >
              Play
            </button>
            <button className="casino-tab" onClick={() => navigate("/matka")}>
              Matka
            </button>
            <button
              className={`casino-tab ${active === "bets" ? "is-active" : ""}`}
              onClick={() => setActive("bets")}
            >
              My Bets
            </button>
          </div>

          <div className="casino-page mt-4">
            {active === "dashboard" ? <Dashboard /> : null}
            {active === "play" ? <Play onPlay={(slug) => setCurrentGame(slug)} /> : null}
            {active === "bets" ? <MyBets /> : null}
          </div>
        </div>
      ) : (
        <div className="casino-content">{renderGame()}</div>
      )}

      <CasinoFooter />
    </div>
  );
}
