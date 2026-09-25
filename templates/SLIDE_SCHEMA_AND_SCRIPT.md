# 슬라이드 데이터·출처·발표 대본 계약

최종 경로: `templates/SLIDE_SCHEMA_AND_SCRIPT.md`

이 문서는 Codex가 JSON Schema와 파서를 구현할 때 따를 계약이다. 아래 예시는 형식을 설명하기 위한 것이며, 자리표시자 hash를 가진 상태로 실제 검수를 통과시키면 안 된다.

## 1. 렌더링 정본

사용자가 작성한 `brief.md`를 Codex가 읽어 `deck.json`을 작성한다. HTML·PDF·PPTX·DOCX·읽기자료는 여기서 파생된다.

`deck.json`에는 보통의 교육용 발표 원고를 포함할 수 있지만 학생 정보·비밀정보·비공개 개인 메모를 넣지 않는다. 웹사이트에서 원고를 제외하는 것과 GitHub 소스의 공개 여부는 별개다. 공개 repo로 전환할 때는 원고를 포함한 추적 파일 공개에 대한 승인이 필요하다.

진짜 private 메모가 필요하면 `.private/notes/<slug>.json`에 slide ID별 추가 메모로 보관한다. 이를 배포 build가 읽지 않게 한다. 공개 원고와 private 메모를 서로 다른 동일 내용 정본처럼 중복 관리하지 않는다.

## 2. 최소 예시 구조

```json
{
  "schemaVersion": 1,
  "lectureId": "L01",
  "slug": "01-agent-ai-intro",
  "term": "2026-fall",
  "title": "AI에게 묻고 맡기기",
  "revision": "0.1.0",
  "inputDigest": "COMPUTE_SHA256_OF_BRIEF",
  "sourceRegistryDigest": "COMPUTE_SHA256_OF_SOURCE_REGISTRY",
  "slideLanguage": "ko",
  "scriptLanguage": "ko",
  "contentState": "draft",
  "plannedMainDurationSec": 120,
  "questionsSec": 0,
  "questionsMode": "flexible",
  "slides": [
    {
      "id": "L01-S001",
      "kind": "main",
      "sectionId": "opening",
      "layout": "cover",
      "title": "AI에게 묻고, 일을 맡기기",
      "takeaway": "AI를 고르고, 범위를 정해 맡기고, 결과를 확인한다",
      "requirementIds": [],
      "durationSec": 120,
      "sourcePolicy": "not_applicable",
      "sourceReason": "강의 제목과 진행 안내",
      "sourceIds": [],
      "blocks": [
        {"type": "paragraph", "text": "AI Agent Club · Fall 2026"}
      ],
      "speakerNotes": {
        "background": [],
        "say": "오늘은 AI에게 질문하는 방식에서 작업을 맡기는 방식으로 시야를 넓혀 보겠습니다. 실습 시간은 따로 없고, 각 도구가 어떤 역할을 하는지와 제가 사용하면서 배운 점을 중심으로 이야기하겠습니다.",
        "pointTo": ["제목", "이번 수업의 진행 방식"],
        "pitfalls": [],
        "transition": "먼저 여러 AI 회사와 제품을 구분해서 보겠습니다."
      }
    }
  ]
}
```

위 예시는 120초짜리 한 장의 최소 예시다. 실제 회차의 본편·질의응답·유동 여유는 `duration_minutes`, `questions_minutes`, `questions_mode`와 각 장의 시간에서 계산한다. 30장이나 특정 질의응답 분량을 모든 회차에 고정하지 않는다.

## 3. 필드 계약

- `schemaVersion`과 `revision`은 형식 변경과 강의 내용 변경을 구분한다.
- `id`는 강의 전체에서 고유하고 수정·재배치에도 안정적으로 유지한다. 화면의 순번은 배열 순서로 계산한다. 삭제된 ID를 다른 내용에 재사용하지 않는다.
- `kind`는 `main`, `appendix`, `qa` 중 하나다. 본편 장수와 설명 시간에는 `main`을 집계하고 Q&A는 `qa`·`questionsSec`로 별도 집계한다.
- `layout`은 등록된 레이아웃만 허용한다. unknown layout을 빈 장으로 렌더링하지 않는다.
- `requirementIds`는 brief의 필수 내용에 연결된다. 모든 장에 억지로 requirement를 붙일 필요는 없지만 모든 필수 요구가 적어도 한 장에 연결되어야 한다.
- `sourcePolicy`는 `external`, `personal_experience`, `not_applicable`, `illustrative`로 나눈다. external이면 유효 source ID가 필요하다.
- `durationSec`는 실제 말할 내용의 목표 시간이다. 학습용 추가 설명은 별도다.
- `speakerNotes.say`와 `transition`은 본편에서 기본 필수다. 나머지는 설명에 필요한 경우만 포함한다.
- 발표 화면에는 자료에서 무엇을 읽을지 `takeaway` 또는 적절한 callout으로 보여준다.

## 4. 허용하는 콘텐츠 block

| type | 주요 필드 | 제한 |
|---|---|---|
| paragraph | text | 짧은 문장, raw HTML 없음 |
| bullets | items | 보통 2–5개 이내 |
| callout | text, label | 핵심 메시지·가정·주의 표시 |
| figure | assetId, alt, caption, focus | 자산 manifest 참조, contain 기본 |
| chart | chartId, caption, takeaway | 독립 데이터 파일·출처 참조 |
| diagram | diagramId, caption | 검증한 SVG 또는 strict Mermaid |
| math | latex, explanation | 렌더링 오류를 드러냄 |
| code | language, text, highlightedLines | 텍스트 실행 금지, 가짜 token만 사용 |
| table | columns, rows, caption, units | 과도한 열·작은 글자 방지 |
| comparison | criteria, items | 같은 기준·조건으로 비교 |

