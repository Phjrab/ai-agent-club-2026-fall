# 프로젝트 명세 · 한 학기 AI Agent 강의 포트폴리오

정착 경로: `docs/PROJECT_SPEC.md`

## 1. 목표와 비목표

한 저장소에서 강의 기획, 화면 콘텐츠, 발표 원고, 근거, 생성 도구, 수정 이력을 관리한다. 외부 방문자는 승인된 강의와 교육 설계·개선 과정을 포트폴리오로 볼 수 있어야 한다.

초기 버전에 로그인, 출석부, 학생 개인정보 수집, 결제, 서버 DB, 실시간 채팅, LMS, 자동 AI 호출, 여러 학기 SaaS 관리 기능은 넣지 않는다. 약 5회 수업을 위한 작고 재현 가능한 정적 프로젝트를 우선한다.

## 2. 설정의 정본

루트 `course.config.json`을 만들고 최소 다음 설정을 가진다. 아래 값 중 미정인 항목을 추측으로 확정하지 않는다.

```json
{
  "schemaVersion": 1,
  "projectId": "ai-agent-club-2026-fall",
  "title": "AI Agent 활용 동아리 교육",
  "term": "2026-fall",
  "timezone": "Asia/Seoul",
  "repoName": "ai-agent-club-2026-fall",
  "githubOwner": null,
  "initialVisibility": "private",
  "publishSite": false,
  "publicReleaseApproved": false,
  "startDate": "2026-10-01",
  "weeklyDay": "THU",
  "startTime": "18:00",
  "durationMinutes": 60,
  "lectureMinutes": 50,
  "questionsMinutes": 10,
  "plannedSessionCount": 5,
  "endDate": null,
  "classroom": null,
  "examPeriods": [],
  "examCalendarConfirmed": false,
  "pauseDaysBeforeExam": 14,
  "additionalSessions": [],
  "slideLanguage": "en",
  "scriptLanguage": "ko",
  "canvas": {"width": 1920, "height": 1080},
  "fontFamily": "Pretendard",
  "basePath": "auto",
  "pptxMode": "visual",
  "publicTranscript": false,
  "contentLicenseDecision": "pending",
  "codeLicenseDecision": "pending"
}
```

`publicTranscript`는 사이트의 읽기자료/원고 노출 설정이지 GitHub 소스 접근 제어가 아니다. 공유 가능한 일반 원고만 `deck.json`에 기록하고, 실제 비공개 개인 메모는 `.private/notes/`에 별도 보관한다. 저장소를 public으로 바꿀 때는 원고와 이력을 포함한 소스 공개 범위를 별도로 승인받는다.

`githubOwner`와 실제 base path는 인증·저장소 조회 뒤 기록한다. 자동 빌드가 승인 상태를 true로 바꿔서는 안 된다. boolean뿐 아니라 6절의 콘텐츠 해시 승인도 충족해야 공개한다.

공통 설정은 기본값이다. 강의별로 명시한 언어·분량·청중은 해당 강의에서 우선한다. 발표 일정 데이터는 비밀정보가 아니지만 참석자 이름·연락처·가능 요일 응답은 공개하지 않는다.

## 3. 최종 저장소 구조

```text
ai-agent-club-2026-fall/
├── AGENTS.md
├── README.md
├── HANDOFF.md
├── WORKLOG.md
├── course.config.json
├── package.json
├── package-lock.json
├── .gitignore
├── docs/
│   ├── PROJECT_SPEC.md
│   ├── PRESENTATION_AGENT.md
│   ├── IMPLEMENTATION_PLAN.md
│   ├── QA_AND_ACCEPTANCE.md
│   ├── GITHUB_AND_PUBLICATION.md
│   ├── OPERATIONS_PROMPTS.md
│   ├── OFFICIAL_REFERENCES.md
│   ├── LICENSE_POLICY.md
│   └── decisions/
├── templates/
│   ├── LECTURE_BRIEF_TEMPLATE.md
│   └── SLIDE_SCHEMA_AND_SCRIPT.md
├── lectures/2026-fall/01-agent-ai-intro/
│   ├── brief.md
│   ├── deck.json
│   ├── sources.yaml
│   ├── assets.yaml
│   ├── charts/
│   ├── assets/
│   ├── reflection.md
│   └── publication.approval.json
├── src/
│   ├── presentation/
│   ├── portfolio/
│   ├── styles/
│   ├── components/
│   └── schemas/
├── scripts/
├── tests/
│   ├── fixtures/
│   ├── unit/
│   └── browser/
├── .github/
│   ├── workflows/
│   ├── ISSUE_TEMPLATE/
│   └── pull_request_template.md
├── reports/                 # 기본 gitignore; 로컬/CI 검수 증거
├── dist/private/            # gitignore; drafts and presenter view
├── dist/public/             # gitignore; approved distribution only
├── exports/                 # gitignore; generated PDF/PPTX/DOCX
├── .cache/                  # gitignore; assets and tool cache
└── .private/                # gitignore; never publish
```

