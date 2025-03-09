import { Dispatch, SetStateAction } from 'react';
import { RecordType } from './record';

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
  records: RecordType[];
  setRecords: Dispatch<SetStateAction<RecordType[]>>;
  isEdit: boolean;
  setIsEdit: Dispatch<SetStateAction<boolean>>;
  setIsVisible: Dispatch<SetStateAction<boolean>>;
};

// 더보기 페이지 타입
export type DefaultListItemType = {
  key: number;
  label: string;
};
export type StringListItemType = {
  key: string;
  label: string;
};

export type TeamListItemType = DefaultListItemType & {
  icon: React.JSX.Element;
};

export type MoreListItemType = StringListItemType & {
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
