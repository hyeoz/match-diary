/* eslint-disable no-bitwise -- SHA-256 operates on 32-bit words. */
import type { Game, Stadium } from './storage/types';

export const SCHEDULE_BASE_URL = 'https://hyeoz.github.io/match-diary-data';

type ManifestSeason = {
  season: number;
  path: string;
  sha256: string;
  dataVersion: string;
  gameCount: number;
  generatedAt: string;
};

type ScheduleManifest = {
  schemaVersion: number;
  currentSeason: number;
  generatedAt: string;
  seasons: ManifestSeason[];
};

type RemoteGame = Omit<Game, 'sourceVersion'>;

type SeasonSchedule = {
  schemaVersion: number;
  season: number;
  dataVersion: string;
  generatedAt: string;
  stadiums: Stadium[];
  games: RemoteGame[];
};

export type ScheduleUpdate = {
  stadiums: Stadium[];
  games: Game[];
  dataVersion: string;
};

export type ScheduleFetchResponse = {
  ok: boolean;
  status: number;
  text: () => Promise<string>;
};

export type ScheduleFetcher = (
  url: string,
  init?: { headers?: Record<string, string>; signal?: AbortSignal },
) => Promise<ScheduleFetchResponse>;

const utf8Bytes = (value: string): number[] => {
  const bytes: number[] = [];
  for (let index = 0; index < value.length; index += 1) {
    let codePoint = value.charCodeAt(index);
    if (
      codePoint >= 0xd800 &&
      codePoint <= 0xdbff &&
      index + 1 < value.length
    ) {
      const next = value.charCodeAt(index + 1);
      if (next >= 0xdc00 && next <= 0xdfff) {
        codePoint = 0x10000 + ((codePoint - 0xd800) << 10) + (next - 0xdc00);
        index += 1;
      }
    }
    if (codePoint < 0x80) {
      bytes.push(codePoint);
    } else if (codePoint < 0x800) {
      bytes.push(0xc0 | (codePoint >> 6), 0x80 | (codePoint & 0x3f));
    } else if (codePoint < 0x10000) {
      bytes.push(
        0xe0 | (codePoint >> 12),
        0x80 | ((codePoint >> 6) & 0x3f),
        0x80 | (codePoint & 0x3f),
      );
    } else {
      bytes.push(
        0xf0 | (codePoint >> 18),
        0x80 | ((codePoint >> 12) & 0x3f),
        0x80 | ((codePoint >> 6) & 0x3f),
        0x80 | (codePoint & 0x3f),
      );
    }
  }
  return bytes;
};

const rotateRight = (value: number, bits: number) =>
  (value >>> bits) | (value << (32 - bits));

export const sha256Hex = (value: string): string => {
  const constants = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1,
    0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
    0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786,
    0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147,
    0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
    0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b,
    0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a,
    0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
    0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ];
  const hash = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c,
    0x1f83d9ab, 0x5be0cd19,
  ];
  const bytes = utf8Bytes(value);
  const bitLength = bytes.length * 8;
  bytes.push(0x80);
  while (bytes.length % 64 !== 56) bytes.push(0);
  for (let shift = 56; shift >= 0; shift -= 8) {
    bytes.push(Math.floor(bitLength / 2 ** shift) & 0xff);
  }

  for (let offset = 0; offset < bytes.length; offset += 64) {
    const words = new Array<number>(64).fill(0);
    for (let index = 0; index < 16; index += 1) {
      const position = offset + index * 4;
      words[index] =
        (bytes[position] << 24) |
        (bytes[position + 1] << 16) |
        (bytes[position + 2] << 8) |
        bytes[position + 3];
    }
    for (let index = 16; index < 64; index += 1) {
      const a = words[index - 15];
      const b = words[index - 2];
      const sigma0 = rotateRight(a, 7) ^ rotateRight(a, 18) ^ (a >>> 3);
      const sigma1 = rotateRight(b, 17) ^ rotateRight(b, 19) ^ (b >>> 10);
      words[index] =
        (words[index - 16] + sigma0 + words[index - 7] + sigma1) | 0;
    }

    let [a, b, c, d, e, f, g, h] = hash;
    for (let index = 0; index < 64; index += 1) {
      const sum1 = rotateRight(e, 6) ^ rotateRight(e, 11) ^ rotateRight(e, 25);
      const choice = (e & f) ^ (~e & g);
      const temp1 = (h + sum1 + choice + constants[index] + words[index]) | 0;
      const sum0 = rotateRight(a, 2) ^ rotateRight(a, 13) ^ rotateRight(a, 22);
      const majority = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (sum0 + majority) | 0;
      h = g;
      g = f;
      f = e;
      e = (d + temp1) | 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) | 0;
    }
    hash[0] = (hash[0] + a) | 0;
    hash[1] = (hash[1] + b) | 0;
    hash[2] = (hash[2] + c) | 0;
    hash[3] = (hash[3] + d) | 0;
    hash[4] = (hash[4] + e) | 0;
    hash[5] = (hash[5] + f) | 0;
    hash[6] = (hash[6] + g) | 0;
    hash[7] = (hash[7] + h) | 0;
  }

  return hash.map(item => (item >>> 0).toString(16).padStart(8, '0')).join('');
};

