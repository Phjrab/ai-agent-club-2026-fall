# 현재 인계 상태

작업 경로: 이 파일이 있는 `ai-agent-club-2026-fall/`. 1회차 입력은 `lectures/2026-fall/01-agent-ai-intro/brief.md`이며, 렌더링 정본은 `deck.json`이다. 원격 `main`은 `782a4af`이고 공개 사이트에는 이전 31장 버전이 게시돼 있다. 사용자 제공 요금 캡처 세 장을 L01-S09·S09A·S09B에 원본 그대로 추가한 PR [#1](https://github.com/Phjrab/ai-agent-club-2026-fall/pull/1)은 공개 브랜치에 올라갔고 최신 커밋은 `065f25e`다. PR/브랜치 CI와 로컬 공개 QA는 통과했지만, 공개 전 최종 화면 확인을 요구한 자동 검토가 병합을 거부해 `main`과 공개 사이트는 아직 갱신하지 않았다. 사용자는 세 원본을 공개본과 향후 개정본에서 그대로 사용하는 것을 명시적으로 허용했다. 병합 전 세 캡처 슬라이드의 최종 화면 검토가 필요하다.

## 공개 상태와 이번 승인

- GitHub 저장소 [Phjrab/ai-agent-club-2026-fall](https://github.com/Phjrab/ai-agent-club-2026-fall)은 **public**이다. 공개 사이트는 [GitHub Pages 포트폴리오](https://phjrab.github.io/ai-agent-club-2026-fall/)에서 확인한다. 이전 배포는 [실행 36102413867](https://github.com/Phjrab/ai-agent-club-2026-fall/actions/runs/36102413867)에서 성공했다.
- 공개 사이트에는 학생용 슬라이드와 제3자 라이선스 고지만 포함한다. 발표자 화면·한국어 발표 대본·PDF/PPTX/DOCX 파일은 Pages에 넣지 않았다. 공개 저장소의 `deck.json`에는 대본이 포함되고, 기존 Git 이력에는 커밋 작성자 이메일이 보인다. 사용자가 두 항목을 포함한 공개를 후속 응답에서 명시적으로 승인했다. 재사용 라이선스는 아직 선택하지 않았다.
- 실제 공개 주소에서 포트폴리오 HTML, CSS·JS, 1회차 HTML·JSON, 라이선스 고지가 HTTP 200으로 응답했다. 발표자 화면은 HTTP 404였다. 이전 공개본에서 모바일 브라우저의 31장·Pretendard 로딩·콘솔 오류 없음을 확인했다. 이번 변경의 공개 브라우저 QA는 통과했으며 결과는 `reports/2026-09-25T12-23-45-513Z/public-qa-summary.md`다. 병합 전이라 공개 사이트는 기존 31장 상태다.

## 현재 개정 v3

- 2026-09-25 기준 v3 지침을 적용한 1회차 `0.5.0`이 원격 `main`에 커밋 `e491d50`으로 반영됐다. 사용자 승인으로 Pages 공개도 완료됐다. 이번 작업 결과는 그 뒤의 로컬 변경이다.
- 슬라이드와 발표 대본은 한국어를 기본으로 다시 작성했다. 다음 회차 템플릿과 `lecture:new` 생성 코드의 언어 기본값도 한국어다. 제품명·코드·경로·URL·필요한 원문 UI·출처 제목만 원문으로 유지한다.
- 먼저 제공된 영상 썸네일 3장은 사용자 제공 YouTube 썸네일이며 실제 제품 화면이나 밈이 아니다. L01-S15의 V01→V02→V03 카드에 들어가고, 권리 미확인으로 공개 자산에서는 제외한다. 별도로 이번에 추가한 ChatGPT·Claude·Google 요금 페이지 원본 PNG 3장은 `assets/user/`에 있고, 각각 L01-S09·S09A·S09B의 전체 화면 슬라이드에 들어간다. 업로드된 원본과 SHA-256이 일치하며 세 장 모두 1920×1080이다. 크롭·합성·픽셀 편집 없이 `object-fit: contain`으로 전체 화면에 배치했고, 원본 브라우저 UI도 보존된다. `U02` 및 자산 메타데이터에 사용자의 공개·향후 사용 승인을 기록했다.
- 본편은 32장, Q&A 1장이다. 본편 계획 시간 54:49, Q&A 고정 배정 0:00, 유동 여유 5:11은 유지했다. 새 요금 화면 3장은 전체 시간표 안에서 기존 시간을 재배분했다.
- 최신 전체 브라우저 QA는 `reports/2026-09-25T12-23-39-036Z/qa-summary.md`, 공개 빌드 QA는 `reports/2026-09-25T12-23-45-513Z/public-qa-summary.md`에서 전 항목 PASS다. 13개 테스트, `validate`, 공개 게이트도 통과했다. `sources:check`는 PASS이며 URL 본문 확인이 별도로 필요한 기존 경고를 출력한다.
- 공개 빌드와 QA가 최신 승인 콘텐츠로 확인됐다. `dist/public/`은 생성된 공개 산출물이며 Git 추적 대상이 아니다. 변경은 원격 PR 브랜치에 올라갔지만 아직 `main`에 병합하거나 Pages에 배포하지 않았다.
- 시간은 설명·전환 38:00 + 영상 전체 재생 16:49 = 본편 54:49, 고정 Q&A 0:00, 유동 여유 5:11이다. 여유 시간을 새 콘텐츠로 채우지 않는다. 영상 본문 시청 검증과 실제 리허설은 남아 있다.
- HTML·PDF·PPTX·DOCX를 `exports/2026-fall/01-agent-ai-intro/0.5.0/`에 만들었다. 슬라이드 PDF 31쪽, PPTX 31장, 대본 DOCX PDF 렌더 31쪽 확인을 기록했다. 상세 상태와 캡처 경로는 `lectures/2026-fall/01-agent-ai-intro/language-review.md`, `reports/redesign-l01-v3/export-review.md`, `reports/2026-09-25T08-58-01-371Z/qa-summary.md`에 있다.
- `publication.approval.json`은 현재 로컬 콘텐츠 해시와 사이트 공개 승인을 기록한다. 공개 산출물에는 사용자 승인된 요금 캡처를 포함하고, 권리 미확인 YouTube 썸네일 원본은 제외한다. 발표자 원고·PDF·PPTX·DOCX는 기존 배포 범위대로 Pages에서 제외한다.

## 최신 CI 처리

- 메인 병합 직후 CI는 저장소에서 제외된 비공개 썸네일 원본을 찾지 못해 `validate` 단계에서 실패했다. 원본은 공개 저장소에 올리지 않는다.
- 자산 검증을 수정해 공개 불가 원본이 CI 체크아웃에 없어도 메타데이터를 검증하고, 해당 원본 바이트를 공개 승인 해시에서 제외한다. 수정 후 로컬 `npm run validate`와 `npm test` 13개가 통과했다.
- PR #1의 CI는 최신 커밋 `065f25e`에서 브랜치 push와 pull request 이벤트 모두 PASS다. 첫 CI가 공개 덱에서 권리 미확인 ChatGPT 입력창 자산 참조를 발견해, 해당 슬라이드를 자체 제작한 설명 도식으로 복원하고 공개 슬라이드의 모든 이미지 참조가 공개 파일로 존재하는지 테스트를 추가했다. 자동 검토가 최종 화면 확인 전 공개 배포를 허용하지 않아 병합하지 않았다. 최종 화면 검토와 재확인 후에만 `main` 병합 및 Pages 배포를 진행한다.

## 완료한 구현과 검증

- AGENTS.md, HTML 발표 엔진, 포트폴리오, 1회차 본편 30장과 Q&A 1장, 한국어 대본, 출처·내보내기 스크립트를 구현했다. 로컬 HTML·PDF·PPTX·DOCX 개정 `0.2.0`을 `exports/2026-fall/01-agent-ai-intro/0.2.0/`에 만들고 31페이지를 검수했다. 내보내기 검수 기록은 `reports/export-0.2.0/qa-summary.md`에 있다.
- `npm run validate`, `npm run sources:check`, `npm test` 8개, `npm run build:public`, `npm run release:check`를 통과했다. 공개 브라우저 검수는 `reports/2026-09-25T06-12-16-522Z/public-qa-summary.md`, 전체 31장 브라우저 검수는 `reports/2026-09-25T06-12-27-135Z/qa-summary.md`에서 PASS다. 주소의 슬라이드 번호만 변경해도 화면이 이동하도록 수정했다.
- 공개 준비 커밋의 [GitHub CI](https://github.com/Phjrab/ai-agent-club-2026-fall/actions/runs/36101927516)는 통과했다. 처음 Pages 실행은 저장소에 Pages가 아직 활성화되지 않아 `configure-pages` 404로 실패했지만, public 전환과 `build_type=workflow` 설정 후 위 Pages 배포가 성공했다.

## 발표 전 콘텐츠 확인

- 지정 영상 V01 6:22, V02 5:26, V03 5:01의 합계는 **16:49**다. 영상 메타데이터를 확인했지만 영상 내용은 시청 검증하지 않았고, 60분 리허설도 아직 하지 않았다.
- 현재 시간표는 설명·전환 38:00과 세 영상 전체 재생 16:49로 본편 54:49다. 고정 Q&A는 0:00이며 질문은 진행 중이나 실제 남는 시간에 유동적으로 받는다. 5:11의 여유는 새 콘텐츠로 채우지 않는다.
- 출처 목록의 URL·날짜 형식은 검사했지만 다수가 `needs_verification`이다. HTTP 200은 본문 사실 검증이 아니다. 가격·학생 혜택·학교 서비스 실제 제공 조건은 수업 전 확인해야 한다.
- 회차는 `draft`이며 수업 실시나 학생 반응·성과를 기록하지 않았다. 코드·콘텐츠 재사용 라이선스는 미결정이다.
