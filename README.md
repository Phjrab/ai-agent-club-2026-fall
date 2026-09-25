# AI Agent 동아리 2026년 가을 강의

동아리 강의를 위한 HTML 발표자료와 학기 포트폴리오 프로젝트다. 1회차는 `brief.md`를 기획 입력으로, `deck.json`을 화면·한국어 발표 원고의 렌더링 정본으로 사용한다. 현재 1회차는 **공개 준비 중인 초안**이며, 수업 실시나 내용 검토 완료를 뜻하지 않는다.

## 지금 준비된 것

- Pretendard를 로컬에서 불러오는 1920×1080 HTML 발표 엔진. 키보드 이동, 목차, deep link, 전체화면, 발표자 화면을 지원한다.
- 반응형 학기 포트폴리오. 예정 일정과 실제 실시·공개 상태를 구분한다.
- 새 `brief.md`를 반영한 본편 30장과 질의응답 1장, 한국어 발표 대본, 출처 목록.
- HTML 패키지, 슬라이드 PDF, 16:9 시각 호환 PPTX, 발표 대본 DOCX 내보내기.
- 검증·브라우저 QA와 승인 범위를 확인하는 GitHub Pages workflow.

## 로컬 사용

Node.js 22를 사용한다. 최초 설치와 브라우저 설치에는 인터넷이 필요하다.

```bash
npm ci
npx playwright install chromium
npm run validate
npm test
npm run build
npm run qa -- --lecture 01-agent-ai-intro
npm run export -- --lecture 01-agent-ai-intro
npm run serve -- --dir dist/private
```

마지막 명령이 표시하는 로컬 주소에서 포트폴리오를 열고, 1회차 카드로 발표자료에 들어간다. 발표자 화면은 `dist/private/lectures/01-agent-ai-intro/presenter.html`이다. `--help`로 각 명령의 인자를 확인할 수 있다. 설치 후 HTML 발표 자체는 오프라인으로 재생되지만, YouTube 원본 영상을 여는 데에는 인터넷과 소리가 필요하다.

내보낸 파일은 `exports/2026-fall/01-agent-ai-intro/0.2.0/`에 생성된다. PDF와 PPTX는 화면을 이미지로 보존하는 방식이므로 PowerPoint의 개별 텍스트·도형 편집을 지원하지 않는다. DOCX는 Pretendard가 설치된 환경에서 정상 표시된다. 폰트가 없는 Linux/LibreOffice 렌더러는 한글을 누락할 수 있어, 렌더링 QA에서는 패키지의 Pretendard 폰트를 fontconfig에 등록했다.

## 1회차 진행 전 확인

사용자가 지정한 영상 세 편의 메타데이터 길이는 6:22, 5:26, 5:01로 합계 **16:49**다. 초안은 영상을 12:00으로 배정했으므로 38분 설명과 10분 질의응답을 그대로 유지하면 **64:49**가 된다. 전체 재생과 순서는 유지하며, 60분 진행 여부는 리허설과 발표자의 시간 조정이 필요하다. 영상 내용은 아직 시청 검증되지 않았다.

가격·모델·기능은 `sources.yaml`의 확인일과 검증 상태를 함께 읽어야 한다. URL의 HTTP 응답만 확인된 항목을 본문 사실 검증 완료로 취급하지 않는다. 강의 전 현재 요금·학생 혜택·학교 제공 조건을 다시 확인한다.

## 새 회차와 공개 경계

`npm run lecture:new -- --slug 02-prompt-and-workflow --title "Prompt and Workflow"`는 빈 기획 틀만 만든다. 기획을 고치면 Codex가 `deck.json`과 출처를 재작성해야 하며, 해시 검사만 통과시키는 수정은 허용하지 않는다. 활성 규칙은 [AGENTS.md](AGENTS.md), 상세 계약은 [docs/PROJECT_SPEC.md](docs/PROJECT_SPEC.md)와 [docs/QA_AND_ACCEPTANCE.md](docs/QA_AND_ACCEPTANCE.md)에 있다.

GitHub 저장소와 Pages 사이트의 공개 준비가 끝났지만 실제 게시 상태는 [HANDOFF.md](HANDOFF.md)에 기록한다. 1회차의 현재 콘텐츠 해시와 공개 범위는 `publication.approval.json`에 있다. 사이트에는 슬라이드만 게시하고 한국어 발표 대본과 PDF·PPTX·DOCX 내보내기는 올리지 않는다. 저장소가 공개되면 `deck.json`의 발표 대본과 기존 Git 이력의 커밋 작성자 이메일도 함께 공개된다. `brief.md`의 초기 `public_approved: false`는 기획 입력 당시의 값이며, 현재 공개 결정은 별도의 승인 파일이 기록한다. 라이선스 결정과 제3자 자료 범위는 [docs/LICENSE_POLICY.md](docs/LICENSE_POLICY.md)에 기록했다.

저장소: [Phjrab/ai-agent-club-2026-fall](https://github.com/Phjrab/ai-agent-club-2026-fall). 현재 private이며 GitHub Pages는 게시 전이다.

생성물(`dist/`, `exports/`, `reports/`)과 개인 메모(`.private/`)는 Git에서 제외한다. 검수 산출물의 실제 상태와 남은 항목은 [HANDOFF.md](HANDOFF.md)를 본다.
