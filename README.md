# AI Agent 동아리 2026년 가을 강의

동아리 강의를 위한 HTML 발표자료와 학기 포트폴리오 프로젝트다. 1회차는 `brief.md`를 기획 입력으로, `deck.json`을 화면·한국어 발표 원고의 렌더링 정본으로 사용한다. 현재 1회차는 **공개 초안**이며, 수업 실시나 내용 검토 완료를 뜻하지 않는다.

## 지금 준비된 것

- Pretendard를 로컬에서 불러오는 1920×1080 HTML 발표 엔진. 키보드 이동, 목차, deep link, 전체화면, 발표자 화면을 지원한다.
- 반응형 학기 포트폴리오. 예정 일정과 실제 실시·공개 상태를 구분한다.
- 새 `brief.md`를 반영한 본편 30장과 질의응답 1장, 한국어 발표 대본, 출처 목록.
- 직접 만든 설명용 SVG 18개와 세 YouTube 영상의 썸네일을 연결한 비공개 검토용 화면.
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

내보낸 파일은 현재 로컬 개정 `0.5.0` 기준 `exports/2026-fall/01-agent-ai-intro/0.5.0/`에 생성된다. PDF와 PPTX는 화면을 이미지로 보존하는 방식이므로 PowerPoint의 개별 텍스트·도형 편집을 지원하지 않는다. DOCX는 Pretendard가 설치된 환경에서 정상 표시된다. 폰트가 없는 Linux/LibreOffice 렌더러는 한글을 누락할 수 있어, 렌더링 QA에서는 패키지의 Pretendard 폰트를 fontconfig에 등록했다.

## 1회차 진행 전 확인

영상 세 편은 V01 → V02 → V03 순서로 전체 재생한다. 페이지에서 확인한 길이 합계는 **16:49**이며, 설명·전환 **38:00**을 더하면 본편은 **54:49**다. 고정 질의응답은 **0:00**이고, 질문은 진행 중이나 실제 남는 시간에 유동적으로 받는다. **5:11**은 추가 콘텐츠로 채우지 않고 유동 여유로 둔다. 영상의 본문·자막은 시청 검증하지 않았다.

가격·모델·기능은 `sources.yaml`의 확인일과 검증 상태를 함께 읽어야 한다. URL의 HTTP 응답만 확인된 항목을 본문 사실 검증 완료로 취급하지 않는다. 강의 전 현재 요금·학생 혜택·학교 제공 조건을 다시 확인한다.

## 새 회차와 공개 경계

`npm run lecture:new -- --slug 02-prompt-and-workflow --title "프롬프트와 작업 흐름"`는 한국어를 기본값으로 하는 빈 기획 틀만 만든다. 기획을 고치면 Codex가 한국어 `deck.json`과 출처를 재작성해야 하며, 해시 검사만 통과시키는 수정은 허용하지 않는다. 활성 규칙은 [AGENTS.md](AGENTS.md), 상세 계약은 [docs/PROJECT_SPEC.md](docs/PROJECT_SPEC.md)와 [docs/QA_AND_ACCEPTANCE.md](docs/QA_AND_ACCEPTANCE.md)에 있다.

기존 공개본과 승인 이력은 Git에 보존되어 있다. 2026-09-25에 사용자가 1회차 개정 `0.5.0`의 메인 반영과 GitHub Pages 공개를 승인했으며, `publication.approval.json`은 해당 콘텐츠 해시에 연결된다. 승인된 공개 빌드에는 학생용 슬라이드만 포함하고 발표자 원고와 PDF·PPTX·DOCX 내보내기는 제외한다. 원저작자와 재배포 권한이 확인되지 않은 YouTube 썸네일 3장은 공개 빌드에서 제외하고 비공개 원본으로만 보관한다. 제3자 자료의 재사용 범위는 [docs/LICENSE_POLICY.md](docs/LICENSE_POLICY.md)에 기록한다.

저장소: [Phjrab/ai-agent-club-2026-fall](https://github.com/Phjrab/ai-agent-club-2026-fall). 사이트: [GitHub Pages](https://phjrab.github.io/ai-agent-club-2026-fall/).

생성물(`dist/`, `exports/`, `reports/`)과 개인 메모(`.private/`)는 Git에서 제외한다. 검수 산출물의 실제 상태와 남은 항목은 [HANDOFF.md](HANDOFF.md)를 본다.