진짜 필요한 추가 유형은 schema·renderer·QA를 함께 업데이트한다. arbitrary JS callback, `eval`, 동적 shell 명령, 외부 script 태그를 입력 포맷으로 허용하지 않는다.

## 5. source registry

`sources.yaml`은 실제 사용하는 근거만 기록한다. URL이 존재한다는 것만으로 source claim이 확인된 것으로 처리하지 않는다.

```yaml
schema_version: 1
sources:
  - id: SRC-EXAMPLE
    type: official_documentation
    title: "실제로 확인한 문서 제목"
    publisher: "공식 기관 또는 기업"
    url: "REPLACE_WITH_VERIFIED_OFFICIAL_URL"
    published_at: null
    checked_at: "YYYY-MM-DD"
    location: "관련 절 또는 페이지"
    verification_status: needs_verification
    supports:
      - "확인한 주장과 적용 조건을 짧게 기록"
    caveats:
      - "해당될 때만 주의사항 기록"
```

검증 상태는 `verified`, `needs_verification`, `unavailable`, `outdated` 등으로 명확히 구분한다. 개인 경험 항목은 URL 없이도 사용자가 제공한 사실·공개 범위를 설명할 수 있다. 현재 대화의 내부 식별자나 원문 채팅을 public registry에 복사하지 않는다.

공식 문서의 발행일과 확인일은 다르다. 발행일을 모르면 null을 쓴다. `checked_at`에는 실제 확인한 날을 넣는다. 날짜만 최신으로 바꾸고 사실 확인을 수행한 척하지 않는다.

## 6. chart registry

차트 파일은 `id`, `type`, `title`, `unit`, `sourceIds`, `isIllustrative`, `conditions`, `data`, `transformations`, `takeaway`를 최소한 가진다. 원시값·가공값을 구분하고 부정확한 자동 단위 변환을 막는다.

강조색·폰트·애니메이션·축 기본 스타일은 `chart-theme`에서 적용한다. 개별 데이터 파일마다 임의 스타일을 복제하지 않는다. 데이터 파일에 실행 가능한 formatter 함수를 문자열로 저장하지 않는다.

synthetic 테스트 차트에는 `isIllustrative: true`와 설명용 데이터임을 표시한다. 실제 모델 benchmark와 혼동되게 제품명을 붙이지 않는다.

## 7. asset registry

각 자산은 ID, 로컬 상대 경로, source, 원저자/기관, 사용 조건, 변경 사항, publicSafe 여부, checksum을 가진다. 파일 경로가 강의 assets 경계를 벗어나면 거부한다.

원본과 재구성 도식을 구분한다. 포트폴리오 이미지에 실제 인물·계정 정보가 보이면 필요한 권한과 가림 여부를 확인한다. 글꼴은 공식 의존성 경로로 관리하고 자산 manifest에 출처·버전·고지를 연결한다.

## 8. 대본 생성과 읽기 자료

`deck.json.speakerNotes`에서 presenter 화면과 DOCX를 함께 생성한다. DOCX의 slide ID와 화면 순번은 renderer manifest에서 계산한다. ‘슬라이드 7’처럼 문장 속 숫자를 여기저기 하드코딩하지 않는다.

DOCX의 한 장 설명은 다음 순서를 기본으로 한다.

```text
슬라이드 순번 · 제목 · slide ID · 목표 시간
[발표 원고] 실제로 읽을 말
[화면 지시] 먼저 가리킬 곳과 이동 순서
[발표 전 이해] 필요한 배경·수식·프로세스 해설
[주의] 오해할 점·조건·한계
[다음 연결] 다음 장으로 넘어가는 문장
[출처] 관련 source의 제목·URL·확인일
```

화면 지시와 보충 설명이 필요 없는 장은 빈 제목을 출력하지 않는다. 영어 문장을 그대로 직역하지 말고 한국어 강의에서 자연스러운 설명으로 쓴다.

공개 읽기 버전은 승인된 화면·자료 해설만 생성한다. `publicTranscript: false`는 **사이트 transcript 제외 설정**이며, 추적된 source notes가 public GitHub repo에서도 감춰진다는 뜻이 아니다.

## 9. 승인 hash의 범위

공개 승인 digest는 정규화한 brief/deck/sources/charts/assets와 관련 공개 소개를 대상으로 계산한다. file order·JSON key order·YAML 형식 차이를 일관되게 정규화한다. asset checksum을 포함하고 `publication.approval.json` 자체는 digest 대상에서 제외한다.

승인 파일의 초기 구조는 다음과 같이 명시적으로 미승인 상태로 생성한다. 값은 사용자에게 실제 승인받은 범위에서만 변경한다.

```json
{
  "schemaVersion": 1,
  "status": "unapproved",
  "approvedContentDigest": null,
  "approvedAt": null,
  "approvalEvidence": null,
  "scope": {
    "site": false,
    "repositorySource": false,
    "includeSpeakerNotesInRepository": false,
    "pdf": false
  }
}
```

현재 시간·생성된 thumbnail·빌드 로그 같은 파생값은 콘텐츠 digest에서 제외한다. 다만 변환 코드의 source commit과 QA 결과는 별도로 release manifest에 기록한다.

콘텐츠 hash와 입력 hash는 목적이 다르다. 입력 hash는 brief 변경 감지, 공개 승인 hash는 공개에 동의한 내용의 변경 감지다. 둘 중 하나를 다른 하나의 대용으로 사용하지 않는다.
