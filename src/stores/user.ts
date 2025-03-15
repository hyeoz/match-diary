import { create } from 'zustand';

import {
  UserStoreType,
  ViewedMatchStoreType,
  ViewedMatchType,
} from '@/type/store';
import { INIT_COUNT_DATA } from '@/utils/STATIC_DATA';

// 현재 유저 정보
const useUserState = create<UserStoreType>(set => ({
  uniqueId: '',
  setUniqueId: (uniqueId: string) => set(() => ({ uniqueId })),
  teamId: 1,
  setTeamId: (id: number) => set(() => ({ teamId: id })),
  userName: '',
  setUserName: (userName: string) => set(() => ({ userName })),
}));

// 총 직관 기록 정보
const useViewedMatchState = create<ViewedMatchStoreType>(set => ({
  viewedMatch: INIT_COUNT_DATA,
  setViewedMatch: (match: ViewedMatchType) => ({ viewedMatch: match }),
}));

export { useUserState, useViewedMatchState };
