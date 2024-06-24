import { ImageOrVideo } from 'react-native-image-crop-picker';

// Root Stack 타입
export type RootStackListType = {
  Main: any;
  Calendar: any;
  Contact: any;
  Write: any;
  History: any;
  More: any;
};

// Tab 타입
export type TabListType = {
  Calendar: any;
  Main: any;
  More: any;
};

// 기록 상세 컴포넌트 타입
export type DetailPropsType = {
  image: ImageOrVideo | null;
  setImage: React.Dispatch<React.SetStateAction<ImageOrVideo | null>>;
  memo: string;
  setMemo: React.Dispatch<React.SetStateAction<string>>;
  setIsEdit: React.Dispatch<React.SetStateAction<boolean>>;
  setIsVisible: React.Dispatch<React.SetStateAction<boolean>>;
  selectedStadium: string;
  setSelectedStadium: React.Dispatch<React.SetStateAction<string>>;
};

// 경기 일정 API 리스폰스 타입
export type MatchDataType = {
  createdAt: string;
  date: string;
  time: string;
  home: string;
  away: string;
  homeScore?: number;
  awayScore?: number;
  stadium: string;
  memo: string;
  publishedAt: string;
  updatedAt: string;
};

// 더보기 페이지 타입
export type DefaultListItemType = {
  key: string;
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