폴더 설명의 언어는 실제 생성 시 한국어로 통일한다. 구현 편의를 위해 모듈 파일 이름은 조정해도 되지만 외부에서 쓰는 CLI, 사용자 입력 경로, 산출물 경로 계약은 유지한다.

이 팩의 `02_`부터 `08_`까지 문서는 대응되는 `docs/` 파일로 정착시킨다. 초기 프롬프트는 `prompts/bootstrap/`에 참고용으로 보관할 수 있다. 활성 규칙은 `docs/` 한 벌이고, 과거 팩을 매번 함께 읽어 상충시키지 않는다.

## 4. 콘텐츠와 코드의 책임 분리

### 4.1 사용자가 유지할 파일

`brief.md`에는 이번 강의에서 무엇을 가르칠지, 청중, 시간, 반드시 포함할 내용, 실제 경험, 금지할 설명을 기록한다. Markdown은 자연어 기획이며 임의의 자연어를 정확한 발표로 바꾸는 마법의 정적 컴파일러라고 설명하지 않는다.

### 4.2 Codex가 작성할 파일

Codex가 자료를 확인하고 `deck.json`, `sources.yaml`, 차트 데이터, 안전한 이미지, `assets.yaml`을 작성한다. `deck.json`은 화면·발표 원고·시각자료 참조를 함께 갖는 **렌더링 콘텐츠의 단일 정본**이다.

`deck.json`에 `brief.md`의 SHA-256을 `inputDigest`로 저장한다. 입력 변경 후 콘텐츠를 재작성하지 않고 예전 산출물로 빌드하면 검증 실패로 처리한다. 해시만 바꿔 검사를 속이지 말고 실제 내용 변경을 검토한다.

### 4.3 결정적 빌드가 생성할 파일

HTML, 화면 이미지, PDF, PPTX, DOCX, 공개 읽기 버전, 출처 목록은 구조화 데이터에서 생성한다. 파생 발표 대본 MD/DOCX를 직접 수정해 또 하나의 정본을 만들지 않는다. 원고 수정 요청은 `deck.json`의 해당 slide ID notes 필드에 반영하고 다시 내보낸다.

동일 콘텐츠의 의미·순서·슬라이드 수가 동일해야 한다. 파일 생성시각·ZIP 메타데이터까지 byte-for-byte 동일함을 초기 요구로 삼지는 않는다. 빌드 결과에는 source commit과 콘텐츠 digest를 기록한다.

## 5. 기술 구성과 UI 범위

Node.js와 npm의 실행 가능한 LTS 조합을 구현 때 선택하고 정확한 버전·lockfile을 고정한다. 프런트엔드는 HTML/CSS/Vanilla JS 중심으로 구성한다. 작은 번들러를 쓰더라도 React/Next.js·서버·DB로 불필요하게 확장하지 않는다.

Chart.js는 수치 그래프, KaTeX는 수식, Prism.js는 코드, Mermaid는 복잡한 관계도에 사용한다. 라이브러리를 설치했다는 이유만으로 모든 강의에 차트·수식·코드를 억지로 넣지 않는다.

발표 화면에는 다음이 필요하다.

