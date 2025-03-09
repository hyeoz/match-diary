export type RecordType = {
  records_id?: number;
  user_id: string;
  match_id?: number;
  stadium_id?: number;
  date: string;
  image: string | null;
  user_note: string;
};

export type TempRecordImageType = { uri: string; type?: string; name: string };
export type TempRecordType = {
  records_id?: number;
  user_id: string;
  date: string;
  image: TempRecordImageType | string | null;
  user_note: string;
  stadium_id?: number;
};
