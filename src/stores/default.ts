import { RecordType } from '@/type/default';
import { RESET_RECORD } from '@/utils/STATIC_DATA';
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

// NOTE 가장 최근 선택된 경기
const useSelectedRecordState = create<{
  recordState: RecordType;
  setRecordState: (record: RecordType) => void;
}>(set => ({
  recordState: RESET_RECORD,
  setRecordState: (record: RecordType) => set(() => ({ recordState: record })),
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

export {
  useBottomTabState,
  useTabHistory,
  useMyState,
  useSelectedRecordState,
  useDuplicatedRecordState,
};
