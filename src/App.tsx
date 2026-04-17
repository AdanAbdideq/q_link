import { useState } from "react";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { useAppStore } from "./store/appStore";

import LandingPage from "./sections/LandingPage";
import AuthModal from "./components/Authmodal";

// dashboards
import CustomerDashboard from "./sections/customer/CustomerDashboard";
import ServiceSelection from "./sections/customer/ServiceSelection";
import ProviderSelection from "./sections/customer/ProviderSelection";
import BookingFlow from "./sections/customer/BookingFlow";
import CustomerBookings from "./sections/customer/CustomerBookings";

import ProviderDashboard from "./sections/provider/ProviderDashboard";
import ServiceManagement from "./sections/provider/ServiceManagement";
import ProviderBookings from "./sections/provider/ProviderBookings";
import QRScanner from "./sections/provider/QRScanner";

import AdminDashboard from "./sections/admin/AdminDashboard";
import ProviderApprovals from "./sections/admin/ProviderApprovals";
import UserManagement from "./sections/admin/UserManagement";
import Announcements from "./sections/admin/Announcements";
import PlatformAnalytics from "./sections/admin/PlatformAnalytics";

export type UserRole = "customer" | "provider" | "admin";

function AppInner() {
  const { profile, loading, signOut } = useAuth();

  const {
    currentView,
    selectedServiceId,
    selectedProviderId,
    navigate,
    setSelectedService,
    setSelectedProvider,
    resetBookingFlow,
    resetAll,
  } = useAppStore();

  // modal control
  const [showAuth, setShowAuth] = useState(false);

  const handleLogout = async () => {
    await signOut();
    resetAll();
  };

  // loading
  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#94A3B8" }}>Loading...</p>
      </div>
    );
  }

  // NOT LOGGED IN
  if (!profile) {
    return (
      <>
        <LandingPage onSelectRole={() => setShowAuth(true)} />

        {showAuth && (
          <AuthModal onClose={() => setShowAuth(false)} />
        )}

        <Toaster position="top-center" richColors />
      </>
    );
  }

  // LOGGED IN
  const role = profile.role as UserRole;

  return (
    <>
      {role === "customer" && (
        <>
          {currentView === "dashboard" && (
            <CustomerDashboard onLogout={handleLogout} onNavigate={navigate} />
          )}

          {currentView === "services" && (
            <ServiceSelection
              onBack={() => navigate("dashboard")}
              onSelectService={(id) => {
                setSelectedService(id);
                navigate("providers");
              }}
            />
          )}

          {currentView === "providers" && selectedServiceId && (
            <ProviderSelection
              serviceId={selectedServiceId}
              onBack={() => navigate("services")}
              onSelectProvider={(id) => {
                setSelectedProvider(id);
                navigate("booking");
              }}
            />
          )}

          {currentView === "booking" &&
            selectedServiceId &&
            selectedProviderId && (
              <BookingFlow
                serviceId={selectedServiceId}
                providerId={selectedProviderId}
                onBack={() => navigate("providers")}
                onComplete={resetBookingFlow}
              />
            )}

          {currentView === "bookings" && (
            <CustomerBookings onBack={() => navigate("dashboard")} />
          )}
        </>
      )}

      {role === "provider" && (
        <>
          {currentView === "dashboard" && (
            <ProviderDashboard onLogout={handleLogout} onNavigate={navigate} />
          )}
          {currentView === "services" && (
            <ServiceManagement onBack={() => navigate("dashboard")} />
          )}
          {currentView === "bookings" && (
            <ProviderBookings onBack={() => navigate("dashboard")} />
          )}
          {currentView === "scanner" && (
            <QRScanner onBack={() => navigate("dashboard")} />
          )}
        </>
      )}

      {role === "admin" && (
        <>
          {currentView === "dashboard" && (
            <AdminDashboard onLogout={handleLogout} onNavigate={navigate} />
          )}
          {currentView === "approvals" && (
            <ProviderApprovals onBack={() => navigate("dashboard")} />
          )}
          {currentView === "users" && (
            <UserManagement onBack={() => navigate("dashboard")} />
          )}
          {currentView === "announcements" && (
            <Announcements onBack={() => navigate("dashboard")} />
          )}
          {currentView === "analytics" && (
            <PlatformAnalytics onBack={() => navigate("dashboard")} />
          )}
        </>
      )}

      <Toaster position="top-center" richColors />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
