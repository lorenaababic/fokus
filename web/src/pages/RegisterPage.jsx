import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
  const [form, setForm] = useState({ email: "", password: "", firstName: "", lastName: "" });
  const [error, setError] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await register(form.email, form.password, form.firstName, form.lastName);
      navigate("/");
    } catch (err) {
      setError(err.response?.status === 409 ? "Email je već zauzet." : "Greška pri registraciji.");
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
          <label className="label">Ime</label>
          <input name="firstName" className="input" value={form.firstName}
            onChange={handleChange} required />
          <label className="label">Prezime</label>
          <input name="lastName" className="input" value={form.lastName}
            onChange={handleChange} />
          <label className="label">Email</label>
          <input name="email" type="email" className="input" value={form.email}
            onChange={handleChange} required />
          <label className="label">Lozinka</label>
          <input name="password" type="password" className="input" value={form.password}
            onChange={handleChange} required />
          {error && <p className="error-text">{error}</p>}
          <button type="submit" className="btn btn-primary btn-block">Registriraj se</button>
        </form>
      </div>
      <p className="muted" style={{ textAlign: "center" }}>
        Već imaš račun? <Link to="/login">Prijavi se</Link>
      </p>
    </div>
  );
}