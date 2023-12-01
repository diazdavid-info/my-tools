import { create } from "zustand";

interface PageState {
  page: number
  setPage: (by: number) => void
  increasePage: () => void
  decreasePage: () => void
}

export const usePageStore = create<PageState>((set) => ({
  page: 0,
  setPage: (newPage: number) => {
    return set({ page: newPage });
  },
  increasePage: () => set((state) => ({ page: state.page + 1 })),
  decreasePage: () => set((state) => ({ page: state.page - 1 }))
}));
