import { create } from 'zustand';

import { RecordType } from '@/type/default';
import { RESET_RECORD } from '@/utils/STATIC_DATA';
import { MatchDataType } from '@/type/match';

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

// NOTE 가장 최근 선택된 경기
const useSelectedRecordState = create<{
  recordState: RecordType;
  setRecordState: (record: RecordType) => void;
}>(set => ({
  recordState: RESET_RECORD,
  setRecordState: (record: RecordType) => set(() => ({ recordState: record })),
}));

const useCarouselIndexState = create<{
  carouselIndexState: number;
  setCarouselIndexState: (index: number) => void;
}>(set => ({
  carouselIndexState: 0,
  setCarouselIndexState: (index: number) =>
    set(() => ({ carouselIndexState: index })),
}));

// NOTE 같은 날 중복된 경기
const useDuplicatedRecordState = create<{
  recordsState: RecordType[];
  setRecordsState: (record: RecordType[]) => void;
}>(set => ({
  recordsState: [RESET_RECORD],
  setRecordsState: (records: RecordType[]) =>
    set(() => ({ recordsState: records })),
}));

// 경기 데이터 관리
const useMatchesState = create<{
  matchesState: MatchDataType[];
  setMatchesState: (matches: MatchDataType[]) => void;
}>(set => ({
  matchesState: [],
  setMatchesState: (matches: MatchDataType[]) =>
    set(() => ({ matchesState: matches })),
}));

export {
  useBottomTabState,
  useTabHistory,
  useSelectedRecordState,
  useCarouselIndexState,
  useDuplicatedRecordState,
  useMatchesState,
};
