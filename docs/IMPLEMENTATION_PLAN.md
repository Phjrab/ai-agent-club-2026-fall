# 구현 계획과 재개 지점

정착 경로: `docs/IMPLEMENTATION_PLAN.md`

## 실행 방식

첫 작업은 이 계획을 사용자에게 다시 승인받기 위해 멈추는 것이 아니라, 안전한 범위부터 실제 수행한다. 진행 중 필요한 작업은 단계별로 작게 나누고 실행 결과를 기록한다. 환경·권한 제약이 생기면 관련 단계만 BLOCKED로 남기고 가능한 나머지를 진행한다.

모델 이름과 API ID는 이 문서에서 고정하지 않는다. 현재 Codex에 설정된 모델·제공자를 유지한다. 사용자가 직접 선택할 경우 아키텍처·보안 경계·시각 문제 진단에는 높은 추론 수준, 반복 구현·정리는 중간 수준을 운영상 출발점으로 삼을 수 있다. 이는 성능 보장이 아니며 지원되지 않는 설정을 자동 변경하지 않는다.

## P0 · 안전한 작업 공간과 환경

실제 작업 경로·상위 Git root·현재 branch·dirty files·remote를 확인한다. 잘못된 기존 프로젝트에 초기화하지 않는다. GitHub 인증 계정·권한, Node/npm, Chromium/Playwright, export 도구 사용 가능 여부를 점검한다.

실행 중 토큰·비밀번호·기존 Codex 제공자 설정을 출력·수정하지 않는다. OS 전역 패키지 설치가 필요한 경우 무단 sudo·보안 설정 우회 없이 해결 가능한 로컬 경로를 우선한다.

완료 증거: `reports/environment.json`과 `HANDOFF.md`에 환경·차단 항목·실제 작업 위치가 기록되어 있다. 인증이 안 되어도 로컬 구현 단계는 진행할 수 있다.

## P1 · 저장소 뼈대와 규칙 정착

루트 AGENTS, docs 규칙, course config, README, .gitignore, package.json, lockfile, schema, 테스트 폴더, handoff/worklog를 만든다. 오래된 bootstrap 문서와 실제 활성 규칙을 구분한다.

설정 정본과 콘텐츠 정본을 정의한다. `brief.md` 해시 검증, `deck.json` schema, source ID 참조 검사, 자산 manifest 스키마를 먼저 만든다. 입력 상태가 불완전한 경우 원인이 드러나는 오류를 낸다.

완료 증거: schema 검사와 정상/오류 fixture 테스트가 실제로 실행된다. README에 존재하지 않는 스크립트를 이미 작동하는 것처럼 안내하지 않는다.

## P2 · 발표 엔진과 디자인 시스템

1920×1080 고정 논리 캔버스, Pretendard 로컬 로딩, 글자 크기·여백 토큰, 키보드 이동, deep link, fullscreen, private 발표자 화면을 구현한다.

cover, statement, text-figure, comparison, process, table, code-prompt 등의 대표 layout을 최소 하나씩 테스트한다. 콘텐츠가 많으면 작은 글자가 아니라 검증 오류로 알려주도록 한다.

완료 증거: 서로 다른 viewport에서 비율이 유지되고, 폰트·본문·제목·하단 충돌 테스트가 통과한다. 최소 8개 대표 test slides의 실제 스크린샷이 있다. 테스트 슬라이드는 수업 실적으로 집계하지 않는다.

## P3 · 시각자료와 안정적인 export 준비

Chart.js, KaTeX, Prism.js, Mermaid를 통합한다. 쓰지 않는 라이브러리는 페이지에서 실행하지 않아도 된다. 폰트 로딩 → 필요한 라이브러리 렌더링 → active slide 준비 완료를 명시적으로 추적한다.

다음과 같은 브라우저 인터페이스를 구현한다. 정확한 내부 구현은 자유지만 테스트와 export에서 안정적으로 사용할 수 있어야 한다.

```text
window.presentation.goTo(slideId)
window.presentation.slideReady(slideId) -> Promise
window.presentation.prepareForExport() -> Promise
window.presentation.getManifest() -> {slides, fonts, charts, failures}
window.__PRESENTATION_READY__ -> boolean
```

화면 전환 직후 일정 시간만 sleep하는 방식에 의존하지 않는다. timeout과 실패 원인을 기록한다. 숨겨진 chart의 0×0 초기화, 글꼴 로딩 지연, print CSS 변경을 각각 테스트한다.

완료 증거: chart·math·diagram·code fixture가 화면·캡처·print에 모두 표시되며, 일부러 잘못된 데이터를 넣으면 적절히 실패한다.

## P4 · 회차 데이터와 학기 포트폴리오

강의별 brief·deck·출처·자산에서 목록을 생성한다. 수업 예정/실시/콘텐츠 승인/공개 상태를 구분한다. 모바일 목록·desktop 발표·deep link·상대 경로를 구현한다.

`dist/private`에는 검토할 초안과 발표자 원고가 있어도 된다. `dist/public`에는 승인된 콘텐츠와 별도 승인된 메타데이터만 포함한다. 임의 hidden HTML이 보안 경계가 되지 않게 한다.

완료 증거: 가짜 secret sentinel, 미승인 강의, private 노트를 fixture에 넣었을 때 public 빌드 artifact에 어느 것도 포함되지 않는다. 공개 승인된 강의만 목록·검색·썸네일·PDF에 연결된다.

