jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('react-native-fs2', () => ({
  CachesDirectoryPath: '/caches',
  DocumentDirectoryPath: '/documents',
  copyFile: jest.fn(() => Promise.resolve()),
  exists: jest.fn(() => Promise.resolve(false)),
  getFSInfo: jest.fn(() =>
    Promise.resolve({
      freeSpace: 1024 * 1024 * 1024,
      totalSpace: 1024 * 1024 * 1024,
    }),
  ),
  hash: jest.fn(() => Promise.resolve('test-sha256')),
  mkdir: jest.fn(() => Promise.resolve()),
  readDir: jest.fn(() => Promise.resolve([])),
  readFile: jest.fn(() => Promise.resolve('{}')),
  stat: jest.fn(() => Promise.resolve({ size: 1024 })),
  unlink: jest.fn(() => Promise.resolve()),
  writeFile: jest.fn(() => Promise.resolve()),
}));

jest.mock('react-native-document-picker', () => ({
  __esModule: true,
  default: {
    isCancel: jest.fn(() => false),
    pickSingle: jest.fn(() => Promise.reject(new Error('picker not mocked'))),
    types: { allFiles: '*/*' },
  },
}));

jest.mock('react-native-zip-archive', () => ({
  getUncompressedSize: jest.fn(() => Promise.resolve(1024)),
  listContents: jest.fn(() => Promise.resolve([])),
  unzip: jest.fn(() => Promise.resolve('/caches/extracted')),
  zip: jest.fn(() => Promise.resolve('/caches/backup.matchdiary')),
}));

jest.mock('react-native-image-picker', () => ({
  launchImageLibrary: jest.fn(() => Promise.resolve({ didCancel: true })),
}));

jest.mock('react-native-google-mobile-ads', () => {
  const listeners = {};
  const interstitial = {
    addAdEventListener: jest.fn((type, handler) => {
      listeners[type] = handler;
      return jest.fn();
    }),
    load: jest.fn(),
    show: jest.fn(() => Promise.resolve()),
  };
  const mobileAds = {
    initialize: jest.fn(() => Promise.resolve()),
    setRequestConfiguration: jest.fn(() => Promise.resolve()),
  };
  return {
    __esModule: true,
    default: jest.fn(() => mobileAds),
    AdEventType: { CLOSED: 'closed', ERROR: 'error', LOADED: 'loaded' },
    AdsConsent: {
      requestInfoUpdate: jest.fn(() =>
        Promise.resolve({
          canRequestAds: true,
          privacyOptionsRequirementStatus: 'not-required',
        }),
      ),
      loadAndShowConsentFormIfRequired: jest.fn(() =>
        Promise.resolve({
          canRequestAds: true,
          privacyOptionsRequirementStatus: 'not-required',
        }),
      ),
      getConsentInfo: jest.fn(() =>
        Promise.resolve({
          canRequestAds: true,
          privacyOptionsRequirementStatus: 'not-required',
        }),
      ),
      showPrivacyOptionsForm: jest.fn(() =>
        Promise.resolve({
          canRequestAds: true,
          privacyOptionsRequirementStatus: 'not-required',
        }),
      ),
    },
    AdsConsentPrivacyOptionsRequirementStatus: {
      REQUIRED: 'required',
    },
    BannerAd: ({ children }) => children ?? null,
    BannerAdSize: { ANCHORED_ADAPTIVE_BANNER: 'adaptive' },
    InterstitialAd: {
      createForAdRequest: jest.fn(() => interstitial),
    },
    MaxAdContentRating: { PG: 'PG' },
    TestIds: { BANNER: 'test-banner', INTERSTITIAL: 'test-interstitial' },
  };
});

jest.mock('@notifee/react-native', () => ({
  __esModule: true,
  default: {
    requestPermission: jest.fn(() =>
      Promise.resolve({ authorizationStatus: 1 }),
    ),
    createChannel: jest.fn(() => Promise.resolve('test-channel')),
    createTriggerNotification: jest.fn(() =>
      Promise.resolve('test-notification'),
    ),
    cancelNotification: jest.fn(() => Promise.resolve()),
  },
  AndroidImportance: { HIGH: 4 },
  AuthorizationStatus: { DENIED: 0, AUTHORIZED: 1 },
  TriggerType: { TIMESTAMP: 0 },
}));

jest.mock('react-native-share', () => ({
  __esModule: true,
  default: { open: jest.fn(() => Promise.resolve({ success: true })) },
}));

jest.mock('react-native-view-shot', () => {
  const React = require('react');
  const { View } = require('react-native');
  return React.forwardRef((props, ref) => {
    React.useImperativeHandle(ref, () => ({
      capture: jest.fn(() => Promise.resolve('/tmp/share.jpg')),
    }));
    return React.createElement(View, props, props.children);
  });
});

jest.mock('react-native-sqlite-storage', () => {
  const emptyRows = {
    length: 0,
    item: jest.fn(() => undefined),
    raw: jest.fn(() => []),
  };
  const database = {
    executeSql: jest.fn(statement => {
      if (statement === 'PRAGMA user_version') {
        return Promise.resolve([
          {
            rows: {
              length: 1,
              item: jest.fn(() => ({ user_version: 1 })),
              raw: jest.fn(() => [{ user_version: 1 }]),
            },
            rowsAffected: 0,
          },
        ]);
      }
      return Promise.resolve([{ rows: emptyRows, rowsAffected: 0 }]);
    }),
  };
  return {
    enablePromise: jest.fn(),
    openDatabase: jest.fn(() => Promise.resolve(database)),
  };
});
