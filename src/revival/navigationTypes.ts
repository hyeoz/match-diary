export type RootStackParamList = {
  Splash: undefined;
  SignIn: undefined;
  Main: undefined;
  RecordEditor:
    | { date?: string; recordId?: string; gameId?: string }
    | undefined;
  RecordDetail: { recordId: string };
  NotificationSettings: undefined;
};

export type MainTabParamList = {
  Today: undefined;
  Calendar: undefined;
  Records: undefined;
  Map: undefined;
  Settings: undefined;
};
