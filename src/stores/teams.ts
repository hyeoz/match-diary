import { TeamType } from '@/type/team';
import { create } from 'zustand';

const useTeamsState = create<{
  teams: TeamType[];
  setTeams: (teams: TeamType[]) => void;
}>(set => ({
  teams: [],
  setTeams: (teams: TeamType[]) => set(() => ({ teams: teams })),
}));

export { useTeamsState };
