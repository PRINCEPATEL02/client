import { useState } from "react";
import axios from "axios";
import "./LoginPage.css";

export default function LoginPage({ onLogin }) {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!userId || !password) {
      setError("Please enter both User ID and Password.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5001/api/auth/login", { userId, password });
      localStorage.setItem("token", res.data.token);
      onLogin(res.data.userId);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <div className="container">
      <h2 className="title">Login</h2>
      {error && <div className="errorMessage">{error}</div>}
      <input
        className="input"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
        placeholder="User ID"
        autoComplete="username"
        onKeyDown={handleKeyDown}
        disabled={loading}
      />
      <input
        className="input"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        type="password"
        autoComplete="current-password"
        onKeyDown={handleKeyDown}
        disabled={loading}
      />
      <button className="button" onClick={handleLogin} disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </button>
    </div>
  );
}
