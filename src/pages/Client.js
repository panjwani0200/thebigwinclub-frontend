import { useMemo, useState } from "react";
import CasinoSidebarLayout from "../components/layout/CasinoSidebarLayout";
import Dashboard from "./client/Dashboard";
import CreateCustomer from "./client/CreateCustomer";
import SeedCustomer from "./client/SeedCustomer";
import CustomerBets from "./client/CustomerBets";
import WithdrawCustomer from "./client/WithdrawCustomer";
import MyCustomers from "./client/MyCustomers";
import ChangePassword from "./shared/ChangePassword";

export default function Client() {
  const [active, setActive] = useState("dashboard");

  const menuItems = useMemo(
    () => [
      { key: "dashboard", label: "Dashboard" },
      { key: "create", label: "Create Customer" },
      { key: "myCustomers", label: "My Customers" },
      { key: "seed", label: "Seed Customer" },
      { key: "withdraw", label: "Withdraw Customer" },
      { key: "bets", label: "Customer Bets" },
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
    if (active === "create") return <CreateCustomer />;
    if (active === "myCustomers") return <MyCustomers />;
    if (active === "seed") return <SeedCustomer />;
    if (active === "withdraw") return <WithdrawCustomer />;
    if (active === "bets") return <CustomerBets />;
    if (active === "changePassword") return <ChangePassword />;
    return <Dashboard />;
  };

  return (
    <CasinoSidebarLayout
      roleLabel="Client Panel"
      menuItems={menuItems}
      activeKey={active}
      onSelect={setActive}
      onLogout={logout}
      headerTitle="Client Hub"
      headerSubtitle="Customer operations, wallet control and betting oversight"
      headerRight={<span className="casino-pill">Client Access</span>}
    >
      {renderPage()}
    </CasinoSidebarLayout>
  );
}
