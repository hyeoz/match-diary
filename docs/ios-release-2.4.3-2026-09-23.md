# iOS 2.4.3 (13) release

The user authorized store deployment and confirmed Apple login. App Store Connect authentication was verified, and version 2.4.3 was created from the released 2.4.2 metadata.

## Source and verification

- Source: `44d33f7`, based on the banner/navigation fixes and native Keychain update already tested in this branch.
- iOS marketing version 2.4.3, build 13, existing bundle ID `com.matchdirary.app`.
- In-app version and release readiness expectations synchronized.
- TypeScript, ESLint, release metadata check passed.
- Jest: 14 suites / 41 tests passed; ad controller: 17 tests passed.
- Xcode 26 Release archive succeeded, Apple Distribution signature verified, `main.jsbundle` present (2,023,318 bytes), production App Attest entitlement verified.
- Watchman emitted a missing-directory warning during bundling; archive completed and the embedded JavaScript bundle was verified.
- App Store IPA export succeeded using the existing profile (29,098,494 bytes).

## Submission metadata

- Korean release notes describe banner separation, stable late-ad loading, and completed-workflow interstitials.
- Reviewer notes explain login-free use, local storage/backup, and consent/frequency-controlled ads.
- Automatic release after approval selected; all-user release, existing ratings retained.
- Existing screenshots, description and contact information carried forward.

## Status

IPA upload completed successfully with `UPLOAD SUCCEEDED with no errors` from Apple altool. Apple processing completed without errors or warnings. Build 13 (`f15fbc89-a842-4267-ac43-12ca58d13eba`) was verified as VALID and attached to 2.4.3. Submitted the single iOS app item to App Review and confirmed `1개의 항목 제출됨` and `2.4.3 심사 대기 중` in App Store Connect. Approval and publication are still pending; automatic release after approval is enabled. Review submission: https://appstoreconnect.apple.com/apps/6503297796/distribution/reviewsubmissions/details/46953ecf-9956-4287-bc5b-69f552a5d8cb. Local logs and artifacts are under `/tmp/matchdiary-ios-20260923/`. No credential values are stored in this document or the repository.