- 좌우 방향키, PageUp/PageDown, Space, Home/End 탐색; 입력창에서는 단축키를 가로채지 않음.
- 현재 페이지, 전체 페이지, 전체화면 버튼, 도움말, 목차 이동.
- `#slide=L01-S003` 같은 안정적인 deep link와 직접 새로고침 복원.
- 고정 논리 캔버스를 비율 유지해 viewport에 맞춤. 모바일용 포트폴리오는 반응형이지만 슬라이드 내부는 따로 재배치하지 않음.
- private 발표자 화면에서 현재 슬라이드, 다음 슬라이드, 원고, 타이머 확인. 학생용 HTML에는 private 원고를 숨김 CSS로만 넣지 않고 실제 제외.
- 외부 네트워크 요청 없이 로컬 HTTP 재생. 초기 설치와 별개로, 설치 후 발표 재생에는 인터넷을 요구하지 않음.

화려한 전환 효과와 커스텀 애니메이션 엔진은 비목표다. 표현에 필요한 단계 강조는 정적 또는 간단한 사용자 제어로 충분하다.

## 6. 콘텐츠·공개 상태와 승인

서로 다른 상태를 하나의 `done`으로 뭉치지 않는다.

- 콘텐츠 상태: `planned`, `draft`, `reviewed`, `archived`.
- 진행 상태: `scheduled`, `held`, `cancelled`, `unknown`.
- 검증 상태: `pass`, `fail`, `blocked`, `not_run`.
- 공개 상태: `private`, `approved`, `published`.

`reviewed` 또는 `held`는 날짜가 지났다는 이유로 자동 부여하지 않는다. 사용자의 실제 확인이 필요하다.

공개에는 `publication.approval.json`을 사용한다. 승인 대상은 brief/deck/출처/데이터/이미지/공개 설명의 정규화된 콘텐츠 묶음 해시로 식별한다. 승인 문서에는 승인 시각, 범위, 사용자 지시의 짧은 요약을 남기되 개인정보가 있는 원문 채팅을 복사하지 않는다.

콘텐츠가 바뀌면 이전 승인 해시가 불일치하므로 다시 비공개로 되돌린다. 썸네일·PDF·목록에서 사라져야 하며 이전 빌드의 잔여 파일을 깨끗이 제거한다. 디자인 코드만 바뀐 경우 콘텐츠 승인은 유지할 수 있지만 새 QA가 필요하다.

초기에는 `draft` 1회차를 private 빌드에서 완전히 검토할 수 있어야 한다. 공개 빌드는 승인되지 않은 강의의 본문·원고·썸네일·검색 인덱스를 포함하지 않는다. “준비 중” 카드에는 공개 승인된 제목·일정 정보만 노출한다.

## 7. 포트폴리오 화면

메인은 강의 소개, 대상, 수업 방식, 예정 일정, 회차 카드, 교육 설계, 개선 기록, 저장소 링크로 구성한다. “강의 목록”만이 아니라 사용자가 무엇을 기획하고 어떻게 검증·개선했는지 보여준다.

회차 카드에는 회차, 제목, 실제 확정 날짜 또는 미정, 주요 학습 목표, 승인 상태에 따른 슬라이드·PDF·읽기자료 링크, 정보 확인일을 넣는다. 생성하지 않은 다운로드 링크를 먼저 만들지 않는다.

학기 회고는 기획 → 사용자 판단 → AI를 활용한 제작 → 실제 검토 → 수정의 기여를 구분한다. 참석자 수, 만족도, 학습 효과, 매주 실시 여부는 확인된 데이터가 있을 때만 표시한다. `reflection.md`는 처음에 빈 질문 틀로 만들며 수강생 피드백을 창작하지 않는다.

## 8. 일정 처리

첫 일정 `2026-10-01 18:00–19:00 Asia/Seoul`만 확정값이다. 2회차 이후 날짜는 시험 일정이 확인되기 전에는 예정 후보로 표시한다. 날짜를 자동 생성했다고 공식 공지한 일정처럼 보이면 안 된다.

시험기간은 `{startDate, endDate}`로 입력한다. 해당 시험 시작일에서 14일 전인 날짜부터 시험 종료일까지 휴강 구간으로 처리한다. 중간·기말이 있으면 각각 적용한다. 시험일 데이터가 없으면 자동 휴강 계산을 성공했다고 주장하지 않는다.

