export type TeamType = {
  team_id: number;
  team_name: string;
  team_short_name: string;
  team_color: string;
};

export type StadiumType = {
  stadium_id: number;
  stadium_name: string;
  stadium_short_name: string;
  latitude: number;
  longitude: number;
};

export type StadiumInfoType = {
  name: string;
  stadium_id: number;
  distance: number;
  match_id: number;
};
