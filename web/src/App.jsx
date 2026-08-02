import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Sidebar from "./components/Sidebar";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import ScenarioFormPage from "./pages/ScenarioFormPage";
import ScenarioDetailPage from "./pages/ScenarioDetailPage";
import CheckInPage from "./pages/CheckInPage";
import SettingsPage from "./pages/SettingsPage";
import VisionBoardOverviewPage from "./pages/VisionBoardOverviewPage";
import AnalyticsOverviewPage from "./pages/AnalyticsOverviewPage";

function PrivateRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
          <Route path="/checkin" element={<PrivateRoute><CheckInPage /></PrivateRoute>} />
          <Route path="/scenarios/new" element={<PrivateRoute><ScenarioFormPage /></PrivateRoute>} />
          <Route path="/scenarios/:id" element={<PrivateRoute><ScenarioDetailPage /></PrivateRoute>} />
          <Route path="/scenarios/:id/edit" element={<PrivateRoute><ScenarioFormPage /></PrivateRoute>} />
          <Route path="/postavke" element={<PrivateRoute><SettingsPage /></PrivateRoute>} />
          <Route path="/visionboard" element={<PrivateRoute><VisionBoardOverviewPage /></PrivateRoute>} />
          <Route path="/analitika" element={<PrivateRoute><AnalyticsOverviewPage /></PrivateRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}