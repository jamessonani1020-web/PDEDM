import { create } from "zustand";

interface SidebarState {
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  isCollapsed: false,
  setIsCollapsed: (val) => set({ isCollapsed: val }),
}));
