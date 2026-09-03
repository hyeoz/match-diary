import { teamById } from './data';
import type { ScheduledGame } from './storage/types';

export const gameIncludesTeam = (game: ScheduledGame, teamId: number) =>
  game.homeTeamId === teamId || game.awayTeamId === teamId;

export const opponentForGame = (game: ScheduledGame, teamId: number) =>
  teamById(game.homeTeamId === teamId ? game.awayTeamId : game.homeTeamId);

export const matchupForGame = (game: ScheduledGame) =>
  `${teamById(game.awayTeamId).shortName} vs ${
    teamById(game.homeTeamId).shortName
  }`;
