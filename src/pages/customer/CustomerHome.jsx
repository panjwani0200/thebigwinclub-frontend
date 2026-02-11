import { useState } from "react";
import Dashboard from "./Dashboard";
import Play from "./Play";
import MyBets from "./MyBets";

export default function CustomerHome() {
  const [activeTab, setActiveTab] = useState("wallet");

  return (
    <div>
      {/* TOP TABS */}
      <div style={tabs}>
        <button
          style={activeTab === "wallet" ? activeBtn : btn}
          onClick={() => setActiveTab("wallet")}
        >
          Wallet
        </button>

        <button
          style={activeTab === "play" ? activeBtn : btn}
          onClick={() => setActiveTab("play")}
        >
          Play
        </button>

        <button
          style={activeTab === "bets" ? activeBtn : btn}
          onClick={() => setActiveTab("bets")}
        >
          My Bets
        </button>
      </div>

      {/* TAB CONTENT */}
      <div style={{ padding: 15 }}>
        {activeTab === "wallet" && <Dashboard />}
        {activeTab === "play" && <Play />}
        {activeTab === "bets" && <MyBets />}
      </div>
    </div>
  );
}

const tabs = {
  display: "flex",
  background: "#020617",
};

const btn = {
  flex: 1,
  padding: 12,
  background: "transparent",
  color: "white",
  border: "none",
  cursor: "pointer",
};

const activeBtn = {
  ...btn,
  background: "#facc15",
  color: "black",
  fontWeight: "bold",
};
