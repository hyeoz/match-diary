# iOS 2.4.4 release prep

## 2.4.3 이후 변경사항

2.4.3(빌드 13, `44d33f7`)은 심사를 통과해 출시됐다. 그 뒤 main에 들어온 변경은 빌드·배포 쪽뿐이고 앱 화면과 동작은 그대로다.

- 마케팅 버전 2.4.4, 앱 안 버전 표시(`APP_VERSION`) 2.4.4
- main 머지 시 GitHub Actions(macos-26) + fastlane으로 테스트플라이트 자동 업로드
- Xcode 26.4+ 빌드 에러 회피: Pods의 fmt만 C++17로 빌드, 앱 타깃에 빈 `SwiftLink.swift` 추가
- `shell-quote` 1.12.0 (npm audit critical 해소, 개발 의존성)

`src/`에서 바뀐 건 버전 문자열 한 줄뿐이라 스크린샷과 설명은 2.4.3 것을 그대로 쓴다.

## 확인한 것

- 최신 main(`85179ce`) TestFlight 워크플로 성공: 타입체크·린트·테스트(`npm run verify`) 통과 후 업로드. 이 빌드가 2.4.4 (15)
- `npm run release:verify` 통과 (iOS 기대 버전을 2.4.4로 갱신)
- 빌드 번호는 fastlane이 테스트플라이트 마지막 번호 + 1로 정하므로 저장소의 `CURRENT_PROJECT_VERSION`(13)은 그대로 둔다

## 제출 메타데이터

- 새 소식: `store/app-store/version/2.4.4/ko.json`
- 설명·키워드·지원 URL·스크린샷: 2.4.3 그대로
- 가격: 무료 유지 (유료 앱 계약 미체결)
- 판매 국가: EU 제외 유지
- 심사 제출은 사용자 확인 후 진행
