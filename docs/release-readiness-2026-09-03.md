# 직관일기 2.4.0 베타 출시 준비

## 이번 단계에서 저장소에 확정한 항목

- 기존 스토어 식별자 유지: iOS `com.matchdirary.app`, Android `com.matchdiary.origin`
- 버전: iOS/Android/app package `2.4.0`, Android version code `26`
- Android 16(API 36) target/compile SDK 및 최소 지원 AGP 8.9.1 대응
- Gradle 8.11.1에서 제거된 테스트 전용 내부 API를 React Native 0.73 플러그인 설치 직후 안전하게 제거
- iOS 26 SDK 빌드 기준 유지 및 iPhone 세로 화면으로 범위 확정
- 사용하지 않는 iOS 카메라·사진 저장 권한과 원격 푸시 entitlement 제거
- Google Mobile Ads 및 기존 기록 복구를 반영한 iOS Privacy Manifest
- 앱 설정 화면에서 개인정보처리방침·지원 페이지·앱 버전 확인 가능
- App Store/Google Play 한국어 설명, 출시 노트, 개인정보 선언 원본 추가
- `npm run release:verify`로 버전·식별자·권한·스토어 파일 일치 검증

## 2026-09-03 외부 반영 상태

- 개인정보처리방침 `https://hyeoz.github.io/privacy/matchdiary/` 공개 및 HTTP 200 확인
- 지원 페이지 `https://hyeoz.github.io/privacy/support/` 공개 및 HTTP 200 확인
- App Store Connect에 iOS 2.4.0 버전 생성 (`PREPARE_FOR_SUBMISSION`)
- App Store Connect 한국어 설명·키워드·출시 노트·지원 URL·개인정보처리방침 URL 반영
- Apple Developer App ID에 App Attest 활성화 확인
- App Attest entitlement가 포함된 iOS App Store 프로비저닝 프로파일 생성·설치
- Apple Distribution 서명, production App Attest entitlement, 스토어 검증을 포함한 iOS 2.4.0 archive 성공
- iOS 2.4.0 (빌드 1)을 TestFlight에 업로드하고 Apple 처리 완료 확인 (`VALID`, 내부 상태 `IN_BETA_TESTING`)
- 기존 내부 `Admin` 그룹은 모든 빌드 자동 접근 설정으로 별도 베타 심사 없이 설치 가능
- 한국어 `테스트할 내용`에 이번 빌드의 점검 범위와 기존 사용자 자동 복구 비활성 상태를 명시
- 설정 화면 검토 캡처: `docs/runtime-captures/stage10-settings.png`
- Google Play 데이터 보안 설문 반영과 베타 바이너리 업로드는 아래 운영 게이트 통과 후 진행

TestFlight 2.4.0 (1)은 UI와 서버리스 로컬 기능을 먼저 검증할 수 있도록 업로드했다. 이 빌드에는 `MATCHDIARY_RECOVERY_API_BASE_URL`을 주입하지 않았으므로 기존 사용자 자동 복구는 비활성화되어 있다. 자동 복구는 운영 API와 실제 기기 E2E 검증을 끝낸 후 후속 빌드로 제공한다.

## 베타 업로드 전 필수 게이트

다음 값은 저장소에 넣지 않고 릴리스 환경의 비밀 또는 빌드 설정으로 주입한다.

1. `MATCHDIARY_RECOVERY_API_BASE_URL`: 운영 HTTPS 복구 API 주소
2. `MATCHDIARY_PLAY_CLOUD_PROJECT_NUMBER`: Play Integrity와 연결된 Cloud 프로젝트 번호
3. Android 기존 앱과 동일한 업로드 키
4. App Store Connect 및 iOS 배포 서명 권한

두 복구 설정이 없으면 `npm run release:verify -- --production`이 실패하도록 했다. 따라서 기존 사용자 자동 복구를 포함하는 운영 후보 빌드는 이 검증을 통과해야 한다. 자동 복구를 제외한 내부 기능 검증용 TestFlight 빌드는 비활성 상태를 테스터에게 명시하고 별도로 배포할 수 있다.

## 제출 순서

1. 개인정보처리방침과 지원 페이지가 공개 URL에서 200으로 응답하는지 확인
2. iOS 배포 빌드에서 `com.apple.developer.devicecheck.appattest-environment=production` entitlement 확인
3. Play Console에서 Play Integrity API 연결 및 데이터 보안 설문 반영
4. 운영 복구 API에 보호된 원본 DB를 읽기 전용으로 연결하고 실제 기기 E2E 검증
5. `npm ci && npm run verify && npm run release:verify -- --production`
6. Android release AAB와 iOS archive를 기존 배포 인증서/키로 생성
7. 내부 테스터에게 배포하고 신규 설치·업데이트·자동 복구·백업/복원·광고·삭제를 점검
8. 통과 후 외부 TestFlight/Play 비공개 테스트로 확대

## 베타 점검표

- 기존 2.3.4 위에 업데이트해도 앱 식별자와 데이터 영역이 유지되는가
- 신규 사용자는 서버 계정 없이 온보딩부터 기록 작성까지 가능한가
- 원래 설치 기기의 기존 사용자만 자동 복구되고 다른 기기는 거부되는가
- 복구 완료 뒤 같은 데이터가 중복 삽입되지 않는가
- 사진 앱의 원본을 지운 뒤에도 기록 이미지가 보이는가
- `.matchdiary` 백업 생성, 새 설치 복원, 손상 백업 거부가 정상인가
- 경기 일정이 네트워크/캐시/기본 데이터 순서로 폴백되는가
- 로컬 알림, 공유, 통계, 지도, 광고 배너와 전면 광고가 실제 기기에서 정상인가
- 광고 개인정보 옵션이 필요한 지역에서 다시 열리는가
- 모든 데이터 삭제 후 로컬 DB·미디어·알림이 제거되고 자동 복구가 재실행되지 않는가
