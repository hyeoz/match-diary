# 직관일기

## INTRODUCE

<p align="center">
  <img src="https://github.com/hyeoz/match-diary/assets/76167244/e0f09f69-1e27-46a7-b7a0-984149c3d665" alt="Image 1" width="150" />
  <img src="https://github.com/hyeoz/match-diary/assets/76167244/6e128a44-dc5d-421d-be20-44c3d2973a5f" alt="Image 2" width="150"/>
  <img src="https://github.com/hyeoz/match-diary/assets/76167244/2440e73b-ebde-43b4-85ef-f33729b5392c" alt="Image 3" width="150"/>
  <img src="https://github.com/hyeoz/match-diary/assets/76167244/9a89ec87-1090-44a0-a29f-7899c470403c" alt="Image 4" width="150"/>
  <img src="https://github.com/hyeoz/match-diary/assets/76167244/fb490698-aa61-4fdc-9bc9-025e16b30045" alt="Image 5" width="150"/>
</p>

<strong>쉽고 빠르게 본인의 야구 경기 직관 기록을 남길 수 있는 서비스입니다.</strong>

~~현재 앱 스토어 심사 전 진행중입니다. 곧 만나요!~~

[앱스토어에서 직관일기를 만나보세요!](https://apps.apple.com/kr/app/%EC%A7%81%EA%B4%80%EC%9D%BC%EA%B8%B0/id6503297796?l=en-GB)

**직관일기 다운로드 수 300 돌파!**

## IOS ONLY

~~현재는 IOS 만 서비스 중이에요 TT~~

~~더 많은 디바이스와 함께하기 위해 TEAM직관일기가 더 노력할게요!~~

안드로이드 배포 준비중이에요. 베타테스터로 참여하고 싶으신 분은 직관일기 공식 인스타로 DM 부탁드려요🙏🏻

여러분들의 의견을 직관일기에 보내주세요. 기다리고 있을게요!

## 배포: main에 머지하면 자동으로 테스트플라이트

`.github/workflows/testflight.yml`이 main에 푸시될 때마다 macOS 러너에서 타입체크 → `pod install` → `ios/fastlane/Fastfile`의 `beta` 레인을 돈다. 레인은 배포 인증서를 임시 키체인에 넣고, 앱스토어 프로비저닝 프로파일을 받아 서명한 뒤, 빌드 번호를 테스트플라이트 마지막 번호 + 1로 올려 업로드한다. Actions 탭에서 `TestFlight`를 손으로 돌릴 수도 있다.

GitHub 저장소 Settings → Secrets and variables → Actions에 넣을 것:

| 이름 | 내용 |
| --- | --- |
| `ENV_FILE` | 로컬 `.env` 파일 내용 전체 |
| `ASC_KEY_ID` | App Store Connect → 사용자 및 액세스 → 통합 → API 키의 키 ID |
| `ASC_ISSUER_ID` | 같은 화면 위쪽의 Issuer ID |
| `ASC_KEY_P8` | 내려받은 `AuthKey_XXXX.p8` 파일 내용 전체 (`-----BEGIN PRIVATE KEY-----`부터) |
| `IOS_DIST_CERT_P12_BASE64` | 키체인에서 내보낸 Apple Distribution 인증서 `.p12`를 `base64 -i dist.p12 \| pbcopy`로 복사한 값 |
| `IOS_DIST_CERT_PASSWORD` | `.p12`를 내보낼 때 정한 암호 |

API 키는 권한을 **App Manager** 이상으로 만든다 (프로비저닝 프로파일을 만들 수 있어야 함). 이미 출시된 버전과 같은 `MARKETING_VERSION`으로는 테스트플라이트에 올라가지 않으니, 새 버전을 낼 때는 Xcode에서 버전을 먼저 올린다.

## Attribute for Assets

<a href="https://www.flaticon.com/free-icons/baseball" title="baseball icons">Baseball icons created by Freepik - Flaticon</a><br />
<a href="https://www.flaticon.com/free-icons/time-and-date" title="time and date icons">Time and date icons created by Freepik - Flaticon</a><br />
<a href="https://www.flaticon.com/free-icons/pencil" title="pencil icons">Pencil icons created by Freepik - Flaticon</a><br />
<a href="https://www.flaticon.com/free-icons/maps-and-location" title="maps and location icons">Maps and location icons created by Freepik - Flaticon</a><br />
<a href="https://www.flaticon.com/free-icons/contract" title="contract icons">Contract icons created by Freepik - Flaticon</a><br />
<a href="https://www.flaticon.com/free-icons/search" title="search icons">Search icons created by Freepik - Flaticon</a><br />
<a href="https://www.flaticon.com/free-icons/photos" title="photos icons">Photos icons created by Vectors Tank - Flaticon</a><br />
<a href="https://www.flaticon.com/free-icons/clip" title="clip icons">Clip icons created by Freepik - Flaticon</a><br />
<a href="https://www.flaticon.com/free-icons/dog" title="dog icons">Dog icons created by Freepik - Flaticon</a><br />
<a href="https://www.flaticon.com/free-icons/twins" title="twins icons">Twins icons created by Freepik - Flaticon</a><br />
<a href="https://www.flaticon.com/free-icons/wizard" title="wizard icons">Wizard icons created by Freepik - Flaticon</a><br />
<a href="https://www.flaticon.com/free-icons/eagle" title="eagle icons">Eagle icons created by Octopocto - Flaticon</a><br />
<a href="https://www.flaticon.com/free-icons/seagull" title="seagull icons">Seagull icons created by Freepik - Flaticon</a><br />
<a href="https://www.flaticon.com/free-icons/superhero" title="superhero icons">Superhero icons created by Parzival’ 1997 - Flaticon</a><br />
<a href="https://www.flaticon.com/free-icons/dinosaur" title="dinosaur icons">Dinosaur icons created by Freepik - Flaticon</a><br />
<a href="https://www.flaticon.com/free-icons/tiger" title="tiger icons">Tiger icons created by BomSymbols - Flaticon</a><br />
<a href="https://www.flaticon.com/free-icons/lion" title="lion icons">Lion icons created by Atif Arshad - Flaticon</a><br />
<a href="https://www.flaticon.com/free-icons/bear" title="bear icons">Bear icons created by Freepik - Flaticon</a><br />
<a href="https://www.flaticon.com/free-icons/contact" title="contact icons">Contact icons created by Cuputo - Flaticon</a>

<a href="https://www.koreabaseball.com/Reference/etc/KboFont.aspx">KBO DIA 고딕체</a><br />
<a href="http://uhbeefont.com/font/w/UhBeeSeulvely.html">어비 슬기로운 생활체</a>
