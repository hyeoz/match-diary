# 직관일기 재운영 프로젝트 기준선

작성일: 2026-09-02  
상태: 기준선 확정 완료  
대상 앱 저장소: `hyeoz/match-diary`

## 1. Git 기준점

| 구분 | Git 기준 | 용도 |
|---|---|---|
| App Store 운영 버전 | 태그 `legacy/app-store-ios-2.3.4` | 기존 사용자 업데이트와 회귀 검증 기준 |
| 태그 대상 커밋 | `751c2911a9ef396d39dd545b0023630df1c15779` | iOS/Android 버전 `2.3.4` 빌드 커밋 |
| 재운영 브랜치 | `revival/serverless` | 서버리스 개편 작업 전용 |
| 재운영 시작 커밋 | `6c4afb881b65dc2b0b493dd0c6bf456aaca7ddc5` | 운영 버전을 포함한 기존 `main` |
| 기존 개발 브랜치 | `develop` | 미출시 Gemini/AI 작업 포함, 재운영 브랜치에 병합하지 않음 |

App Store에 현재 표시되는 최신 버전은 `2.3.4`이며 출시일은 2025-05-19이다. 앱 ID는 `6503297796`이다.

참고: [직관일기 App Store 페이지](https://apps.apple.com/kr/app/%EC%A7%81%EA%B4%80%EC%9D%BC%EA%B8%B0/id6503297796)

## 2. 앱과 스토어 식별자

식별자는 오타처럼 보여도 기존 스토어 앱의 업데이트 경로이므로 임의로 수정하지 않는다.

| 플랫폼 | 항목 | 현재 값 | 처리 원칙 |
|---|---|---|---|
| iOS | Bundle Identifier | `com.matchdirary.app` | 그대로 유지 |
| iOS | Development Team | 코드에 설정됨 | 그대로 유지, 실제 배포 전 계정에서 재확인 |
| iOS | Store Version | `2.3.4` | 다음 버전부터 증가 |
| Android | applicationId | `com.matchdiary.origin` | 그대로 유지 |
| Android | namespace | `com.matchdiary` | applicationId와 구분해 유지 |
| Android | 운영 기준 versionCode | `24` | 다음 배포부터 증가 |
| Android | 운영 기준 versionName | `2.3.4` | 다음 배포부터 증가 |

현재 `develop`의 Android 버전 `2.3.5`/`25`는 미출시 AI 작업과 함께 있으므로 운영 기준으로 사용하지 않는다. Google Play 공개 페이지는 확인되지 않아 실제 게시 상태와 마지막 versionCode는 Play Console에서 배포 직전에 재확인한다.

## 3. 서명 자산 보존 상태

- Android release keystore 2개와 로컬 `gradle.properties`를 FileVault가 적용된 접근 제한 보안 디렉터리에 복제했다.
- 원본과 보안 사본의 SHA-256이 일치하는 것을 확인했다.
- iOS 코드 서명 identity 5개가 현재 Keychain에서 유효하게 조회된다.
- 로컬 iOS provisioning profile 1개를 접근 제한 보안 디렉터리에 복제했다.
- 비밀값과 인증서 내용은 문서나 Git에 기록하지 않는다.

보안 사본 루트: `/Users/hyewonlee/project/.security-backups/match-diary-20260902/signing`

## 4. 기존 로컬 변경 보존

기존 작업 디렉터리를 바꾸지 않고 tracked 변경 내용을 일반 브랜치가 아닌 로컬 전용 ref로 보존했다.

| 저장소 | 보존 ref | 원래 작업 상태 |
|---|---|---|
| 앱 | `refs/local-safety/pre-revival-dirty-20260902` | `src/components/ChatbotButton.tsx` 수정 유지 |
| Express 백엔드 | `refs/local-safety/pre-sanitized-clone-dirty-20260902` | `app.js`, `package.json`, `package-lock.json` 수정 유지 |

이 ref들은 원격에 push하지 않는다. 앱의 기획 문서는 기존 작업 디렉터리의 `docs/`에 별도로 유지한다.

민감 이력이 제거된 백엔드 새 작업 사본은 `/Users/hyewonlee/project/matchdiary-backend-express-sanitized`에 만들었으며, 금지된 백업 SQL과 노트북 경로가 0건임을 확인했다. 기존 `matchdiary-backend-express` 작업 사본은 보존용으로만 두고 pull/merge/push하지 않는다.

## 5. 기능 범위

### 유지

- 응원 팀 선택
- 직관 기록 생성·조회·수정·삭제
- 사진과 티켓 이미지
- 캘린더와 더블헤더 기록
- 시즌·월간 직관 횟수 및 승률
- 사진 히스토리
- 방문 경기장 지도
- 공유 이미지 생성
- 직관 예정 로컬 알림
- 설정과 전체 데이터 삭제

### 서버 없이 교체

- 서버 사용자 조회·생성 → 앱 로컬 프로필
- 서버 기록 CRUD → 로컬 DB와 앱 전용 파일 저장소
- 서버 예약 CRUD → 로컬 DB와 기기 알림
- 서버 경기 조회 → GitHub Pages 일정 JSON과 기기 캐시
- 서버 팀·경기장 조회 → 앱 번들 정적 데이터
- 서버 지도 WebView → 앱 내부 지도 또는 정적 경기장 지도
- 과거 서버 마이그레이션 → 1회성 기존 사용자 자동 복구

### 제거

- 커뮤니티와 공지 API
- 자체 회원 계정과 닉네임 중복 조회
- Gemini 챗봇
- 상시 원격 사진 저장
- 모든 사용자 로컬 저장소를 서버에 복제하는 기능

### 추가

- 전체 백업 파일 생성
- 백업 복원과 무결성 검사
- 기존 서버 사용자 자동 복구
- 사진 누락 탐지와 복구 결과 리포트

## 6. 현재 서버 API 의존 지점과 대체안

| 현재 API | 사용 목적 | 재운영 대체안 |
|---|---|---|
| `GET /teams`, `GET /stadiums` | 팀·경기장 기준정보 | 앱 번들 JSON |
| `GET /match/filter`, `GET /match/:id` | 경기 일정·결과 | Pages 일정 JSON + 로컬 캐시 |
| `POST /user`, `POST /create-user`, `PATCH /user/update`, `GET /users` | 기기 ID 계정·닉네임 | 로컬 설정, 중복 조회 제거 |
| `POST /user-record/date`, `POST /user-records` | 기록 조회 | 로컬 DB query |
| `POST /create-record`, `PATCH /record/update`, `DELETE /user-records/:id` | 기록·이미지 CRUD | 로컬 DB transaction + 앱 파일 저장소 |
| `POST /bookings`, `POST /create-booking`, `DELETE /bookings/:id` | 직관 예약 | 로컬 DB + Notifee 알림 |
| `GET /community-*`, `POST /community-log` | 커뮤니티 | 제거 |
| `GET /local-storage`, `POST /create-local-storage` | 예전 기기 데이터 임시 백업 | 제거, 새 백업 파일로 교체 |
| 외부 날씨 API | 기록 화면 날씨 아이콘 | 선택적 네트워크 기능으로 격리하거나 제거 |
| Gemini API | 챗봇 | 제거 |

## 7. 기존 기기 데이터 입력 형식

2024년 운영 코드 기준 AsyncStorage 형식:

- 설정 키: `MY_TEAM`, `NICKNAME`
- 기록 키: `YYYY-MM-DD` 또는 같은 날 추가 기록인 `YYYY-MM-DD(n)`
- 기록 값: JSON
  - `image`: image picker가 반환한 객체
  - `memo`: 사용자 메모
  - `selectedStadium`: 경기장 이름 또는 축약명
  - `date`: 키와 같은 날짜 문자열
  - `home`, `away`: 당시 경기 팀 문자열 또는 값
- 1.6.1 계열에서는 선택 이미지를 `RNFS.DocumentDirectoryPath`로 복사한 구현이 존재한다.
- 이후 서버 버전은 `user_id`, `records_id`, `match_id`, `stadium_id`, `date`, `image`, `ticket_image`, `user_note` 필드를 사용한다.

기존 앱의 `migrateLocalToServer`는 서버에 같은 날짜 기록이 있으면 로컬 원본을 삭제할 수 있다. 새 자동 복구에서는 이 로직을 재사용하지 않고, 변환 검증과 백업 완료 전에는 입력 데이터를 절대 삭제하지 않는다.

## 8. 새 로컬 데이터 변환 계약

새 기록의 최소 필드:

- `id`: 앱에서 생성한 UUID
- `legacyServerRecordId`: 서버 원본 ID, 없으면 `null`
- `source`: `new`, `legacy_device`, `legacy_server` 중 하나
- `date`: 로컬 날짜 `YYYY-MM-DD`
- `matchId`: 안정적인 경기 식별자, 일정 연결이 불가능하면 `null`
- `stadiumId`: 새 정적 경기장 ID
- `stadiumNameSnapshot`: 당시 경기장 명칭 보존
- `homeTeamId`, `awayTeamId`, `homeScore`, `awayScore`: 당시 값 snapshot
- `memo`
- `imageRelativePath`, `ticketImageRelativePath`: 앱 저장소 기준 상대 경로
- `imageChecksum`, `ticketImageChecksum`: 누락·손상 확인용
- `createdAt`, `updatedAt`, `migratedAt`

중복 판정 우선순위:

1. `legacyServerRecordId`가 같으면 동일 기록
2. 서버 ID가 없으면 날짜 + 경기 + 경기장 조합
3. 경기 연결이 없으면 날짜 + 경기장 + 이미지 체크섬 조합
4. 그래도 판단할 수 없으면 자동 병합하지 않고 두 기록을 모두 보존하고 복구 리포트에 표시

## 9. 다음 구현 전에 해결할 기술 위험

- 앱 저장소의 기본 브랜치에서 Dependabot 취약점 97건이 보고된다. React Native 기반 정리 단계에서 새 기반으로 재설치하고 테스트 후 갱신한다.
- Gemini 키가 클라이언트 환경 변수로 주입되는 구조이므로 챗봇 코드와 설정을 제거한다.
- iOS에서 `NSAllowsArbitraryLoads`와 insecure HTTP 예외가 활성화돼 있으므로 제거한다.
- 사용하지 않을 백그라운드 위치, remote notification, foreground service, exact alarm 권한을 제거한다.
- 지도 WebView가 외부 웹사이트에 의존한다.
- 현재 저장·조회 화면이 API를 직접 호출하므로 UI 작업 전 repository 계층으로 분리해야 한다.

## 10. 기준선 완료 조건 결과

- 스토어 운영 버전과 Git 기준점: 완료
- iOS/Android 식별자 기록: 완료
- 서명 자산의 로컬 보안 사본: 완료
- 기존 미커밋 변경 보존: 완료
- 유지·교체·제거 기능 분류: 완료
- 서버 API 의존 지점 목록화: 완료
- 기존 기기·서버 데이터 입력 형식과 새 변환 계약: 완료
- 재운영 전용 원격 브랜치: 완료

다음 단계는 디자인 결과를 기다리는 동안 병행 가능한 **앱 기술 기반 정리**다. 먼저 서버·Gemini·커뮤니티 의존이 없는 최소 앱 셸과 저장소 인터페이스를 만들고 iOS/Android 기본 빌드와 테스트를 통과시킨다.
