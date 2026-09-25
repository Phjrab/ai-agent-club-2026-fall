# 공식 참고 문서

정착 경로: `docs/OFFICIAL_REFERENCES.md`

확인일: **2026-09-24**. 아래는 프롬프트 팩의 구현 방향을 확인한 공식 문서다. 실제 코드 작성 시 현재 페이지·설치된 버전의 API를 다시 확인한다. URL이 리다이렉트되면 목적지와 공식 소유자를 확인한다.

이 목록은 1회차의 최신 모델·요금제 데이터가 아니다. 강의에서 사용할 상품·모델별 사실은 강의별 `sources.yaml`에 별도로 조사해 기록한다.

| ID | 자료 | 공식 URL | 이 프로젝트에서 확인할 점 |
|---|---|---|---|
| R01 | GitHub Pages 개요 | https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages | 정적 사이트, 저장소·플랜 조건, project site 경로 |
| R02 | GitHub CLI `gh repo create` | https://cli.github.com/manual/gh_repo_create | 새 저장소 생성, visibility, source, push 옵션 |
| R03 | Pages custom workflows | https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages | build artifact, 권한, environment, deploy 연결 |
| R04 | Chart.js Responsive Charts | https://www.chartjs.org/docs/latest/configuration/responsive.html | 전용 부모 크기, aspect ratio, print resize |
| R05 | Chart.js Fonts | https://www.chartjs.org/docs/latest/general/fonts.html | 기본 font 설정과 지연 font 로딩 후 갱신 |
| R06 | Pretendard 공식 저장소 | https://github.com/orioncactus/pretendard | 정확한 family 이름, 배포 방식, 버전·고지 |
| R07 | OpenAI Codex AGENTS.md | https://developers.openai.com/codex/guides/agents-md | AGENTS.md 자동 탐색·계층·크기 제한 |
| R08 | Playwright Visual comparisons | https://playwright.dev/docs/test-snapshots | 실제 스크린샷 비교와 환경별 차이 |
| R09 | KaTeX browser usage | https://katex.org/docs/browser | CSS·font·스크립트 버전 일치와 브라우저 통합 |
| R10 | Mermaid usage | https://mermaid.js.org/config/usage.html | 명시적 render, font 로딩, strict 보안 모드 |
| R11 | Prism 공식 문서 | https://prismjs.com/ | 필요한 언어·스타일만 포함하는 코드 강조 |
| R12 | GitHub Pages visibility | https://docs.github.com/en/enterprise-cloud@latest/pages/getting-started-with-github-pages/changing-the-visibility-of-your-github-pages-site | 저장소 visibility와 사이트 접근 제어의 차이 |
| R13 | Playwright Page API | https://playwright.dev/docs/api/class-page | PDF·screenshot·크기·준비 대기 API |
| R14 | PptxGenJS 공식 문서 | https://gitbrent.github.io/PptxGenJS/ | wide PPTX·이미지·notes 생성 API 확인 |
| R15 | docx 공식 프로젝트 문서 | https://docx.js.org/ | DOCX 생성 라이브러리의 실제 API·문서 구조 확인 |

## 확인 결과를 적용한 설계

`AGENTS.md`는 자동 지침 탐색용 이름이므로 정확히 사용한다. 긴 제작 지침은 루트 AGENTS에 모두 넣지 않고 별도 docs를 읽게 한다. 공식 설명의 기본 누적 크기 제한과 하위 디렉터리 우선 적용을 고려한 구조다. 프로젝트 밖 전역 설정을 바꾸는 것은 이 팩의 범위가 아니다. [R07]

Chart.js의 렌더링 크기는 전용 부모 컨테이너와 관련되며 print에서 별도 조정이 필요할 수 있다. 이 팩의 `prepareForExport`·font 대기·slide 활성화 후 resize 규칙은 이 문제를 검증 가능하게 처리하기 위한 프로젝트 설계다. [R04, R05]

Pages는 정적 artifact를 배포하는 용도로 사용한다. 저장소 생성·콘텐츠 생성·공개 승인은 서로 다른 단계로 나눴고, private repo가 웹사이트의 접근 제한을 자동 보장한다고 설명하지 않는다. [R01, R03, R12]

## 버전 관리 원칙

패키지·action의 정확한 버전과 checksum/SHA는 **설치·구현 때 확인해서** lockfile·환경 보고에 기록한다. 이 팩에 현재 가장 최신인 것처럼 추정한 버전 번호를 적지 않는다. `@latest`, floating CDN, 확인하지 않은 action SHA를 release 기준으로 사용하지 않는다.

R15의 웹 문서가 도구에서 충분히 추출되지 않는 경우 공식 저장소·설치된 패키지의 타입 정의·예제를 확인한다. API 내용을 확인하지 못한 상태에서 메서드 이름이나 옵션을 창작하지 않는다.
