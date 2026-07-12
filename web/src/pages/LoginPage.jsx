import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      navigate("/");
    } catch {
      setError("Neispravan email ili lozinka.");
    }
  };

  return (
    <div className="page-narrow">
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <span className="sidebar-logo" style={{ width: 52, height: 52, fontSize: 26, borderRadius: 16 }}>🌿</span>
        <h1 style={{ marginTop: 14 }}>FOKUS</h1>
        <p className="muted">Plan. Track. Become.</p>
      </div>
      <div className="card">
        <form onSubmit={handleSubmit}>
          <label className="label">Email</label>
          <input type="email" className="input" value={email}
            onChange={(e) => setEmail(e.target.value)} required />
          <label className="label">Lozinka</label>
          <input type="password" className="input" value={password}
            onChange={(e) => setPassword(e.target.value)} required />
          {error && <p className="error-text">{error}</p>}
          <button type="submit" className="btn btn-primary btn-block">Prijavi se</button>
        </form>
      </div>
      <p className="muted" style={{ textAlign: "center" }}>
        Nemaš račun? <Link to="/register">Registriraj se</Link>
      </p>
    </div>
  );
}