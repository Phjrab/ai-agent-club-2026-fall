# 현재 인계 상태

작업 경로: 이 파일이 있는 `ai-agent-club-2026-fall/`. 1회차 입력은 사용자가 지정한 `lectures/2026-fall/01-agent-ai-intro/brief.md`이며, 렌더링 정본은 `deck.json` 개정 `0.2.0`이다. 기존 `exports/.../0.1.0`은 교체 전 입력으로 생성했으므로 사용하지 않는다.

## 완료한 작업과 검증

- AGENTS.md, HTML 발표 엔진, 포트폴리오, 1회차 본편 30장과 Q&A 1장, 한국어 대본, 출처·내보내기 스크립트를 구현했다. 로컬 HTML·PDF·PPTX·DOCX 개정 `0.2.0`을 `exports/2026-fall/01-agent-ai-intro/0.2.0/`에 만들고 31페이지를 검수했다. 기존 내보내기 검수 기록은 `reports/export-0.2.0/qa-summary.md`에 있다.
- 2026-09-25 공개용 빌드를 만들어 1회차 슬라이드가 표시되고 학생용 JSON에서 대본·발표자 화면·PDF/PPTX/DOCX가 제외됨을 검사했다. 공개 브라우저 검수는 `reports/2026-09-25T06-12-16-522Z/public-qa-summary.md`, 전체 31장 브라우저 검수는 `reports/2026-09-25T06-12-27-135Z/qa-summary.md`에서 PASS다. 주소의 슬라이드 번호만 변경해도 화면이 이동하도록 수정했다.
- `npm run validate`, `npm run sources:check`, `npm test` 8개, 공개 빌드와 브라우저 QA는 통과했다. 현재 `publication.approval.json`의 공개 저장소 대본 범위가 보류라 `npm run release:check`는 예상대로 실패한다. Pages workflow는 private 저장소에서 배포 작업을 건너뛰도록 설정했다.
- [공개 준비 커밋의 CI](https://github.com/Phjrab/ai-agent-club-2026-fall/actions/runs/36101927516)는 성공했다. 같은 커밋의 [Pages workflow](https://github.com/Phjrab/ai-agent-club-2026-fall/actions/runs/36101927544)는 공개 산출물 검사까지 통과했지만, 저장소에 Pages가 활성화되지 않아 `configure-pages`에서 404로 실패했다.

## 공개 전환과 Pages 게시 차단 상태

2026-09-25 사용자 요청은 저장소 공개 전환과 GitHub Pages 게시다. 실제 저장소 [Phjrab/ai-agent-club-2026-fall](https://github.com/Phjrab/ai-agent-club-2026-fall)은 여전히 **private**이며 Pages는 게시되지 않았다. 공개 전환 명령은 자동 승인 검토에서 거부됐다. 이유는 기존 Git 이력의 커밋 작성자 개인 Gmail 주소와 추적된 `deck.json`의 한국어 발표 대본까지 공개되는 데 대해 사용자의 구체적 동의가 확인되지 않았기 때문이다. Gmail 주소는 GitHub 프로필에도 공개되어 있지만, 검토 거부를 우회하지 않았다. 이 두 항목을 명시한 승인 질문에 대한 응답을 기다린다.

응답이 승인이라면 `publication.approval.json`의 `repositorySource`와 `includeSpeakerNotesInRepository`를 `true`로 바꾸고 `approvalEvidence`를 갱신한다. 테스트·공개 빌드·`release:check`를 다시 통과시킨 뒤 GitHub에 안전하게 push한다. 그 후 저장소 공개 전환, GitHub Pages `build_type=workflow` 활성화, workflow 재실행과 실제 HTML·CSS·JS·슬라이드 응답을 확인한다. 자동 검토가 다시 거부하면 다른 경로로 우회하지 않는다. 응답이 보류라면 공개 전환과 Pages 배포는 하지 않는다.

## 발표 전 콘텐츠 확인

- 지정 영상 V01 6:22, V02 5:26, V03 5:01의 합계는 **16:49**이며 임시 예산 12:00보다 **4:49** 길다. 초안의 설명 38:00과 Q&A 10:00을 더하면 **64:49**다. 60분 리허설은 하지 않았고 영상 내용도 시청 검증하지 않았다.
- 출처 목록의 URL·날짜 형식은 검사했지만 다수가 `needs_verification`이다. HTTP 200은 본문 사실 검증이 아니다. 가격·학생 혜택·학교 서비스 실제 제공 조건은 수업 전 확인해야 한다.
- 회차는 `draft`이며 수업 실시나 학생 반응·성과를 기록하지 않았다. 코드·콘텐츠 재사용 라이선스는 미결정이다.
