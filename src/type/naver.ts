export type NaverDirectionsResponseType = {
  code: number;
  message: string;
  currentDateTime: string;
  route: { [key: string]: NaverRouteType[] };
};

type NaverRouteType = {
  guide: NaverGuideType[];
  summary: NaverSummaryType;
  path: [number, number][];
  section: NaverSectionType;
};
type NaverGuideType = {
  pointIndex: number;
  type: number;
  instruction: string;
  distance: number;
  duration: number;
};
type NaverSummaryType = {
  start: NaverResponsePositionType;
  goal: NaverResponsePositionType;
  waypoints: NaverResponsePositionType;
  distance: number;
  duration: number;
  bbox: number[];
  tollFare: number;
  taxiFare: number;
  fuelPrice: number;
};
type NaverResponsePositionType = {
  location: number[];
  dir: number;
  distance: number;
  duration: number;
  pointIndex: number;
};
type NaverSectionType = {
  pointIndex: number;
  pointCount: number;
  distance: number;
  name: number;
  congestion: number;
  speed: number;
};