추가 요일 수업은 사용자가 확정한 일정만 `additionalSessions`에 넣는다. 개인톡·투표·학생별 가능 요일을 수집하거나 공개하는 기능은 만들지 않는다. 9월 27일 투표 마감은 초기 공지 정보일 뿐 매주 반복할 일정이 아니다.

## 9. 반드시 구현할 명령 계약

아래는 앞으로 Codex가 구현해야 할 명령이지, 이 팩에 실행 코드가 이미 들어 있다는 뜻이 아니다. 모든 명령은 `--help`와 명확한 오류·종료 코드를 제공한다.

| 명령 | 역할 |
|---|---|
| `npm ci` | lockfile 기반 설치 |
| `npm run setup:assets` | 승인된 공식 출처에서 글꼴 등 필요한 자산 확보·버전 확인 |
| `npm run dev` | private 포트폴리오·발표자료 로컬 검토 |
| `npm run build` | private 기본 빌드; 외부 조사/AI 호출 없음 |
| `npm run build:public` | 공개 승인 해시·권리 점검 통과 자료만 정적 생성 |
| `npm run serve -- --dir dist/private` | 빌드한 자료를 로컬 HTTP로 재생 |
| `npm run validate` | schema·출처 참조·입력 해시·자산·정책 검사 |
| `npm test` | 유닛·계약·실패 fixture 테스트 |
| `npm run qa -- --lecture 01-agent-ai-intro` | 실제 브라우저·시각 검수 증거 생성 |
| `npm run export -- --lecture 01-agent-ai-intro` | HTML 패키지·PDF·visual PPTX·DOCX 생성 및 export 검증 |
| `npm run lecture:new -- --slug 02-prompt-and-workflow --title "Prompt and Workflow"` | 새 brief·폴더 틀만 생성, AI 집필은 하지 않음 |
| `npm run sources:check` | 출처 URL·확인일 점검; 내용의 진실을 자동 보증하지 않음 |
| `npm run release:check` | 실제 공개 artifact와 Git 추적 파일·승인 상태 검사 |

`--lecture`는 유일한 slug를 받는다. 여러 학기에서 충돌하면 `--term`을 요구하고 임의 선택하지 않는다. `npm run export`가 실행 불가능한 변환기를 조용히 건너뛰면서 성공하지 않도록 한다.

## 10. 내보내기 계약

`exports/<term>/<slug>/<revision>/` 아래에 HTML 패키지, `slides.pdf`, `slides.visual.pptx`, `speaker-script.docx`, 산출물 manifest를 생성한다.

PPTX 기본 모드는 HTML 슬라이드의 고해상도 이미지를 장마다 넣는 시각적 호환 방식이다. 가능하면 해당 슬라이드 노트를 함께 넣는다. 텍스트·Chart.js·DOM이 자동으로 편집 가능한 PowerPoint 개체가 되는 것은 아니다. 편집 가능한 PPTX는 별도 구현 범위로 구분한다.

PDF는 한 슬라이드 한 페이지다. DOCX는 공부용 해설과 실제 읽는 발표 원고를 분리한다. 공개 사이트 다운로드에는 승인된 PDF만 기본 포함하고, 상세 발표 대본 다운로드는 기본 제외한다. 다만 public GitHub 저장소의 추적된 `deck.json`에 들어 있는 원고는 소스에서 읽을 수 있으므로, 사이트 transcript 설정을 원고의 비밀 보장으로 설명하지 않는다.

## 11. Git 관리 대상

기획 MD, 렌더링 데이터, 출처 메타데이터, 안전한 사용자 이미지, 소스 코드, 설정, lockfile, 작은 회고·결정 기록은 추적한다. `node_modules`, 대형 생성물, 로컬 로그, 인증 파일, 원본 첨부자료, 글꼴 설치 캐시, private 원고 메모는 추적하지 않는다.

원본 논문·강의 PDF를 공개 저장소에 무조건 복사하지 않는다. 필요한 Figure의 사용 가능 범위를 확인하거나 원문 링크·자체 설명 도식으로 대체한다. 콘텐츠와 생성 코드의 라이선스는 분리해 사용자가 결정할 수 있게 하며, 명시적 선택 전에는 임의의 MIT/CC 라이선스를 전체 저장소에 붙이지 않는다.