## P5 · 1회차 내용 제작

1회차 `brief.md`의 50분 설명 흐름과 필수 항목을 검토한다. 공식 출처로 현재 제품·요금·기능을 확인하고, 검증되지 않은 값은 정직하게 제외하거나 초안 경고로 남긴다.

본편 30장 목표의 deck와 한국어 원고를 작성한다. 제목 흐름, 요구사항 커버리지, 기술 용어, 사용 경험의 정확한 표현을 확인한다. 2회차 이후 자료를 임의로 완성하지 않는다.

완료 증거: 필수 주제와 slide ID를 연결한 커버리지 보고서, 출처 registry, 실시간 화면과 원고 매핑, 회차 설정에서 계산한 전체 시간·고정 질의응답·유동 여유가 있다. 공개 승인은 별도 기록으로 관리한다.

## P6 · PDF/PPTX/DOCX와 오프라인 패키지

브라우저 준비 완료를 기다린 뒤 슬라이드별 이미지와 PDF를 생성한다. PDF는 한 장당 한 페이지이며 제목·각주·하단이 포함된다. 차트가 빠지거나 print 전용 크기 변경으로 잘리지 않는지 검사한다.

PPTX는 wide 16:9 시각적 호환 방식으로 만든다. 고해상도 슬라이드 이미지를 한 장씩 배치하고 지원되는 방식으로 speaker notes를 연결한다. 개체 편집 가능성을 과장하지 않는다. 구현 시 실제 라이브러리 API를 공식 문서에서 확인한다.

DOCX는 notes 데이터에서 한국어 대본과 학습용 설명을 만든다. 실제 문서를 열거나 렌더링할 도구가 있으면 전 페이지를 검수한다. 도구가 없어 구조만 검사했다면 `visual_export_qa: BLOCKED`로 남긴다.

오프라인 HTML 패키지는 초기 설치가 끝난 환경에서 외부 도메인 차단 상태로 실행한다. 빌드 산출물에는 로컬 정적 서버 실행 방법과 필요한 최소 런타임을 안내한다.

완료 증거: 생성 파일·크기·슬라이드/페이지 수·checksum·QA 범위를 담은 export manifest가 있고, 만들어지지 않은 형식을 성공으로 표시하지 않는다.

## P7 · 전체 QA와 수정

`05_QA_AND_ACCEPTANCE.md`의 필수 검사, 모든 슬라이드 렌더링, 글꼴 로딩, 콘텐츠 clipping, 차트 내부 라벨, PDF/PPTX/DOCX, 공개 누출 검사를 실행한다.

기계적 bounds 검사를 통과해도 장별 캡처를 실제로 확인한다. 이미지 검토 기능이 없는 실행 환경에서는 그 사실을 남기고 시각 QA를 완료했다고 주장하지 않는다.

완료 증거: 테스트 결과, 스크린샷/컨택트시트, 발견한 문제와 수정 결과, 남은 오류가 연결되어 있다. “npm build 성공”만으로 전체 QA PASS가 되지 않는다.

## P8 · private 저장소 생성과 push

신규 프로젝트 파일을 비밀정보·재배포 관점에서 검사한다. 인증 계정과 이름, 로컬 remote를 확인하고 안전한 파일만 commit한다. 처음 승인된 범위 내에서 private 저장소를 생성하고 push한다.

GitHub 인증·workflow scope·조직 정책으로 실패하면 로컬 결과와 실패 범위를 보고한다. remote 생성 실패를 새 이름 무한 재시도나 다른 계정 사용으로 우회하지 않는다. 기존 저장소는 덮어쓰지 않는다.

완료 증거: 조회 가능한 실제 repo URL·private 상태·원격 commit SHA, push 출력, 가능하면 첫 CI 실행 결과가 있다. CI를 아직 실행하지 못했으면 별도 NOT_RUN이다.

## P9 · Pages 준비와 유지보수 인계

공개 게시 workflow는 구현하되 기본 비활성으로 둔다. 허용 범위 밖인 공개 전환·노트 노출·라이선스 선택은 사용자 승인으로 남긴다.

운영 문서와 다음 회차 추가·수정·출처 갱신·재개 프롬프트를 점검한다. 강의 종료 후 회고를 기록할 빈 틀을 제공하되 내용을 창작하지 않는다.

완료 증거: 사용자가 `brief.md`를 바꾸고 Codex를 호출하는 방법, 단순 push와 콘텐츠 생성의 차이, 현재 공개 상태가 README에 정확히 설명되어 있다.

## 단계 진행 기록과 복구

`HANDOFF.md`는 1–2페이지 수준의 현재 상태 요약을 유지한다. 상세 시행착오는 WORKLOG로 분리한다.

```text
Project / phase / working directory
Branch / HEAD / remote / dirty files
Implemented and tested
Known failures and exact failing commands
Environment blocks / required user action
Next concrete task
Source dates / content approval / publication status
```

같은 팩을 다시 실행하면 기존 결과를 검증하고 마지막 미완료 단계부터 진행한다. 파일을 다시 만들어 초기화하거나 기존 저장소를 두 개 생성하지 않는다. 합리적 환경 문제가 있어도 사용자에게 전체 요구사항을 다시 설명하게 하지 않는다.
