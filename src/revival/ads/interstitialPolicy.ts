// Local-only frequency state: never stores content, health data or photo locations.
export type FrequencyState = {
  experienced: boolean;
  day: string;
  count: number;
  lastShown: number;
};

export type FrequencyStorage = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<unknown>;
};

export function createInterstitialPolicy(
  storage: FrequencyStorage,
  maxPerDay: number,
  now = Date.now,
) {
  const key = 'ads.interstitial.frequency.v1';
  const startedAt = now();
  let state: FrequencyState | null = null;
  let writes = Promise.resolve();
  const day = (time: number) => {
    const date = new Date(time);
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  };
  const persist = () => {
    const value = JSON.stringify(state);
    writes = writes.then(() => storage.setItem(key, value)).then(() => undefined)
      .catch(() => { state = null; }); // Fail closed if the cap cannot be saved.
  };
  const initialized = storage.getItem(key).then(raw => {
    if (!raw) {
      state = { experienced: false, day: day(now()), count: 0, lastShown: 0 };
      return;
    }
    const parsed = JSON.parse(raw) as FrequencyState;
    if (typeof parsed.experienced !== 'boolean' || typeof parsed.day !== 'string' ||
        !Number.isInteger(parsed.count) || parsed.count < 0 ||
        !Number.isFinite(parsed.lastShown) || parsed.lastShown < 0) return;
    state = parsed;
  }).catch(() => {});

  return {
    initialized,
    // Called only at a completed, user-initiated workflow. Never wait for storage
    // or ad loading here: a missed transition must not become a delayed ad.
    reserve(available: boolean): boolean {
      if (!state) return false;
      if (!state.experienced) {
        state.experienced = true;
        persist();
        return false; // First completion is always ad-free, even after reinstall.
      }
      const time = now();
      if (!available || time - startedAt < 90_000 || time < state.lastShown) return false;
      if (day(time) !== state.day) {
        state.day = day(time);
        state.count = 0;
      }
      if (state.count >= maxPerDay || time - state.lastShown < 180_000) return false;
      // Reserve synchronously so rapid taps and multiple screens share one cap.
      // Failed presentations conservatively consume this slot too.
      state.count += 1;
      state.lastShown = time;
      persist();
      return true;
    },
  };
}
