# 현재 인계 상태

작업 경로: 이 파일이 있는 `ai-agent-club-2026-fall/`. 1회차 입력은 사용자가 새로 지정한 `lectures/2026-fall/01-agent-ai-intro/brief.md`이고, 렌더링 정본은 개정 `0.2.0`의 `deck.json`이다. 기존 `exports/.../0.1.0`은 교체 전 입력으로 생성했으므로 사용하지 않는다.

## 완료한 로컬 작업

- AGENTS.md, 설정, HTML 발표 엔진, 포트폴리오, 1회차 본편 30장 + Q&A 1장, 출처·대본, 내보내기 스크립트, 공개 승인 게이트를 구현했다.
- `npm run validate`, `npm run sources:check`, `npm test`(8개), `npm run build`, `npm run build:public`을 통과했다. 공개 빌드에는 승인되지 않은 1회차 본문이 없다. `npm run release:check`는 공개 플래그가 둘 다 `false`이므로 예상대로 실패한다.
- `npm run qa -- --lecture 01-agent-ai-intro` 브라우저 검수는 31장, 글꼴, deep link, 키보드, 모바일 포트폴리오, project base path, 영상 순서, 차트·수식·도식·코드 fixture를 통과했다. 최신 증거: `reports/2026-09-25T05-55-19-562Z/qa-summary.md`.
- 개정 `0.2.0`의 HTML·PDF·시각 호환 PPTX·DOCX를 `exports/2026-fall/01-agent-ai-intro/0.2.0/`에 생성했다. PDF와 PPTX는 각 31페이지, DOCX는 31페이지이며 렌더링된 화면과 한글을 검수했다. 검수 기록은 `reports/export-0.2.0/qa-summary.md`를 본다.
- CI와 Pages workflow를 작성했다. Pages는 `publishSite=false`, `publicReleaseApproved=false`, 1회차 승인 상태 `unapproved`에서 게시하지 않는다. CI/Pages의 실제 GitHub 실행은 아직 확인하지 못했다.

## 발표 전 해결할 콘텐츠 문제

- 지정 영상 메타데이터 길이: V01 6:22, V02 5:26, V03 5:01, 합계 **16:49**. 임시 영상 예산 12:00보다 **4:49** 길다. 초안의 설명 38:00과 Q&A 10:00을 그대로 더하면 **64:49**다. 세 편의 전체 재생·순서는 유지했고, 60분 진행 가능 여부는 리허설로 확인해야 한다. 영상 내용은 시청 검증하지 않았다.
- `sources.yaml`의 URL·확인일 형식은 검사했지만 다수 공식 페이지는 HTTP 200과 본문 사실 검증을 구분해 `needs_verification`으로 표시했다. 가격·학생 혜택·CSU AI 실제 제공 조건은 수업 전 다시 확인해야 한다. Google 학생 혜택의 사후 요금은 출처 간 불일치가 있어 본편에 확정 금액을 넣지 않았다.
- 회차는 `draft`이며 실제 수업 진행, 학생 반응, 강의 성과를 기록하지 않았다. 코드·콘텐츠 라이선스도 미결정이다.

## GitHub 상태와 필요한 조치

로컬 저장소는 `main`으로 준비했다. 기본 샌드박스에서 `gh auth status`가 토큰 오류로 보였으나, 승인된 실행 경로에서 **Phjrab** 계정의 keyring 로그인과 `repo`, `workflow` 권한을 확인했다. 같은 실행 경로의 `gh repo view Phjrab/ai-agent-club-2026-fall`은 동명 저장소가 없다고 응답했다. 연결된 GitHub 앱도 Phjrab 프로필을 반환했다. 안전한 파일의 로컬 커밋 후 새 private 저장소를 생성·push하고, 실제 URL·가시성·원격 HEAD·CI 상태를 확인한다. 공개 전환과 GitHub Pages 게시는 별도 승인 전에는 실행하지 않는다.

로컬 브라우저 검수·export는 제한된 기본 샌드박스에서 loopback 서버가 `EPERM`으로 차단되어 승인된 실행 경로에서 완료했다.
