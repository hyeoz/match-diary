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

export const gameStatusCaption = (game: ScheduledGame) => {
  if (
    game.status === 'final' &&
    game.awayScore !== null &&
    game.homeScore !== null
  ) {
    return `${game.awayScore} : ${game.homeScore} · 경기 종료 · ${game.stadium.name}`;
  }
  if (game.status === 'canceled') {
    return `경기 취소${game.memo ? ` · ${game.memo}` : ''} · ${
      game.stadium.name
    }`;
  }
  if (game.status === 'postponed') {
    return `경기 연기${game.memo ? ` · ${game.memo}` : ''} · ${
      game.stadium.name
    }`;
  }
  return `${game.time} · ${game.stadium.name}`;
};
