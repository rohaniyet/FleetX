import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      <div className="bg-slate-800/90 backdrop-blur-xl p-10 rounded-2xl shadow-2xl w-96 border border-slate-700">
        <h1 className="text-3xl font-bold text-center mb-2">
          FleetX ERP
        </h1>
        <p className="text-center text-slate-400 mb-8">
          Secure Admin Access
        </p>

        <input
          type="email"
          placeholder="Admin Email"
          className="w-full p-3 mb-4 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 mb-6 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 transition-all duration-300 p-3 rounded-lg font-bold shadow-lg"
        >
          {loading ? "Authenticating..." : "Login"}
        </button>

        <p className="text-center text-xs text-slate-500 mt-6">
          Developed by Waqas Gilani
        </p>
      </div>
    </div>
  );
}
