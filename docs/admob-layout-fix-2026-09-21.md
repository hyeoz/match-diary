# AdMob navigation/layout correction

## Changes

- The shared banner has an `광고` label, a distinct background, top/bottom borders, and noninteractive buffers (12 logical pixels above the label and 16 below the ad). These dimensions are a UI choice, not a guarantee of Google policy compliance.
- A successful banner load only marks the ad ready. It does not expand the footer while the user is reading, scrolling, or filling a screen.
- A ready banner is revealed with the next accepted change to a different bottom tab. Tapping the current tab, prevented navigation, backgrounding, or an ad arriving after the transition do not trigger a reveal.
- The first screen can therefore remain ad-free until a subsequent tab change. This intentionally trades some immediate impressions for stable navigation.
- An ad that has not loaded, has failed, or has expired before presentation leaves no blank footer. Hidden banners cannot receive touches or accessibility focus.
- A width change remounts the adaptive banner so its previous size is not reused across orientations.

## Interstitials

The branch already contains `b1e68ed`, which was added after the inspected Play release. Record creation awaits a preloaded interstitial's close before navigating back, skips ads on edits, and uses consent/frequency limits. This behavior was preserved; it should be included with the eventual release. No additional interstitial rewrite was necessary for this change.

## Validation

- TypeScript: passed.
- ESLint: passed.
- Jest: 14 suites, 41 tests passed, including late banner load, accepted/cancelled tab navigation, accessibility/touch gating, expiry, backgrounding and load failure.
- Interstitial lifecycle/frequency suite: 17 tests passed in the preceding implementation run; its source is unchanged.
- Android `assembleDebug -PreactNativeArchitectures=arm64-v8a`: succeeded; APK installed and app process launched on the Pixel 9a emulator.
- Android emulator visual verification was blocked by the computer-control surface not exposing its standalone window. This is not a claim that its ad rendering was inspected.
- iOS simulator Debug build succeeded. On iPhone 16 Pro (iOS 18.4), the shared React Native footer remained collapsed after loading until an explicit tab change, then displayed a Google test banner with the label/borders/buffers. Subsequent tab changes retained the visible footer. This validates the common UI on iOS, not Android-specific rendering or production ad creatives.
- Simulator captures: [before navigation](runtime-captures/ad-layout-before-navigation-2026-09-21.png), [after navigation](runtime-captures/ad-layout-after-navigation-2026-09-21.png). Preview fixture data and Google test ads only; images are documentation assets and are not referenced by the app bundle.

## Release status

These are local source changes. Google Play upload and AdMob review submission have not been performed. Google's policy center did not identify an affected version or example screen, so this correction addresses identified risks without claiming to prove or resolve the original enforcement.
