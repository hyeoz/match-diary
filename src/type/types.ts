import { ImageOrVideo } from 'react-native-image-crop-picker';

// Root Stack 타입
export type RootStackListType = {
  Main: any;
  Calendar: any;
  Discover: any;
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
};

// 경기 일정 API 리스폰스 타입
export type MatchDataType = {
  away: string;
  createdAt: string;
  date: string;
  home: string;
  publishedAt: string;
  updatedAt: string;
};
