import { create } from 'zustand';

const useBottomTabState = create<{ isOpen: boolean; update: () => void }>(
  set => ({
    isOpen: false,
    update: () => set(prev => ({ isOpen: !prev.isOpen })),
  }),
);

// TODO 마이팀도 유저정보처럼 계속 유지되어야 하기때문에 storage 로 관리하기
const useMyState = create<{ team: string; setTeam: (team: string) => void }>(
  set => ({
    // team: '',
    team: 'SSG',
    setTeam: (team: string) => set(() => ({ team })),
  }),
);

export { useBottomTabState, useMyState };