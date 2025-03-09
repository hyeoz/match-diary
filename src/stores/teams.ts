import { StadiumType, TeamType } from '@/type/team';
import { create } from 'zustand';

const useTeamsState = create<{
  teams: TeamType[];
  setTeams: (teams: TeamType[]) => void;
}>(set => ({
  teams: [],
  setTeams: (teams: TeamType[]) => set(() => ({ teams: teams })),
}));

const useStadiumsState = create<{
  stadiums: StadiumType[];
  setStadiums: (stadiums: StadiumType[]) => void;
}>(set => ({
  stadiums: [],
  setStadiums: (stadiums: StadiumType[]) => set(() => ({ stadiums: stadiums })),
}));

export { useTeamsState, useStadiumsState };
