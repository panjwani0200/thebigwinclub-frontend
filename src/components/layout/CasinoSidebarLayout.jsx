import CasinoFooter from "./CasinoFooter";

export default function CasinoSidebarLayout({
  roleLabel,
  title = "BigWinClub",
  menuItems,
  activeKey,
  onSelect,
  onLogout,
  headerTitle,
  headerSubtitle,
  headerRight,
  children,
}) {
  return (
    <div className="casino-shell">
      <aside className="casino-sidebar">
        <div className="casino-brand">
          <div className="casino-brand-title">{title}</div>
        </div>
        <div className="casino-brand-sub">{roleLabel}</div>

        <nav className="casino-menu mt-4">
          {menuItems.map((item) => (
            <button
              key={item.key}
              className={`casino-menu-btn ${activeKey === item.key ? "is-active" : ""}`}
              onClick={() => onSelect(item.key)}
            >
              {item.label}
            </button>
          ))}
          <button className="casino-menu-btn casino-btn-danger mt-2" onClick={onLogout}>
            Logout
          </button>
        </nav>
      </aside>

      <section className="casino-main">
        <header className="casino-header">
          <div>
            <div className="casino-header-title">{headerTitle}</div>
            <div className="casino-header-sub">{headerSubtitle}</div>
          </div>
          <div>{headerRight}</div>
        </header>
        <main className="casino-content">
          <div className="casino-page">{children}</div>
        </main>
        <CasinoFooter />
      </section>
    </div>
  );
}
