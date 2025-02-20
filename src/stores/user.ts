import { create } from 'zustand';

import {
  UserStoreType,
  ViewedMatchStoreType,
  ViewedMatchType,
} from '@/type/store';

// 현재 유저 정보
const useUserState = create<UserStoreType>(set => ({
  uniqueId: '',
  teamId: 1,
  setTeamId: (id: number) => set(() => ({ teamId: id })),
  userName: '',
  setUserName: (userName: string) => set(() => ({ userName })),
}));

// 총 직관 기록 정보
const useViewedMatchState = create<ViewedMatchStoreType>(set => ({
  viewedMatch: {
    byMonth: {
      home: 0,
      away: 0,
    },
    bySeason: {
      home: 0,
      away: 0,
    },
    rate: {
      win: 0,
      lose: 0,
      draw: 0,
    },
  },
  setViewedMatch: (match: ViewedMatchType) => ({ viewedMatch: match }),
}));

export { useUserState, useViewedMatchState };
