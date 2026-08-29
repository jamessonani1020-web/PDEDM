import { create } from "zustand";

interface SelectionState {
  /** The selected NEO ID (from NASA NeoWs) */
  selectedNeoId: string | null;
  /** Display name of the selected asteroid */
  selectedNeoName: string | null;
  /** Set the currently selected asteroid */
  setSelected: (id: string, name: string) => void;
  /** Clear the selection (close the panel) */
  clearSelected: () => void;
}

export const useSelectionStore = create<SelectionState>((set) => ({
  selectedNeoId: null,
  selectedNeoName: null,
  setSelected: (id, name) =>
    set({
      selectedNeoId: id,
      selectedNeoName: name,
    }),
  clearSelected: () =>
    set({
      selectedNeoId: null,
      selectedNeoName: null,
    }),
}));
