# 직관일기 앱 기술 기반 정리 결과

작성일: 2026-09-02
대상 브랜치: `revival/serverless`
결론: 사용자 작업 없이 4단계(전체 실행 순서 기준) 완료

로드맵 문서의 번호로는 `3단계: 앱 기술 기반 정리`에 해당한다. 최초 보안 수습을 1단계로 세는 실행 순서에서는 4단계다.

## 정리한 항목

### JavaScript와 테스트 기반

- Node 버전을 `.nvmrc`의 Node 20으로 고정했다.
- `package-lock.json`을 잠금 파일로 사용하며 `npm ci`로 재설치 가능하게 했다.
- TypeScript 범위를 현재 재운영 앱 셸로 한정해 레거시 화면과 새 화면이 서로의 타입 검사를 방해하지 않게 했다.
- `typecheck`, `lint`, `test:ci`, `verify`, `android:debug`, `ios:debug` 스크립트를 정리했다.
- 마스코트 10종의 순서·fallback과 프로필/기록 저장소의 영속화를 테스트에 추가했다.

### 네이티브 의존성과 권한

현재 자동 연결되는 네이티브 모듈은 다음 네 종류다.

- AsyncStorage
- SVG
- React Native Screens
- Safe Area Context

현재 앱 셸에서 쓰지 않는 광고, 백그라운드 작업, 위치, 파일 시스템, 이미지 선택·리사이즈, 카메라, WebView, Reanimated, Lottie, 알림 SDK와 관련 빌드 연결을 제거했다. Android manifest는 현재 네트워크 통신에 필요한 `INTERNET` 권한만 남겼다. iOS는 향후 사진 기능을 위한 사용자 안내 문구만 보존하고, 위치·모션·백그라운드 모드와 임의 HTTP 허용은 제거했다.

### 빌드 설정과 산출물

- React Native 0.73 계열에 맞는 Android Gradle 자동 연결 방식으로 통일했다.
- 광고용 Google Play Services와 strict version matcher 연결을 제거했다.
- Android 공개 런타임 설정과 비공개 release 서명 속성을 분리했다.
- 운영 서명 속성이 없더라도 Debug 빌드는 가능하고, 모든 기존 서명 속성이 제공되면 기존 release 서명 경로를 사용한다.
- iOS 프로젝트에서 오래된 `main.jsbundle` 리소스 참조와 광고 SDK 빌드 단계를 제거했다.
- Git에 있던 APK/AAB와 release 부속 산출물을 제거하고 `/android/app/release/`를 ignore 처리했다.

## 자동 검증

로컬에서 다음 검증을 통과했다.

| 검증 | 결과 |
|---|---|
| `npm ci` | 성공 |
| TypeScript | 성공 |
| ESLint | 성공 |
| Jest | 3 suites, 6 tests 성공 |
| Android `clean assembleDebug` | 성공 |
| CocoaPods 설치 | 성공, 활성 앱 모듈 4종만 자동 연결 |
| iOS Simulator `clean build` | 성공 |
| CI YAML 파싱 | 성공 |
| npm audit 치명적 등급 차단 | 치명적 취약점 0개 |

GitHub Actions 워크플로도 추가했으며, 원격 실행은 이 브랜치를 push하거나 PR을 만들 때 시작된다. 이번 작업에서는 commit이나 push를 수행하지 않았다.

## 남은 업그레이드 부채

`npm audit`에는 중간 13개, 높음 7개가 남아 있다. 현재 확인된 경로는 React Native 0.73의 CLI/Metro 도구 체인과 React Navigation 6의 `query-string` 하위 의존성이다. 앱에 직접 추가한 광고·위치·카메라 패키지에서 남은 항목은 아니다.

자동 수정의 강제 옵션은 React Native 0.87과 Metro 0.86으로 즉시 올리는 breaking change를 제안하므로 이번 단계에서는 적용하지 않았다. 치명적 취약점은 CI에서 즉시 실패하도록 차단했고, 나머지는 기능 이전 후 별도 React Native 메이저 업그레이드 단계에서 호환성 테스트와 함께 해소한다.

## 다음 단계 진입 조건

기술 기반 완료 조건인 잠금 설치, 기본 테스트, iOS·Android Debug 빌드를 모두 통과했다. 다음 작업은 로컬 기록 스키마와 저장소 계층을 먼저 정의한 뒤, 사진을 앱 전용 영구 저장소에 복사하고 삭제·실패 시 파일 정합성을 검증하는 것이다.
