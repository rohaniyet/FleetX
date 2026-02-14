import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes("access_token")) {
      supabase.auth.getSession().then(() => {});
    }
  }, []);

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Password updated successfully. You can now login.");
    }

    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>Reset Password</h2>
        <form onSubmit={handleReset}>
          <input
            type="password"
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
          />
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
        {message && <p>{message}</p>}
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#0f172a",
    color: "#fff",
  },
  card: {
    background: "#1e293b",
    padding: "40px",
    borderRadius: "12px",
    width: "350px",
    textAlign: "center",
  },
  input: {
    width: "100%",
    padding: "10px",
    margin: "10px 0",
    borderRadius: "6px",
    border: "none",
  },
  button: {
    width: "100%",
    padding: "10px",
    background: "#6366f1",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
};
