type UserStoreType = {
  uniqueId: string; // 기기 고유 ID 로 로그인 대체
  setUniqueId: (uniqueId: string) => void;
  teamId: number;
  setTeamId: (id: number) => void;
  userName: string;
  setUserName: (userName: string) => void;
};

type ViewedHomeAwayType = {
  home: number;
  away: number;
};

type ViewedMatchType = {
  byMonth: ViewedHomeAwayType;
  bySeason: ViewedHomeAwayType;
  rate: {
    win: number;
    lose: number;
    draw: number;
  };
};
type ViewedMatchStoreType = {
  viewedMatch: ViewedMatchType;
  setViewedMatch: (match: ViewedMatchType) => void;
};

export type { UserStoreType, ViewedMatchStoreType, ViewedMatchType };
