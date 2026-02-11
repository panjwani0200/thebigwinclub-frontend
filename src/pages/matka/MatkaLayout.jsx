import { Routes, Route, useNavigate } from "react-router-dom";
import MatkaHome from "./MatkaHome";
import MatkaPlay from "./MatkaPlay";
import CasinoFooter from "../../components/layout/CasinoFooter";
import "./Matka.css";

export default function MatkaLayout() {
  const navigate = useNavigate();

  return (
    <div className="matka-shell">
      <header className="matka-topbar">
        <div>
          <div className="matka-title">Matka Markets</div>
          <div className="matka-subtitle">Betting-only workflow with admin declared results</div>
        </div>
        <button className="matka-btn" onClick={() => navigate("/customer")}>Back to dashboard</button>
      </header>

      <Routes>
        <Route path="/" element={<MatkaHome />} />
        <Route path="/play/:marketId" element={<MatkaPlay />} />
      </Routes>

      <CasinoFooter />
    </div>
  );
}
