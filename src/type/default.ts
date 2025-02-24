import { Dispatch, SetStateAction } from 'react';
import { ImageOrVideo } from 'react-native-image-crop-picker';

// TODO Root Stack 타입
export type RootStackListType = {
  Main: any;
  Calendar: any;
  Contact: any;
  Write: any;
  History: any;
  More: any;
  SignIn: any;
};

// TODO Tab 타입
export type TabListType = {
  Calendar: any;
  Main: any;
  More: any;
};

// 기록 상세 컴포넌트 타입
export type DetailPropsType = {
  // image: ImageOrVideo | null;
  // setImage: React.Dispatch<React.SetStateAction<ImageOrVideo | null>>;
  // memo: string;
  // setMemo: React.Dispatch<React.SetStateAction<string>>;
  // selectedStadium: string;
  // setSelectedStadium: React.Dispatch<React.SetStateAction<string>>;
  // records: RecordType[];
  // setRecords: Dispatch<SetStateAction<RecordType[]>>;
  isEdit: boolean;
  setIsEdit: Dispatch<SetStateAction<boolean>>;
  setIsVisible: Dispatch<SetStateAction<boolean>>;
};

// 경기 일정 API 리스폰스 타입
export type MatchDataType = {
  id: number;
  date: string; // 2025-03-22T00:00:00.000Z
  time: string; // 14:00:00
  home: number; // 홈팀 ID
  away: number; // 원정 팀 ID
  stadium: number; // 경기장 ID
  home_score: number; // 홈 팀 점수
  away_score: number; // 원정 팀 점수
  memo: string | null;
};

// 더보기 페이지 타입
export type DefaultListItemType = {
  key: number;
  label: string;
};

export type TeamListItemType = DefaultListItemType & {
  icon: React.JSX.Element;
};

export type MoreListItemType = DefaultListItemType & {
  onPressAction?: () => void;
};

// 커뮤니티 글 타입
export type CommunityItemType = {
  createdAt: string;
  nickname: string;
  content: string;
  stadium: string;
  team: string;
  publishedAt: string;
  updatedAt: string;
};

export type CoordinateType = { lat: number; lon: number };

export type RecordType = {
  id: string;
  date: string;
  image: ImageOrVideo | null;
  memo: string;
  selectedStadium: string;
};
