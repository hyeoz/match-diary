# TestFlight 2.4.0 (2) 시작 크래시 수습

## 현상

- TestFlight 2.4.0 (2)이 실행 직후 종료됨
- TestFlight 크래시 제출에서 `RCTFatal`과 `RCTCxxBridge handleError:` 확인

## 원인

- 실제 업로드 아카이브의 앱 번들에 `main.jsbundle`이 없었음
- Xcode의 `Bundle React Native code and images` 단계가 빈 스크립트이며 배포 후처리 전용으로 설정돼 Release JavaScript 번들이 생성되지 않았음

## 수정

- React Native 표준 Xcode 번들 스크립트 복구
- 모든 정상 빌드에서 번들 단계가 실행되도록 build action 설정 복구
- iOS 빌드 번호를 3으로 증가
- 출시 준비 검사에서 `react-native-xcode.sh`가 사라지면 실패하도록 회귀 방지 검사 추가

## 검증

- `npm run verify` 통과: 11개 테스트 스위트, 33개 테스트
- `npm run release:verify -- --production` 통과
- Release 시뮬레이터 앱에 `main.jsbundle` 1,957,143바이트 포함
- Metro 없이 설치·실행 후 시작 화면 표시와 프로세스 유지 확인
- 수정 아카이브 2.4.0 (3)에 동일 번들 포함
- Apple Distribution 코드 서명과 production App Attest entitlement 검증 통과
- TestFlight 업로드 및 Apple 처리 완료: `VALID`, 내부 상태 `IN_BETA_TESTING`
- 실행 캡처: `docs/runtime-captures/stage10-release-bundle-fix.png`
