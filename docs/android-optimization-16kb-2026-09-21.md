# Android DEX optimization and 16 KB correction

## Changes

- Enable R8 minification/obfuscation and resource shrinking for release builds; use `proguard-android-optimize.txt` so optimization is actually enabled.
- Keep only React Native 0.77's `CxxInspectorPackagerConnection` JNI wrapper and nested delegates. Without this rule the optimized app crashed while initializing `InspectorFlags`, because native registration looks up the Java class by its original name. This was reproduced on the 16 KB emulator before adding the rule.
- Upgrade `react-native-keychain` from 8.2.0 to exactly 10.0.0, which removes Facebook Conceal and its prebuilt `libconceal.so`. Merely changing the application's NDK would not rebuild that third-party binary; the app already uses NDK r28.
- Synchronize the iOS Pod lockfile with the shared dependency update. This task does not publish iOS.
- Add an AAB verification command: verify actual R8 mapping/renamed classes, absence of Conceal, ARM64 LOAD alignment, and absence of writable data covered by 16 KB RELRO page rounding. Workflow integration was not published because the current GitHub credential lacks workflow-write scope; the verification command was run locally against the release artifact.

## Storage compatibility

The application's minimum Android API is 24, above keychain 10's requirement of 23. App code does not explicitly select the retired Conceal cipher. Keychain is only used for recovery device keys and pending recovery jobs; the production recovery API is disabled, so that workflow cannot create new encrypted recovery jobs. Local diary records and backups use the existing SQLite/file formats, which this change does not alter.

Keychain 10 still implements `KeystoreAESCBC` and migrates its old `RN_KEYCHAIN` SharedPreferences into DataStore. Devices with historical Conceal-encrypted entries would need a separate migration before upgrading; none are expected from this application's configured production recovery workflow. This is a source/configuration assessment, not an inspection of user devices.

## Artifact verification

Run against the actual unsigned or signed production AAB:

```sh
python3 scripts/verify-android-artifact.py \
  android/app/build/intermediates/intermediary_bundle/release/packageReleaseBundle/intermediary-bundle.aab
```

The old production 29 bundle fails the gate for missing R8 mapping and the Conceal RELRO/writable-data overlap. Modern linker output can end RELRO at a LOAD boundary without ending on a 16 KB boundary; the gate checks actual overlap with writable LOAD memory to avoid flagging harmless padding.

## Local native smoke entry

`scripts/android-native-smoke.js` is an alternate Metro entry for release/R8 QA. It exercises encrypted CBC/GCM storage, deletion, AsyncStorage, filesystem I/O, SQLite reopen/persistence, consent info and notification settings using synthetic data. It requests no ads or new permissions. It is not imported by the normal app entry.

To run it locally, build a release APK with `ENTRY_FILE=scripts/android-native-smoke.js` and **only a local QA signing key**, then install on an emulator and inspect `MATCHDIARY_NATIVE_QA` log lines. Do not upload this test entry or a QA-signed APK/AAB to the store. Rebuild with the normal `index.js` entry and the existing approved upload certificate for publication.

## Sources

- [Android DEX code optimization](https://developer.android.com/topic/performance/vitals/code-optimization)
- [Enable R8 app optimization](https://developer.android.com/topic/performance/app-optimization/enable-app-optimization)
- [Android 16 KB page-size support](https://developer.android.com/guide/practices/page-sizes)
- [Android linker RELRO implementation](https://android.googlesource.com/platform/bionic/+/android16-qpr2-release/linker/linker_phdr.cpp)
- [Keychain 10 release and migration notes](https://github.com/oblador/react-native-keychain/releases/tag/v10.0.0)

## Verified results

- TypeScript, ESLint and Jest: 14 suites / 41 tests passed. Production metadata verification passed.
- Release R8 build and unsigned AAB packaging succeeded. Local APKs use the debug signing certificate solely for emulator installation; these are not store-signed artifacts.
- Final normal-entry AAB: DEX **21,996,888 → 6,844,844 bytes** versus production 29 (**68.88% smaller**).
- R8 mapping embedded in AAB: 7,181 of 7,984 mapped class names changed. This demonstrates actual obfuscation; it is **not** Google's class/method/field-weighted Play Console score.
- `libconceal.so` is absent for both packaged ABIs. All 11 ARM64 `.so` files pass LOAD/RELRO overlap checks. The same gate correctly rejects the old production Conceal binary.
- APK `zipalign -c -P 16 4`: passed.
- Pixel 9a Android 16 emulator reports `getconf PAGE_SIZE = 16384`.
- R8/minified native smoke entry: CBC and GCM encrypted write/read/delete, AsyncStorage, filesystem I/O, SQLite persistence after close/reopen, UMP consent info, and notification settings all passed.
- Rebuilt the normal `index.js` entry after smoke testing. Verified that the final AAB does not contain the QA marker. Installed and launched the normal optimized app offline (to avoid production ad requests); React Native startup completed, the process remained alive for 15 seconds, and its log contained no JS errors, fatal exceptions, native linkage errors or missing-class errors. Emulator network settings were restored.
- iOS Pod installation succeeded; an iOS build/publication was not part of this Android verification.

## Publication status

These changes are part of the pending 2.4.3 (30) correction. Google Play warnings and AdMob enforcement have not been cleared: the actual store upload still needs the existing upload key, whose native Keychain approval is unavailable while the user is away from the Mac. The earlier pending credential request was cancelled. No further approval was requested during this Android correction task.
