import { create } from 'zustand';

const useBottomTabState = create<{ isOpen: boolean; update: () => void }>(
  set => ({
    isOpen: false,
    update: () => set(prev => ({ isOpen: !prev.isOpen })),
  }),
);

export { useBottomTabState };
