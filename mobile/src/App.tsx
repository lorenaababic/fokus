import { Redirect, Route, useLocation } from "react-router-dom";
import {
  IonApp, IonRouterOutlet, IonTabs, IonTabBar, IonTabButton,
  IonIcon, IonLabel, setupIonicReact
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import {
  homeOutline, flagOutline, imagesOutline, statsChartOutline, personOutline
} from "ionicons/icons";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import HomeTab from "./pages/HomeTab";
import ScenariosTab from "./pages/ScenariosTab";
import VisionTab from "./pages/VisionTab";
import ProgressTab from "./pages/ProgressTab";
import ProfileTab from "./pages/ProfileTab";

import "@ionic/react/css/core.css";
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";
import "./theme/variables.css";

setupIonicReact();

function AppTabs() {
  const { user } = useAuth();
  const location = useLocation();

  if (location.pathname === "/login") return null;
  if (!user) return <Redirect to="/login" />;

  return (
    <IonTabs>
      <IonRouterOutlet>
        <Route exact path="/home" component={HomeTab} />
        <Route exact path="/scenarios" component={ScenariosTab} />
        <Route exact path="/vision" component={VisionTab} />
        <Route exact path="/progress" component={ProgressTab} />
        <Route exact path="/profile" component={ProfileTab} />
        <Route exact path="/checkin">
          <Redirect to="/home" />
        </Route>
        <Route exact path="/">
          <Redirect to="/home" />
        </Route>
      </IonRouterOutlet>
      <IonTabBar slot="bottom">
        <IonTabButton tab="home" href="/home">
          <IonIcon icon={homeOutline} />
          <IonLabel>Home</IonLabel>
        </IonTabButton>
        <IonTabButton tab="scenarios" href="/scenarios">
          <IonIcon icon={flagOutline} />
          <IonLabel>Ciljevi</IonLabel>
        </IonTabButton>
        <IonTabButton tab="vision" href="/vision">
          <IonIcon icon={imagesOutline} />
          <IonLabel>Vision</IonLabel>
        </IonTabButton>
        <IonTabButton tab="progress" href="/progress">
          <IonIcon icon={statsChartOutline} />
          <IonLabel>Napredak</IonLabel>
        </IonTabButton>
        <IonTabButton tab="profile" href="/profile">
          <IonIcon icon={personOutline} />
          <IonLabel>Profil</IonLabel>
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  );
}

export default function App() {
  return (
    <IonApp>
      <AuthProvider>
        <IonReactRouter>
          <Route path="/login" component={LoginPage} />
          <Route path="/" component={AppTabs} />
        </IonReactRouter>
      </AuthProvider>
    </IonApp>
  );
}