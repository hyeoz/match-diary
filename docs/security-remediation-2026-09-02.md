# 직관일기 보안 수습 결과

작성일: 2026-09-02  
대상: `hyeoz/match-diary-backend-express` 및 과거 운영 자원  
상태: 즉시 노출 차단 완료, GitHub 서버 측 잔존 참조 제거 요청 필요

## 1. 완료한 조치

- GitHub 저장소를 `Public`에서 `Private`으로 전환했다.
- 비로그인 상태에서 저장소 API가 `404`를 반환하는 것을 확인했다.
- 원본 Git 이력을 로컬 FileVault 암호화 디스크의 접근 제한 디렉터리에 미러 백업하고 `git fsck --full`로 무결성을 확인했다.
- 두 원격 브랜치의 전체 이력에서 다음 파일을 제거하고 강제 갱신했다.
  - `db_backup.sql`
  - `db_backup2.sql`
  - `full_backup.sql`
  - `node_server_test.ipynb`
- `.env`, DB 파일, 백업 SQL, 노트북, 키 파일, 로그와 업로드 파일의 재커밋을 막는 `.gitignore`와 GitHub Actions 보안 검사를 추가했다.
- 저장소에 추적되던 `logs/access.log`를 제거했다.
- 최신 `main`에서 보안 검사가 통과하는 것을 확인했다.
- GitHub 취약점 알림과 자동 보안 업데이트를 활성화했다.
- 민감 객체를 참조하던 오래된 PR #2를 닫아 실수로 병합되지 않게 했다.
- 직접 접근자는 관리자 1명뿐이며 fork, deploy key, webhook, Actions secret, environment가 없음을 확인했다.

## 2. 자격증명과 과거 운영 자원 확인

- 현재 로컬 환경 파일에 남은 AWS 자격증명은 AWS에서 `InvalidClientTokenId`로 거부된다.
- 과거 설정의 S3 버킷은 `NoSuchBucket`을 반환한다.
- 과거 DB에 기록된 이미지 URL 표본 10개는 모두 공개 접근 시 `404`였다.
- Git 이력에서 발견한 과거 Slack Incoming Webhook은 현재 `404`로 비활성 상태다.
- 현재 로컬 환경 파일의 값은 Git 브랜치 이력에서 발견되지 않았다.
- AWS access key, Google API key, Slack token, GitHub token, 개인 키 형식에 대한 추가 표적 검사에서 다른 노출은 발견되지 않았다.

따라서 확인 가능한 과거 AWS/S3와 Slack 자격증명은 이미 폐기된 상태로 판단한다. 운영 클라우드 계정에 별도의 현행 자원이 있다면 해당 콘솔의 키·버킷·DB 목록은 추후 한 번 더 대조해야 한다.

## 3. 아직 남은 GitHub 서버 측 정리

브랜치 이력은 정리됐지만, GitHub가 관리하는 과거 PR #2의 `refs/pull/2/merge`에는 정리 전 객체가 남아 있다. PR은 닫았지만 이 참조는 저장소 소유자도 Git 명령이나 API로 강제 갱신·삭제할 수 없다. 저장소가 비공개이고 외부 collaborator와 fork가 없어 현재 공개 접근은 차단돼 있지만, 완전 삭제를 위해 GitHub Support의 캐시·PR 참조 정리가 필요하다.

지원 요청에 사용할 정보:

- 저장소: `hyeoz/match-diary-backend-express`
- 영향받은 PR: 1개 (`#2`)
- 제거 대상이 처음 추가된 과거 커밋:
  - `dd4b0b3a57a90c8078a38fd57dcd858c019fcbea`
  - `0c57da7a68b51bfff60c8d1ea57763c1f158f59d`
  - `451dc01dc50011f3cfa0907a44ecffce266d2269`
  - `6ff89ffa4850408a437dcdbc3311fe2face02826`
- 요청 내용: rewritten history의 캐시 제거, 영향받은 PR 참조 dereference/delete, 서버 측 garbage collection 실행

GitHub의 공식 절차: [민감한 데이터 제거 후 Support에 캐시와 PR 참조 삭제 요청](https://docs.github.com/en/enterprise-cloud@latest/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)

## 4. 의존성 취약점

취약점 알림 활성화 직후 기본 브랜치에서 56건이 탐지됐다.

| 심각도 | 건수 |
|---|---:|
| Critical | 2 |
| High | 33 |
| Medium | 14 |
| Low | 7 |

Dependabot이 보안 업데이트 PR을 생성했지만, 이 서버는 테스트가 없어 자동 병합하지 않았다. 서버를 재운영하지 않을 계획이므로 외부에 배포하거나 실행하지 않고 복구 도구에 필요한 최소 코드만 별도로 분리하는 편이 안전하다.

## 5. 로컬 작업 사본 주의사항

기존 로컬 `matchdiary-backend-express` 작업 사본에는 사용자의 미커밋 변경이 있고, 원격은 이력 재작성으로 커밋 계보가 달라졌다. 기존 사본에서 `git pull`, merge, push를 하면 삭제한 민감 이력이 다시 유입될 수 있다.

후속 개발 시에는 다음 순서를 따른다.

1. 기존 미커밋 변경을 패치로 별도 보존한다.
2. 정리된 비공개 원격을 새 디렉터리에 clone한다.
3. 필요한 변경만 검토해 새 작업 사본에 적용한다.
4. 보안 검사가 통과한 경우에만 push한다.

## 6. 다음 단계 진입 조건

- GitHub Support가 PR 참조와 캐시 제거를 완료한다.
- 운영 클라우드 콘솔에 남은 현행 자원이 없는지 계정 기준으로 최종 대조한다.
- 기존 로컬 작업 변경을 보존한 뒤 정리된 원격 기준의 새 작업 사본을 만든다.

이 세 항목이 끝나면 로드맵 1단계인 프로젝트 기준선 확정으로 넘어간다.
