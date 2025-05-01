export type CommunityLogType = {
  log_id: number;
  user_id: string;
  stadium_id: number;
  date: string;
  user_post: string;
};

export type CommunityNoticeType = {
  notice_id: number;
  notice: string;
  stadium_id: number;
  notice_type: string;
};
