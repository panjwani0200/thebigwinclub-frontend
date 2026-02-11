import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function LoginForm({
  username,
  password,
  setUsername,
  setPassword,
  handleLogin,
  loading,
  error,
}) {
  return (
    <div className="w-full max-w-md rounded-3xl border border-slate-700/40 bg-slate-950/85 p-7 shadow-[0_22px_44px_rgba(2,6,23,0.55)] backdrop-blur-md">
      <div className="mb-8 text-center">
        <div className="font-display text-3xl font-extrabold text-white">BigWinClub</div>
        <div className="mt-1 text-sm text-slate-400">Secure login to your gaming account</div>
      </div>

      <form onSubmit={handleLogin}>
        {error ? (
          <div className="mb-4 rounded-lg border border-red-500/50 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </div>
        ) : null}

        <label className="mb-2 block text-sm font-semibold text-slate-300">Username</label>
        <input
          type="text"
          placeholder="Enter username or email"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          required
          className="mb-4 w-full rounded-xl border border-slate-700/50 bg-slate-900/80 px-4 py-3 text-white placeholder:text-slate-500 focus:border-casino-gold/70 focus:outline-none focus:ring-2 focus:ring-casino-gold/25"
        />

        <label className="mb-2 block text-sm font-semibold text-slate-300">Password</label>
        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
          className="mb-3 w-full rounded-xl border border-slate-700/50 bg-slate-900/80 px-4 py-3 text-white placeholder:text-slate-500 focus:border-casino-gold/70 focus:outline-none focus:ring-2 focus:ring-casino-gold/25"
        />

        <div className="mb-6 text-right">
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="text-sm text-slate-400 transition hover:text-casino-gold"
          >
            Forgot password?
          </a>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-b from-casino-gold to-casino-goldDeep px-4 py-3 font-bold text-slate-950 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      const res = await api.post("/api/auth/login", { email: username, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("userId", res.data.userId);

      if (res.data.role === "SUPER_ADMIN") navigate("/super-admin");
      else if (res.data.role === "ADMIN") navigate("/admin");
      else if (res.data.role === "CLIENT") navigate("/client");
      else if (res.data.role === "CUSTOMER") navigate("/customer");
      else setError("Invalid role configuration");
    } catch {
      setError("Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#030817] pb-16 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_12%,rgba(245,197,66,0.22),transparent_42%),radial-gradient(circle_at_84%_18%,rgba(59,130,246,0.22),transparent_40%),linear-gradient(160deg,#050b1b_0%,#0d1833_55%,#060d1f_100%)]" />
      <div className="relative z-10 flex min-h-screen w-full items-center justify-center px-4 py-10 lg:px-10">
        <LoginForm
          username={username}
          password={password}
          setUsername={setUsername}
          setPassword={setPassword}
          handleLogin={handleLogin}
          loading={loading}
          error={error}
        />
      </div>

      <footer className="fixed bottom-0 left-0 right-0 z-20 border-t border-slate-700/30 bg-[#020617]/90 px-4 py-3 text-center text-xs text-slate-400 backdrop-blur">
        &copy; {new Date().getFullYear()} BigWinClub. All Rights Reserved.
      </footer>
    </div>
  );
}
