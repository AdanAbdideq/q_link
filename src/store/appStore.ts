import { create } from "zustand";

type AnyView = "dashboard" | "services" | "providers" | "booking" | "bookings" | "scanner" | "approvals" | "users" | "announcements" | "analytics";

interface AppState {
  currentView: AnyView;
  selectedServiceId: string | null;
  selectedProviderId: string | null;
  navigate: (view: AnyView) => void;
  setSelectedService: (id: string | null) => void;
  setSelectedProvider: (id: string | null) => void;
  resetBookingFlow: () => void;
  resetAll: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentView: "dashboard",
  selectedServiceId: null,
  selectedProviderId: null,
  navigate: (view) => set({ currentView: view }),
  setSelectedService: (id) => set({ selectedServiceId: id }),
  setSelectedProvider: (id) => set({ selectedProviderId: id }),
  resetBookingFlow: () => set({ selectedServiceId: null, selectedProviderId: null, currentView: "bookings" }),
  resetAll: () => set({ currentView: "dashboard", selectedServiceId: null, selectedProviderId: null }),
}));
