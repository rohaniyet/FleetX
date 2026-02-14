import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: username,
      password: password,
    });

    if (error) {
      alert("Invalid credentials");
      return;
    }

    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-black flex items-center justify-center text-white">

      <div className="bg-slate-800/70 backdrop-blur-xl p-10 rounded-2xl shadow-2xl w-full max-w-md border border-slate-700">

        <h1 className="text-3xl font-bold text-center mb-6">
          FleetX ERP
        </h1>

        <form onSubmit={handleLogin} className="space-y-6">

          <input
            type="text"
            placeholder="Username"
            className="w-full p-3 rounded-lg bg-slate-900 border border-slate-600 focus:outline-none focus:border-blue-500"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 rounded-lg bg-slate-900 border border-slate-600 focus:outline-none focus:border-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 transition-all rounded-lg font-semibold shadow-lg"
          >
            Login
          </button>

        </form>

        <div className="mt-6 text-center text-sm text-slate-400">
          Developed by Waqas Gilani
        </div>

      </div>

    </div>
  );
}
