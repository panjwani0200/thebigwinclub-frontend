import { useMemo, useState } from "react";
import CasinoSidebarLayout from "../components/layout/CasinoSidebarLayout";
import Users from "./superadmin/Users";
import SeedCoins from "./superadmin/SeedCoins";
import WalletTransfer from "./superadmin/WalletTransfer";
import WalletBalance from "./superadmin/WalletBalance";
import Transactions from "./superadmin/Transactions";
import Games from "./superadmin/Games";
import AdminDashboard from "./admin/Dashboard";
import CreateClient from "./admin/CreateClient";
import SeedClient from "./admin/SeedClient";
import Clients from "./admin/Clients";
import Customers from "./admin/Customers";
import CustomerBets from "./admin/CustomerBets";
import ProfitLoss from "./admin/ProfitLoss";
import GameControl from "./admin/GameControl";
import WithdrawClient from "./admin/WithdrawClient";
import WithdrawLogs from "./admin/WithdrawLogs";
import DepositLogs from "./admin/DepositLogs";
import MatkaResults from "./admin/MatkaResults";
import PersonalGameControl from "./admin/PersonalGameControl";

export default function SuperAdmin() {
  const [active, setActive] = useState("dashboard");

  const menuItems = useMemo(
    () => [
      { key: "dashboard", label: "Global Dashboard" },
      { key: "users", label: "Users" },
      { key: "seedCoins", label: "Seed Coins" },
      { key: "walletTransfer", label: "Wallet Transfer" },
      { key: "walletBalance", label: "Wallet Balance" },
      { key: "transactions", label: "Transactions" },
      { key: "games", label: "Global Games" },
      { key: "createClient", label: "Create Client" },
      { key: "seedClient", label: "Seed Client" },
      { key: "clients", label: "Clients" },
      { key: "customers", label: "Customers" },
      { key: "customerBets", label: "Customer Bets" },
      { key: "profitLoss", label: "Profit / Loss" },
      { key: "withdrawClient", label: "Withdraw Client" },
      { key: "withdrawLogs", label: "Withdraw Logs" },
      { key: "depositLogs", label: "Deposit Logs" },
      { key: "matkaResults", label: "Matka Results" },
      { key: "gameControl", label: "Game Control" },
      { key: "personalGameControl", label: "Personal Game Control" },
    ],
    []
  );

  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  const renderPage = () => {
    if (active === "dashboard") return <AdminDashboard />;
    if (active === "users") return <Users />;
    if (active === "seedCoins") return <SeedCoins />;
    if (active === "walletTransfer") return <WalletTransfer />;
    if (active === "walletBalance") return <WalletBalance />;
    if (active === "transactions") return <Transactions />;
    if (active === "games") return <Games />;
    if (active === "createClient") return <CreateClient />;
    if (active === "seedClient") return <SeedClient />;
    if (active === "clients") return <Clients />;
    if (active === "customers") return <Customers />;
    if (active === "customerBets") return <CustomerBets />;
    if (active === "profitLoss") return <ProfitLoss />;
    if (active === "withdrawClient") return <WithdrawClient />;
    if (active === "withdrawLogs") return <WithdrawLogs />;
    if (active === "depositLogs") return <DepositLogs />;
    if (active === "matkaResults") return <MatkaResults />;
    if (active === "gameControl") return <GameControl />;
    if (active === "personalGameControl") return <PersonalGameControl />;
    return <AdminDashboard />;
  };

  return (
    <CasinoSidebarLayout
      roleLabel="Super Admin"
      menuItems={menuItems}
      activeKey={active}
      onSelect={setActive}
      onLogout={logout}
      headerTitle="Super Admin Command"
      headerSubtitle="Global governance, wallet authority, and market control"
      headerRight={<span className="casino-pill">Super Admin</span>}
    >
      {renderPage()}
    </CasinoSidebarLayout>
  );
}
