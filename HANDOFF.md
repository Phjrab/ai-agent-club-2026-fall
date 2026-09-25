# 현재 인계 상태

작업 경로: 이 파일이 있는 `ai-agent-club-2026-fall/`. 1회차 입력은 사용자가 지정한 `lectures/2026-fall/01-agent-ai-intro/brief.md`이며, 렌더링 정본은 `deck.json` 개정 `0.2.0`이다. 기존 `exports/.../0.1.0`은 교체 전 입력으로 생성했으므로 사용하지 않는다.

## 공개 상태

- GitHub 저장소 [Phjrab/ai-agent-club-2026-fall](https://github.com/Phjrab/ai-agent-club-2026-fall)은 **public**이다. [GitHub Pages 포트폴리오](https://phjrab.github.io/ai-agent-club-2026-fall/)에서 공개 초안 1회차의 슬라이드 31장을 볼 수 있다. [Pages 배포 실행](https://github.com/Phjrab/ai-agent-club-2026-fall/actions/runs/36102413867)은 성공했다.
- 공개 사이트에는 학생용 슬라이드와 제3자 라이선스 고지만 포함한다. 발표자 화면·한국어 발표 대본·PDF/PPTX/DOCX 파일은 Pages에 넣지 않았다. 공개 저장소의 `deck.json`에는 대본이 포함되고, 기존 Git 이력에는 커밋 작성자 이메일이 보인다. 사용자가 두 항목을 포함한 공개를 후속 응답에서 명시적으로 승인했다. 재사용 라이선스는 아직 선택하지 않았다.
- 실제 공개 주소에서 포트폴리오 HTML, CSS·JS, 1회차 HTML·JSON, 라이선스 고지가 HTTP 200으로 응답했다. 발표자 화면은 HTTP 404였다. 모바일 브라우저에서 1회차 카드·31장·Pretendard 로딩·콘솔 오류 없음도 확인했다.

## 완료한 구현과 검증

- AGENTS.md, HTML 발표 엔진, 포트폴리오, 1회차 본편 30장과 Q&A 1장, 한국어 대본, 출처·내보내기 스크립트를 구현했다. 로컬 HTML·PDF·PPTX·DOCX 개정 `0.2.0`을 `exports/2026-fall/01-agent-ai-intro/0.2.0/`에 만들고 31페이지를 검수했다. 내보내기 검수 기록은 `reports/export-0.2.0/qa-summary.md`에 있다.
- `npm run validate`, `npm run sources:check`, `npm test` 8개, `npm run build:public`, `npm run release:check`를 통과했다. 공개 브라우저 검수는 `reports/2026-09-25T06-12-16-522Z/public-qa-summary.md`, 전체 31장 브라우저 검수는 `reports/2026-09-25T06-12-27-135Z/qa-summary.md`에서 PASS다. 주소의 슬라이드 번호만 변경해도 화면이 이동하도록 수정했다.
- 공개 준비 커밋의 [GitHub CI](https://github.com/Phjrab/ai-agent-club-2026-fall/actions/runs/36101927516)는 통과했다. 처음 Pages 실행은 저장소에 Pages가 아직 활성화되지 않아 `configure-pages` 404로 실패했지만, public 전환과 `build_type=workflow` 설정 후 위 Pages 배포가 성공했다.

## 발표 전 콘텐츠 확인

- 지정 영상 V01 6:22, V02 5:26, V03 5:01의 합계는 **16:49**이며 임시 예산 12:00보다 **4:49** 길다. 초안의 설명 38:00과 Q&A 10:00을 더하면 **64:49**다. 60분 리허설은 하지 않았고 영상 내용도 시청 검증하지 않았다.
- 출처 목록의 URL·날짜 형식은 검사했지만 다수가 `needs_verification`이다. HTTP 200은 본문 사실 검증이 아니다. 가격·학생 혜택·학교 서비스 실제 제공 조건은 수업 전 확인해야 한다.
- 회차는 `draft`이며 수업 실시나 학생 반응·성과를 기록하지 않았다. 코드·콘텐츠 재사용 라이선스는 미결정이다.
