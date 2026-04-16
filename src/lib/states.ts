import { create } from "zustand";

export const useTheme = create<{ isDark: boolean; toggle: () => void }>(
  (set) => ({
    isDark: true,
    toggle: () =>
      set((state) => {
        const classes = document.querySelector("#root")!.classList;
        classes.toggle("dark");
        return { isDark: !state.isDark };
      }),
  }),
);
