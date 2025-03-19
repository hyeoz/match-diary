export type TempRecordImageType = { uri: string; type?: string; name: string };

export type RecordType = {
  user_id: string;
  records_id?: number;
  match_id?: number | null;
  stadium_id?: number;
  date: string;
  image: TempRecordImageType | string | null;
  ticket_image?: TempRecordImageType | string | null;
  user_note: string;
};
