import { create } from 'zustand';

const useBottomTabState = create<{ isOpen: boolean; update: () => void }>(
  set => ({
    isOpen: false,
    update: () => set(prev => ({ isOpen: !prev.isOpen })),
  }),
);

const useTabHistory = create<{
  history: string[];
  accumulate: (key: string) => void;
}>(set => ({
  history: [],
  accumulate: key => set(prev => ({ history: [...prev.history, key] })),
}));

const useMyState = create<{
  team: string;
  setTeam: (team: string) => void;
  nickname: string;
  setNickname: (nickname: string) => void;
}>(set => ({
  team: 'SSG',
  nickname: '',
  setTeam: (team: string) => set(() => ({ team })),
  setNickname: (nickname: string) => set(() => ({ nickname })),
}));

export { useBottomTabState, useTabHistory, useMyState };
