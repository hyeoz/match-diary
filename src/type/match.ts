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

// 직관 예약 타입
export type MatchBookingType = {
  booking_id: number;
  date: string;
  user_id: string;
};
