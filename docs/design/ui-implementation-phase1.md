# 직관일기 UI v3 1차 구현 기록

작성일: 2026-09-02
상태: React Native UI 셸 구현 및 iOS·Android Debug 검증 완료

## 구현 범위

- 승인된 연필·야구공 하트 앱 아이콘 v2를 iOS와 Android 런처 아이콘에 적용
- 마스코트 v5 개별 PNG 10종을 앱 번들에 추가
- 시작 화면과 닉네임·마이팀 선택 화면 구현
- 현재 앱의 `4+4+2` 마스코트 선택 배열 유지
- 오늘, 캘린더, 기록, 지도, 설정의 고정 5탭 앱 셸 구현
- 폴라로이드, 종이 카드, 테이프, 포스트잇, 손글씨를 공통 스타일로 정리
- 기록 작성 화면의 일정 정보 읽기 전용 영역과 좌석·메모 입력 구현
- UI 검토를 위한 로컬 프로필·기록 상태와 개발 전용 화면 진입 경로 추가

## 다음 단계에서 연결할 기능

- GitHub Pages 경기 일정 JSON과 오늘 경기 자동 입력
- 실제 경기장 좌표를 사용하는 지도
- 백업 생성·복원과 자동 복구

기능이 연결되지 않은 항목은 가짜 성공 동작을 제공하지 않고 화면 안에 다음 단계임을 명시했다.

## 검증 결과

- TypeScript 검사 통과
- 신규 UI 범위 ESLint 통과
- Jest 앱 렌더 테스트 통과
- iPhone 16 Pro / iOS 18.3 시뮬레이터 Debug 빌드·설치·실행 성공
- Android `assembleDebug` 성공

Android 로컬 빌드가 운영용 서명 키 없이도 동작하도록 release 서명 설정을 조건부로 바꾸고, React Native 플러그인이 요구하는 Hermes·AndroidX·Gradle 메모리 설정을 명시했다. 운영 release 서명은 기존 Gradle 속성이 모두 제공될 때만 활성화된다.

## 실행 캡처

- [시작](./implementation-captures/01-onboarding-intro.png)
- [닉네임·마스코트 선택](./implementation-captures/02-team-selection.png)
- [오늘](./implementation-captures/03-today.png)
- [캘린더](./implementation-captures/04-calendar.png)
- [기록·통계](./implementation-captures/05-records.png)
- [지도](./implementation-captures/06-map.png)
- [설정](./implementation-captures/07-settings.png)
- [기록 작성](./implementation-captures/08-record-editor.png)
