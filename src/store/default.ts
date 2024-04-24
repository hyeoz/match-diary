import { create } from 'zustand';

const useBottomTabState = create<{ isOpen: boolean; update: () => void }>(
  set => ({
    isOpen: false,
    update: () => set(prev => ({ isOpen: !prev.isOpen })),
  }),
);

const useMyState = create<{ team: string; setTeam: (team: string) => void }>(
  set => ({
    // team: '',
    team: 'SSG 랜더스',
    setTeam: (team: string) => set(() => ({ team })),
  }),
);

export { useBottomTabState, useMyState };
