import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Welcome from "./pages/Welcome";
import Dashboard from "./pages/Dashboard";
import PatientDetail from "./pages/PatientDetail";
import NewPatient from "./pages/NewPatient";
import Evolution from "./pages/Evolution";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Onboarding from "./pages/Onboarding";
import HospitalDashboard from "./pages/HospitalDashboard";
import Demo from "./pages/Demo";
import EnterpriseDashboard from "./pages/EnterpriseDashboard";
import Support from "./pages/Support";
import InstallApp from "./pages/InstallApp";
import AdminPanel from "./pages/AdminPanel";
import JoinTeam from "./pages/JoinTeam";
import { useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { TigerReactionProvider } from "@/components/TigerReaction";
import { I18nSync } from "@/components/I18nSync";
import { OnboardingTutorial } from "@/components/OnboardingTutorial";
import { useLocation } from "wouter";
import { isFeatureEnabled } from "@/hooks/useFeatureFlag";

function Router() {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }
  
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/welcome" component={Welcome} />
      <Route path="/demo" component={Demo} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/patient/new" component={NewPatient} />
      <Route path="/patient/:id" component={PatientDetail} />
      <Route path="/evolution/:admissionId" component={Evolution} />
      {isFeatureEnabled('analytics') && <Route path="/analytics" component={Analytics} />}
      <Route path="/settings" component={Settings} />
      <Route path="/onboarding" component={Onboarding} />
      {isFeatureEnabled('hospitalDashboard') && <Route path="/hospital/:hospitalId" component={HospitalDashboard} />}
      {isFeatureEnabled('enterprise') && <Route path="/enterprise" component={EnterpriseDashboard} />}
      <Route path="/support" component={Support} />
      <Route path="/install" component={InstallApp} />
      <Route path="/admin" component={AdminPanel} />
      <Route path="/join/:code" component={JoinTeam} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  
  // Check for pending join redirect after login
  useEffect(() => {
    if (isAuthenticated) {
      const joinRedirect = sessionStorage.getItem('sbar-join-redirect');
      if (joinRedirect) {
        sessionStorage.removeItem('sbar-join-redirect');
        setLocation(joinRedirect);
      }
    }
  }, [isAuthenticated, setLocation]);
  
  const handleOnboardingComplete = () => {
    // Após tutorial de slides, ir para o dashboard
    if (isAuthenticated) {
      setLocation("/dashboard");
    } else {
      setLocation("/");
    }
  };
  
  return (
    <>
      <Toaster richColors position="top-center" />
      <I18nSync />
      <OnboardingTutorial onComplete={handleOnboardingComplete} />
      <Router />
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TigerReactionProvider>
          <TooltipProvider>
            <AppContent />
          </TooltipProvider>
        </TigerReactionProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
