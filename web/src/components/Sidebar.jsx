import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutGrid, CheckCircle2, LogOut, BarChart3, Image, Settings, ChevronDown
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getScenarios } from "../api/scenarios";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path, tab) => {
    const params = new URLSearchParams(location.search);
    if (tab) {
      return "sidebar-link" +
        (location.pathname.startsWith("/scenarios/") && params.get("tab") === tab ? " active" : "");
    }
    return "sidebar-link" + (location.pathname === path ? " active" : "");
  };

  const goToScenarioTab = async (tab) => {
    const { data } = await getScenarios();
    if (data.length === 0) {
      navigate("/");
      return;
    }
    const active = data.find((s) => s.status === "ACTIVE") ?? data[0];
    navigate(`/scenarios/${active.id}?tab=${tab}`);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="sidebar">
      <Link to="/" style={{ textDecoration: "none" }}>
        <span className="sidebar-brand">
          <span className="sidebar-logo">🌿</span>
          FOKUS
        </span>
      </Link>

      <Link to="/" className={isActive("/")}>
        <LayoutGrid size={17} strokeWidth={1.8} /> Scenariji
      </Link>
      <Link to="/checkin" className={isActive("/checkin")}>
        <CheckCircle2 size={17} strokeWidth={1.8} /> Check-in
      </Link>
      <button className="sidebar-link" onClick={handleLogout}>
        <LogOut size={17} strokeWidth={1.8} /> Odjava
      </button>
      <button className={isActive(null, "analitika")} onClick={() => goToScenarioTab("analitika")}>
        <BarChart3 size={17} strokeWidth={1.8} /> Analitika
      </button>
    <Link to="/visionboard" className={isActive("/visionboard")}>
        <Image size={17} strokeWidth={1.8} /> Vision board
    </Link>
      <Link to="/postavke" className={isActive("/postavke")}>
        <Settings size={17} strokeWidth={1.8} /> Postavke
      </Link>

      <div className="sidebar-footer">
        <span className="sidebar-avatar">{user?.firstName?.[0] ?? "?"}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{user?.firstName}</div>
          <div className="small">Pregled profila</div>
        </div>
        <ChevronDown size={15} color="var(--text-muted)" />
      </div>
    </aside>
  );
}