const parseJson = <T>(text: string, label: string): T => {
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`${label}_INVALID_JSON`);
  }
};

const validHash = (value: unknown): value is string =>
  typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);

const validateManifest = (manifest: ScheduleManifest): ManifestSeason => {
  if (
    manifest.schemaVersion !== 1 ||
    !Number.isInteger(manifest.currentSeason) ||
    !Array.isArray(manifest.seasons)
  ) {
    throw new Error('SCHEDULE_MANIFEST_INVALID');
  }
  const season = manifest.seasons.find(
    item => item.season === manifest.currentSeason,
  );
  if (
    !season ||
    !/^schedules\/\d{4}\.json$/.test(season.path) ||
    !validHash(season.sha256) ||
    !validHash(season.dataVersion) ||
    !Number.isInteger(season.gameCount) ||
    season.gameCount < 100
  ) {
    throw new Error('SCHEDULE_MANIFEST_INVALID');
  }
  return season;
};

const validateSchedule = (
  schedule: SeasonSchedule,
  manifest: ManifestSeason,
): void => {
  if (
    schedule.schemaVersion !== 1 ||
    schedule.season !== manifest.season ||
    schedule.dataVersion !== manifest.dataVersion ||
    !Array.isArray(schedule.stadiums) ||
    !Array.isArray(schedule.games) ||
    schedule.games.length !== manifest.gameCount ||
    schedule.games.length < 100
  ) {
    throw new Error('SCHEDULE_DATA_INVALID');
  }
  const stadiumIds = new Set<string>();
  for (const stadium of schedule.stadiums) {
    if (
      typeof stadium.id !== 'string' ||
      !stadium.id ||
      stadiumIds.has(stadium.id) ||
      typeof stadium.name !== 'string' ||
      typeof stadium.shortName !== 'string'
    ) {
      throw new Error('SCHEDULE_DATA_INVALID');
    }
    stadiumIds.add(stadium.id);
  }
  const gameIds = new Set<string>();
  const statuses = new Set(['scheduled', 'final', 'canceled', 'postponed']);
  for (const game of schedule.games) {
    if (
      typeof game.id !== 'string' ||
      gameIds.has(game.id) ||
      !/^\d{4}-\d{2}-\d{2}$/.test(game.date) ||
      !game.date.startsWith(`${schedule.season}-`) ||
      !/^\d{2}:\d{2}$/.test(game.time) ||
      !Number.isInteger(game.homeTeamId) ||
      !Number.isInteger(game.awayTeamId) ||
      game.homeTeamId < 1 ||
      game.homeTeamId > 10 ||
      game.awayTeamId < 1 ||
      game.awayTeamId > 10 ||
      game.homeTeamId === game.awayTeamId ||
      !stadiumIds.has(game.stadiumId) ||
      !statuses.has(game.status) ||
      (game.homeScore !== null &&
        (!Number.isInteger(game.homeScore) || game.homeScore < 0)) ||
      (game.awayScore !== null &&
        (!Number.isInteger(game.awayScore) || game.awayScore < 0)) ||
      typeof game.memo !== 'string'
    ) {
      throw new Error('SCHEDULE_DATA_INVALID');
    }
    gameIds.add(game.id);
  }
};

const defaultFetcher: ScheduleFetcher = (url, init) =>
  fetch(url, init) as Promise<ScheduleFetchResponse>;

const fetchText = async (
  url: string,
  fetcher: ScheduleFetcher,
): Promise<string> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetcher(url, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`SCHEDULE_HTTP_${response.status}`);
    return response.text();
  } finally {
    clearTimeout(timeout);
  }
};

export const fetchScheduleUpdate = async (
  currentVersion: string | null,
  fetcher: ScheduleFetcher = defaultFetcher,
): Promise<ScheduleUpdate | null> => {
  const manifestText = await fetchText(
    `${SCHEDULE_BASE_URL}/latest.json`,
    fetcher,
  );
  const manifest = parseJson<ScheduleManifest>(
    manifestText,
    'SCHEDULE_MANIFEST',
  );
  const season = validateManifest(manifest);
  if (currentVersion === season.dataVersion) return null;

  const scheduleText = await fetchText(
    `${SCHEDULE_BASE_URL}/${season.path}`,
    fetcher,
  );
  if (sha256Hex(scheduleText) !== season.sha256) {
    throw new Error('SCHEDULE_CHECKSUM_MISMATCH');
  }
  const schedule = parseJson<SeasonSchedule>(scheduleText, 'SCHEDULE_DATA');
  validateSchedule(schedule, season);
  return {
    dataVersion: season.dataVersion,
    stadiums: schedule.stadiums,
    games: schedule.games.map(game => ({
      ...game,
      sourceVersion: season.dataVersion,
    })),
  };
};
