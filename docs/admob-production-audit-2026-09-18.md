# Android production AdMob audit — 2026-09-18

## Verified console state

- Package: `com.matchdiary.origin`.
- Google Play production release: version code **29**, version **2.4.2**.
- Published: September 13, 2026, 21:15 as displayed by Play Console.
- Rollout: 100%; this is availability, not proof that all existing installations updated.
- The release detail page reported 12.50% adoption at inspection time.
- AdMob policy center: one Android app issue, **사이트 행동: 탐색**, reported September 17, 2026; ad serving restricted.
- The issue explanation concerns misleading navigation and advertisements that can be mistaken for menus/navigation/download links.
- No affected version number or example screenshot was exposed in the inspected issue detail.
- No review was requested and no console configuration was changed.

## Artifact provenance and limits

- Local `android/app/build/outputs/bundle/release/app-release.aab`: 25,436,276 bytes, September 11 build file.
- Associated generated release manifest declares the same package, version code 29, and version 2.4.2.
- AAB `base/assets/index.android.bundle` exactly matches the local generated release JS bundle.
- JS bundle SHA-256: `8f3b5b2a29e8b87f3d74ec194f45e06b9c15349e7baafade54918f7c79204cb4`.
- Associated release source map's AdBanner, RevivalBottomTab, useInterstitial, RecordEditorScreen, appInfo, router and App sources match Git commit `096343e`.
- Play Console's original AAB download was attempted, but Chrome displayed `ERR_BLOCKED_BY_CLIENT`. No protection was changed or bypassed. The Play-hosted file could not be byte-compared with the local AAB.
- `adb devices` reported no connected Android device or emulator. Production runtime rendering/timing was not reproduced.
- Findings below are static findings in the corresponding local release build materials, not a confirmed attribution of Google's enforcement.
- September 17 commit `b1e68ed` changes interstitial behavior after this build and must not be substituted for the deployed implementation.

## Findings

### 1. Banner separation — first remediation candidate

`src/revival/RevivalBottomTab.tsx` renders a shared banner directly above the five navigation tabs, between the screen body and tab bar. Tab-bar top padding is 5 logical pixels. `ads/AdBanner.tsx` supplies a hairline top border, with no dedicated noninteractive vertical buffer around the banner. The tab bar also has a hairline border; there is some delineation, so this is not proof of a violation.

This resembles Google's discouraged content/banner/navigation arrangement. Strengthen clear, noninteractive separation from both the content and tab hit areas and inspect actual Android rendering with test ads. Do not claim a particular pixel value guarantees policy compliance.

### 2. Banner appearance changes layout

The banner starts at height zero and expands after `onAdLoaded`. This changes the available body height while the user may already be interacting with the screen. This is a timing/layout risk to reproduce on a slow connection, not a confirmed accidental click. Keep the user's no-empty-ad-space requirement while designing a stable, safe point to introduce the banner.

### 3. Interstitial transition timing — secondary candidate

In the release source, record creation or editing completes and then invokes `navigation.goBack()` followed immediately by `showSavedRecordAd()`. Ads are preloaded, which is good, and saving is a natural completion point. However, native navigation and ad presentation can overlap; verify that an ad cannot appear after the user resumes interacting with the destination screen. This has not been reproduced on-device and is not the confirmed reason for the navigation enforcement.

### 4. Basic destinations checked

The inspected main tab and stack destinations are registered. The release's privacy and support URLs both returned HTTP 200 with the intended page titles on September 18. No broken destination was found in this limited static review; this does not constitute full end-to-end navigation testing.

## Recommended next work

1. Prioritize clear banner separation and safe appearance timing, using Google test ads on Android across small screens and slow loading.
2. Verify save/edit interstitial and return-navigation sequencing against the release implementation.
3. Obtain exact store-artifact comparison and Android runtime evidence before describing the suspected trigger as confirmed. Also account for older installed versions because AdMob did not identify an affected version.
4. If an app fix is needed, publish the corrected Android release, then request review in AdMob with accurate changes and evidence. No fix, release, or review submission was performed in this inspection.

## Official references

- https://support.google.com/admob/answer/6275345?hl=ko
- https://support.google.com/admob/answer/6275335?hl=ko
- https://support.google.com/admob/answer/6201362?hl=en
- https://support.google.com/admob/answer/10448709?hl=ko
