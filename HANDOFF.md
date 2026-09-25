# 현재 인계 상태

작업 경로: 이 파일이 있는 `ai-agent-club-2026-fall/`. 1회차 입력은 `lectures/2026-fall/01-agent-ai-intro/brief.md`이며, 렌더링 정본은 `deck.json`이다. v3 개정 `e491d50`은 2026-09-25 원격 `main`에 반영됐다. 사용자가 이 개정의 GitHub Pages 공개도 승인했으며, 공개 플래그와 승인 해시를 갱신한 뒤 CI 및 배포 결과를 확인한다. 기존 승인 기록은 Git 이력에 보존되어 있다.

## 공개 상태와 이번 승인

- GitHub 저장소 [Phjrab/ai-agent-club-2026-fall](https://github.com/Phjrab/ai-agent-club-2026-fall)은 **public**이다. 공개 사이트는 [GitHub Pages 포트폴리오](https://phjrab.github.io/ai-agent-club-2026-fall/)에서 확인한다. 이전 배포는 [실행 36102413867](https://github.com/Phjrab/ai-agent-club-2026-fall/actions/runs/36102413867)에서 성공했다.
- 공개 사이트에는 학생용 슬라이드와 제3자 라이선스 고지만 포함한다. 발표자 화면·한국어 발표 대본·PDF/PPTX/DOCX 파일은 Pages에 넣지 않았다. 공개 저장소의 `deck.json`에는 대본이 포함되고, 기존 Git 이력에는 커밋 작성자 이메일이 보인다. 사용자가 두 항목을 포함한 공개를 후속 응답에서 명시적으로 승인했다. 재사용 라이선스는 아직 선택하지 않았다.
- 실제 공개 주소에서 포트폴리오 HTML, CSS·JS, 1회차 HTML·JSON, 라이선스 고지가 HTTP 200으로 응답했다. 발표자 화면은 HTTP 404였다. 모바일 브라우저에서 1회차 카드·31장·Pretendard 로딩·콘솔 오류 없음도 확인했다.

## 현재 개정 v3

- 2026-09-25 기준 v3 지침을 적용한 1회차 `0.5.0`이 원격 `main`에 커밋 `e491d50`으로 반영됐다. 사용자 공개 승인을 기록하고 Pages 공개 게이트를 켜는 후속 작업이 진행 중이다.
- 슬라이드와 발표 대본은 한국어를 기본으로 다시 작성했다. 다음 회차 템플릿과 `lecture:new` 생성 코드의 언어 기본값도 한국어다. 제품명·코드·경로·URL·필요한 원문 UI·출처 제목만 원문으로 유지한다.
- 사용자 첨부 3장은 세 지정 YouTube 영상의 썸네일로 기록했다. 실제 제품 화면이나 밈이 아니다. 세 장 모두 L01-S15의 V01→V02→V03 영상 카드에 원본 비율로 들어가며, 권리 미확인 상태라 공개 자산에서는 제외한다.
- 시간은 설명·전환 38:00 + 영상 전체 재생 16:49 = 본편 54:49, 고정 Q&A 0:00, 유동 여유 5:11이다. 여유 시간을 새 콘텐츠로 채우지 않는다. 영상 본문 시청 검증과 실제 리허설은 남아 있다.
- HTML·PDF·PPTX·DOCX를 `exports/2026-fall/01-agent-ai-intro/0.5.0/`에 만들었다. 슬라이드 PDF 31쪽, PPTX 31장, 대본 DOCX PDF 렌더 31쪽 확인을 기록했다. 상세 상태와 캡처 경로는 `lectures/2026-fall/01-agent-ai-intro/language-review.md`, `reports/redesign-l01-v3/export-review.md`, `reports/2026-09-25T08-58-01-371Z/qa-summary.md`에 있다.
- `publication.approval.json`은 v3 콘텐츠 해시와 사용자 공개 승인을 기록한다. 기존 승인 내용은 이전 Git 이력에 보존되어 있다. 비공개 썸네일 원본은 사이트 산출물에 포함하지 않는다.

## 최신 CI 처리

- 메인 병합 직후 CI는 저장소에서 제외된 비공개 썸네일 원본을 찾지 못해 `validate` 단계에서 실패했다. 원본은 공개 저장소에 올리지 않는다.
- 자산 검증을 수정해 공개 불가 원본이 CI 체크아웃에 없어도 메타데이터를 검증하고, 해당 원본 바이트를 공개 승인 해시에서 제외한다. 수정 후 로컬 `npm run validate`와 `npm test` 13개가 통과했다.
- 첫 Pages 실행은 기존 공개 승인 스위치가 꺼져 있어 게시 단계를 건너뛰었다. 사용자가 새 버전 공개를 승인했으므로 설정과 승인 해시를 갱신하고 CI·Pages 결과를 확인한다.

## 완료한 구현과 검증

- AGENTS.md, HTML 발표 엔진, 포트폴리오, 1회차 본편 30장과 Q&A 1장, 한국어 대본, 출처·내보내기 스크립트를 구현했다. 로컬 HTML·PDF·PPTX·DOCX 개정 `0.2.0`을 `exports/2026-fall/01-agent-ai-intro/0.2.0/`에 만들고 31페이지를 검수했다. 내보내기 검수 기록은 `reports/export-0.2.0/qa-summary.md`에 있다.
- `npm run validate`, `npm run sources:check`, `npm test` 8개, `npm run build:public`, `npm run release:check`를 통과했다. 공개 브라우저 검수는 `reports/2026-09-25T06-12-16-522Z/public-qa-summary.md`, 전체 31장 브라우저 검수는 `reports/2026-09-25T06-12-27-135Z/qa-summary.md`에서 PASS다. 주소의 슬라이드 번호만 변경해도 화면이 이동하도록 수정했다.
- 공개 준비 커밋의 [GitHub CI](https://github.com/Phjrab/ai-agent-club-2026-fall/actions/runs/36101927516)는 통과했다. 처음 Pages 실행은 저장소에 Pages가 아직 활성화되지 않아 `configure-pages` 404로 실패했지만, public 전환과 `build_type=workflow` 설정 후 위 Pages 배포가 성공했다.

## 발표 전 콘텐츠 확인

- 지정 영상 V01 6:22, V02 5:26, V03 5:01의 합계는 **16:49**다. 영상 메타데이터를 확인했지만 영상 내용은 시청 검증하지 않았고, 60분 리허설도 아직 하지 않았다.
- 현재 시간표는 설명·전환 38:00과 세 영상 전체 재생 16:49로 본편 54:49다. 고정 Q&A는 0:00이며 질문은 진행 중이나 실제 남는 시간에 유동적으로 받는다. 5:11의 여유는 새 콘텐츠로 채우지 않는다.
- 출처 목록의 URL·날짜 형식은 검사했지만 다수가 `needs_verification`이다. HTTP 200은 본문 사실 검증이 아니다. 가격·학생 혜택·학교 서비스 실제 제공 조건은 수업 전 확인해야 한다.
- 회차는 `draft`이며 수업 실시나 학생 반응·성과를 기록하지 않았다. 코드·콘텐츠 재사용 라이선스는 미결정이다.
