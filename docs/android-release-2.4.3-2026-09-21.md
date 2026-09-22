# Android 2.4.3 (30) release attempt

## 2026-09-22 signing update

Saved Keychain credential access succeeded on retry after the user requested authentication. The `matchdiary-release-1114` certificate was verified against the expected Play upload SHA-1, and `bundleRelease` completed successfully. The signed 24.1 MB AAB passed the release artifact gate: R8 mapping present, no QA entry marker, no Conceal library, and all 11 ARM64 libraries passed the 16 KB checks. Google Play accepted version 30 (2.4.3), including the ReTrace mapping and native symbols. Submitted the single production change (100% rollout) for review and confirmed the console message `검토를 위해 변경사항 1개를 전송했습니다.` and the `검토 중인 변경사항` section. Automated quick checks were still running at confirmation. Managed publishing remains enabled, so approval is not publication. The only release warning concerned an active artifact missing AD_ID; the current source and merged release manifest both contain AD_ID. The older signing blocker below records the prior attempt. App Store Connect currently requires Apple login, so iOS submission remains pending. AdMob re-review has not been sent because the new Android release is not live.


## Scope and validation

The user authorized Google Play production publication and an AdMob policy re-review after the corrected version is available. This applies to Android `com.matchdiary.origin`. iOS native release metadata remains at 2.4.2 (12).

The user subsequently requested Android DEX and 16 KB corrections while unable to approve the Mac Keychain prompt. Those additional changes supersede the earlier candidate artifact; see [optimization and native validation](android-optimization-16kb-2026-09-21.md). Rebuild the latest source, not the initially rejected AAB, when publication resumes. The pending Keychain request has been cancelled.

- Source release preparation: `f970207`; includes banner correction `14a3176` and previously committed interstitial behavior.
- TypeScript, ESLint, Jest (14 suites / 41 tests), interstitial suite (17 tests), and production metadata checks passed.
- Android release compilation and bundle generation succeeded. The first signed bundle was rejected by Google Play because the legacy checkout's default signing properties select the wrong upload certificate. This rejected artifact must not be released.
- Expected Play upload certificate SHA-1: `79:9C:4F:D6:21:EE:A4:41:C7:40:84:11:4A:84:0E:C4:D4:58:34:7F`.
- Rejected certificate SHA-1: `58:7E:AB:1C:9F:CA:74:AE:7D:F1:EC:4D:86:6D:C4:4E:B7:A7:6C:D7`.

## Console state (2026-09-21, superseded by the update above)

- Existing production release: 2.4.2 (29), published September 13, 2026, 100% rollout.
- No competing unpublished changes were present before this work.
- Created and saved production release draft **30 (2.4.3)** with the Korean release notes in `store/google-play/ko-KR/release-notes.txt`.
- Draft: https://play.google.com/console/u/0/developers/4719318279754864899/app/4972501641450550994/tracks/4697592792499538638/releases/28/prepare
- Removed the rejected bundle from the draft. No new accepted bundle, review submission, or publication yet.
- Managed publishing is enabled. Once store review succeeds, publication still needs to be performed unless the user-authorized release is configured for automatic publication.

## Prior signing blocker and continuation

Android Studio has saved keystore and key credentials for `matchdiary-release-1114.keystore` in macOS Keychain. The credentials were not printed or written into the repository. Retrieving them requires local Keychain approval, and computer control refuses access to the protected `com.apple.SecurityAgent` app. The user must approve the native access request; no password should be sent in Slack. The certificate for this candidate key has not yet been verified against Play.

A temporary build helper at `/tmp/matchdiary-release-20260921/build-with-saved-key.py` retrieves the two saved entries, checks the certificate against Play's expected SHA-1, and only then signs the bundle. It contains no credential values. After approval, verify its successful exit and the new artifact, upload it to the existing draft, submit for store review, and publish once approved. The user already authorized these actions.

## AdMob continuation

No re-review has been submitted. The issue remains `사이트 행동: 탐색`, reported September 17, with limited ad serving.

Policy detail: https://admob.google.com/v2/policycenter/issues/details/app/1/com.matchdiary.origin

After 2.4.3 (30) is actually available, choose `수정사항이 포함된 새 버전의 앱을 업로드했습니다.` in the review form and explain the changes below. Check the confirmation and submit once; verify that the console acknowledges the review request. Do not claim Google approved the fix before the review result.

Suggested review text (submit only after publication):

> 직관일기 Android 앱(com.matchdiary.origin)의 2.4.3(버전 코드 30)에 광고 배치 및 탐색 흐름 개선을 반영했습니다. 배너 영역에 광고 표시, 구분선, 별도 배경과 비활성 여백을 추가하여 본문 및 하단 탐색 메뉴와 구분했습니다. 늦게 로드된 배너가 사용 중인 화면을 갑자기 밀지 않도록, 준비된 광고는 다음 정상적인 탭 이동 시점에만 표시합니다. 로드 실패·광고 없음·표시 전 만료 상태에서는 빈 광고 영역을 남기지 않으며 숨겨진 광고는 터치나 접근성 포커스를 받지 않습니다. 전면 광고는 새 기록 저장 완료 시 사전 로드된 광고만 빈도 제한 및 동의 상태에 따라 표시하고, 닫힌 후 화면 이동을 완료합니다. 수정된 새 버전을 기준으로 재검토를 요청드립니다.

No automatic follow-up task is configured: the current tools expose no task scheduler and computer control refuses access to the ChatGPT desktop app's task management UI. Do not promise unattended monitoring without actually setting it up.
