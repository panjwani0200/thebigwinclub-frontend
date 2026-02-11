import { useMemo, useState } from "react";
import CasinoSidebarLayout from "../components/layout/CasinoSidebarLayout";
import Dashboard from "./admin/Dashboard";
import CreateClient from "./admin/CreateClient";
import SeedClient from "./admin/SeedClient";
import Clients from "./admin/Clients";
import CustomerBets from "./admin/CustomerBets";
import ProfitLoss from "./admin/ProfitLoss";
import GameControl from "./admin/GameControl";
import Customers from "./admin/Customers";
import WithdrawClient from "./admin/WithdrawClient";
import WithdrawLogs from "./admin/WithdrawLogs";
import MatkaResults from "./admin/MatkaResults";
import DepositLogs from "./admin/DepositLogs";
import PersonalGameControl from "./admin/PersonalGameControl";
import ChangePassword from "./shared/ChangePassword";

export default function Admin() {
  const [active, setActive] = useState("dashboard");

  const menuItems = useMemo(
    () => [
      { key: "dashboard", label: "Dashboard" },
      { key: "create", label: "Create Client" },
      { key: "seed", label: "Seed Client" },
      { key: "clientsPage", label: "Clients" },
      { key: "customersPage", label: "Customers" },
      { key: "customerBets", label: "Customer Bets" },
      { key: "profit", label: "Profit / Loss" },
      { key: "withdrawClient", label: "Withdraw Client" },
      { key: "withdrawLogs", label: "Withdraw Logs" },
      { key: "depositLogs", label: "Deposit Logs" },
      { key: "matkaResults", label: "Matka Results" },
      { key: "games", label: "Game Control" },
      { key: "personalGameControl", label: "Personal Game Control" },
      { key: "changePassword", label: "Change Password" },
    ],
    []
  );

  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  const renderPage = () => {
    if (active === "dashboard") return <Dashboard />;
    if (active === "create") return <CreateClient />;
    if (active === "seed") return <SeedClient />;
    if (active === "clientsPage") return <Clients />;
    if (active === "customersPage") return <Customers />;
    if (active === "customerBets") return <CustomerBets />;
    if (active === "profit") return <ProfitLoss />;
    if (active === "withdrawClient") return <WithdrawClient />;
    if (active === "withdrawLogs") return <WithdrawLogs />;
    if (active === "depositLogs") return <DepositLogs />;
    if (active === "matkaResults") return <MatkaResults />;
    if (active === "games") return <GameControl />;
    if (active === "personalGameControl") return <PersonalGameControl />;
    if (active === "changePassword") return <ChangePassword />;
    return <Dashboard />;
  };

  return (
    <CasinoSidebarLayout
      roleLabel="Admin Panel"
      menuItems={menuItems}
      activeKey={active}
      onSelect={setActive}
      onLogout={logout}
      headerTitle="Operations Console"
      headerSubtitle="Clients, reports, market control and risk monitoring"
      headerRight={<span className="casino-pill">Admin Access</span>}
    >
      {renderPage()}
    </CasinoSidebarLayout>
  );
}
