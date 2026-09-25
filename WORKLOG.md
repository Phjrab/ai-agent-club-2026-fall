# 작업 기록

## 2026-09-25 · 사용자 교체 입력 반영

- 사용자가 `/Users/hajoonpark/Downloads/brief.md`를 새 1회차 입력으로 지정했다. 이를 강의 폴더의 `brief.md`로 교체하고 `deck.json`을 `0.2.0`으로 재작성했다. 본편 30장과 Q&A 1장에 새 요구사항·출처 ID·한국어 원고를 연결했다.
- 지정 영상 세 편을 개념 설명 앞의 L01-S15에 V01 → V02 → V03 순서로 배치했다. 페이지 메타데이터의 길이 합계 16:49와 12:00 예산의 차이를 화면·원고·인계 문서에 명시했다. 영상을 본 것처럼 내용 설명을 만들지 않았다.
- HTML·PDF·PPTX·DOCX 개정 `0.2.0`을 생성했다. PDF·PPTX 렌더는 31페이지였다. DOCX는 최초 LibreOffice 렌더에서 한글이 빠졌으며, npm Pretendard 1.3.9의 공식 OTF 경로를 임시 fontconfig에 등록한 뒤 31페이지를 다시 렌더링해 글자가 표시되는 것을 확인했다.
- 출처 검사에 URL 형식, 확인일, 중복 ID 검사를 추가했다. HTTP 응답과 본문 검증을 구분하는 경고를 남긴다. 계약 테스트는 8개 모두 통과했다.
- CI와 기본 비활성 Pages workflow, README, 라이선스 정책을 작성했다. 사용한 GitHub Actions release 태그는 2026-09-25에 해당 공식 저장소의 latest release API에서 확인했다.
- GitHub CLI는 기본 샌드박스에서 토큰 오류와 네트워크 오류를 반환했다. 승인된 실행 경로에서는 Phjrab 계정의 keyring 로그인, `repo`·`workflow` 권한과 동명 저장소 부재를 확인했다. `Phjrab/ai-agent-club-2026-fall`을 private으로 만들고 `main`을 push했다. GitHub API에서 `isPrivate=true`, 원격 HEAD 일치, CI 성공, Pages의 게시 job skip을 확인했다.

다음 작업자는 `HANDOFF.md`와 실제 Git 상태를 먼저 비교하고, 강의 전 가격·학생 혜택·영상 내용 및 60분 리허설을 확인한다.

## 2026-09-25 · 공개 요청과 자동 검토 보류

- 사용자가 저장소 공개 전환과 GitHub Pages 게시를 요청했다. 공개 빌드와 범위 검사를 보강하고 1회차 콘텐츠 해시 `4bd3c3a99ea7e75c66ea832f2413e3c6e84e0e2a05c47d9335c136840ad62de3`을 승인 파일에 기록했다. Pages 배포 파일에는 슬라이드만 포함하고 대본·PDF·PPTX·DOCX는 제외한다. Pretendard와 사용한 프런트엔드 라이브러리의 라이선스 파일을 함께 담는다.
- 공개 브라우저 QA가 슬라이드 번호 해시만 바꾼 탐색 문제를 발견해 수정했다. 이후 공개 브라우저 QA와 31장 전체 QA, 테스트 8개, 출처 메타데이터 검사, GitHub CI가 통과했다.
- 공개 준비 커밋을 private 원격 저장소에 push했다. Pages 실행은 빌드·승인 검사까지 성공했지만 Pages 미활성 상태 때문에 `configure-pages` 404로 끝났다. 공개 전환 명령은 자동 승인 검토에서 거부됐다. 기존 이력의 커밋 작성자 Gmail 주소와 추적된 한국어 발표 대본을 구체적으로 승인받아야 한다는 이유다. 해당 범위의 승인 질문을 보냈고, 응답 전에는 공개 전환이나 다른 경로의 게시를 진행하지 않는다.
