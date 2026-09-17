type AdEvent = 'loaded' | 'opened' | 'closed' | 'error';
export type FullScreenAd = {
  listen(event: AdEvent, callback: () => void): () => void;
  load(): void;
  show(): Promise<unknown>;
};

// Framework-independent lifecycle. Navigation waits for CLOSED, never for LOADED.
export function createInterstitialController(options: {
  createAd: () => FullScreenAd;
  reserve: (available: boolean) => boolean;
  isActive: () => boolean;
  now?: () => number;
}) {
  const now = options.now ?? Date.now;
  let ad: FullScreenAd | null = null;
  let unsubscribers: (() => void)[] = [];
  let loadedAt: number | null = null;
  let loading = false;
  let presenting = false;
  let opened = false;
  let finish: ((shown: boolean) => void) | null = null;
  let watchdog: ReturnType<typeof setTimeout> | null = null;

  const complete = (shown: boolean) => {
    if (watchdog) clearTimeout(watchdog);
    watchdog = null;
    presenting = false;
    opened = false;
    const resolve = finish;
    finish = null;
    resolve?.(shown);
  };
  const preload = () => {
    if (!ad || loading || presenting || loadedAt !== null) return;
    loading = true;
    try { ad.load(); } catch { loading = false; }
  };
  const stop = () => {
    unsubscribers.forEach(unsubscribe => unsubscribe());
    unsubscribers = [];
    ad = null;
    loadedAt = null;
    loading = false;
    complete(false);
  };

  return {
    start() {
      if (ad) return;
      try {
        ad = options.createAd();
        unsubscribers = [
          ad.listen('loaded', () => { loading = false; loadedAt = now(); }),
          ad.listen('opened', () => {
            opened = true;
            if (watchdog) clearTimeout(watchdog);
            watchdog = null;
          }),
          ad.listen('closed', () => {
            loadedAt = null;
            complete(true);
            preload();
          }),
          ad.listen('error', () => {
            loading = false;
            loadedAt = null;
            complete(false); // Retry only at a future workflow, never in a loop.
          }),
        ];
        preload();
      } catch { stop(); }
    },
    stop,
    show(): Promise<boolean> {
      if (presenting) return Promise.resolve(false);
      const available = !!ad && loadedAt !== null &&
        now() - loadedAt < 55 * 60_000 && options.isActive();
      if (!options.reserve(available)) {
        if (loadedAt !== null && now() - loadedAt >= 55 * 60_000) loadedAt = null;
        preload();
        return Promise.resolve(false);
      }
      presenting = true;
      loadedAt = null;
      return new Promise(resolve => {
        finish = resolve;
        // Protect navigation if the native presentation fails silently. Once
        // OPENED arrives, only CLOSED/ERROR/unmount completes the workflow.
        watchdog = setTimeout(() => { if (!opened) complete(false); }, 3000);
        try {
          Promise.resolve(ad!.show()).catch(() => complete(false));
        } catch { complete(false); }
      });
    },
  };
}
