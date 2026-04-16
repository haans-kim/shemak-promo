# 쉐막(Shemak) HR AI 홍보영상

인싸이트그룹 HR AI 제품 홍보영상(약 3분 10초) 제작 리포입니다. 나레이션 스크립트, 외부 TTS로 제작한 음성, 로고 자산, 그리고 Remotion으로 최종 영상을 렌더하는 코드가 모두 한 곳에 모여 있습니다.

- **스택**: Remotion 4.x · React 18 · TypeScript
- **출력**: 1920×1080, 30fps, MP4
- **섹션 구성**: 9개 (`01-intro` ~ `09-closing`) — `src/lib/sections.ts`가 단일 기준
- **프리뷰 샘플**: [`preview-mp4/`](preview-mp4/) 폴더에 v1/v2/v3 비교용 영상 있음

더 자세한 개발 가이드(아키텍처·트랜지션·오디오 규칙 등)는 [CLAUDE.md](CLAUDE.md) 참고.

---

## 1. 환경 설정 (첫 1회)

### 필요한 도구
- [Node.js](https://nodejs.org/) 18 이상
- [Git](https://git-scm.com/)
- [ffmpeg / ffprobe](https://ffmpeg.org/) — 오디오 길이 측정용 (macOS: `brew install ffmpeg`)

### 리포 받기
```bash
git clone https://github.com/haans-kim/shemak-promo.git
cd shemak-promo
npm install
```

`node_modules/`는 gitignore 대상이라 clone 직후에는 없습니다. `npm install`로 설치하세요.

---

## 2. 기본 작업 흐름

### ① 나레이션 수정
- **내용 변경**은 [`narration 1.txt`](narration%201.txt) (사람이 읽는 원본)과 [`narration_tts.txt`](narration_tts.txt) (TTS용: HR→에이치알 등 발음 교정판) **둘 다** 업데이트합니다.
- 두 파일은 항상 같은 내용이어야 합니다. 단, `narration_tts.txt`에만 한글 발음 표기와 `[N초 쉼]` 표기가 들어갑니다.

### ② TTS 음성 생성 (외부 서비스 이용)
이 프로젝트는 **외부 TTS 서비스**(Typecast / CLOVA Dubbing 등)로 음성을 만들어 파일로 받아오는 방식입니다. `narration_tts.txt`의 섹션별 텍스트를 복사해 외부 서비스에서 합성하세요.

> 📎 Typecast 기준 **1.2배속**으로 합성하는 것이 현재 기준입니다 (`src/lib/sections.ts` 상단 주석 참고).

다운로드한 mp3는 **정확한 파일명**으로 저장:
```
public/audio/01-intro.mp3
public/audio/02-ig-intro.mp3
public/audio/03-hr-agent.mp3
...
public/audio/09-closing.mp3
```

### ③ 음성 길이 측정 → sections.ts 업데이트
새 음성을 넣었으면 길이를 재서 `src/lib/sections.ts`의 `estimatedSeconds`를 업데이트합니다. 전체 타이밍이 이 값에서 계산되므로 **반드시 갱신**하세요.

```bash
# 한 파일씩
ffprobe -show_entries format=duration -of csv=p=0 public/audio/02-ig-intro.mp3

# 또는 일괄 측정 스크립트
node scripts/measure_audio.js
```

### ④ Remotion Studio에서 확인 / 수정
```bash
npm run dev
```
브라우저에 타임라인이 뜹니다. 왼쪽 목록에서 섹션(`01-intro` ~ `09-closing`)을 골라 재생해보며 애니메이션을 조정하세요. 씬 파일은 [`src/scenes/`](src/scenes/)에 있습니다.

### ⑤ 렌더링
```bash
# 특정 섹션만 빠르게 (1~2분)
npx remotion render 02-ig-intro out/02.mp4

# 전체 영상 (몇 분 걸림)
npm run build
# → out/shemak.mp4 생성
```

### ⑥ 변경사항 커밋 & 공유
```bash
git add .
git commit -m "변경 내용 요약"
git push
```
다른 사람이 최신 내용을 받아올 때는 `git pull`.

---

## 3. 폴더 구조

```
shemak-promo/
├── CLAUDE.md              개발 가이드 (아키텍처 규칙, 트랜지션 옵션 등)
├── README.md              이 파일
├── narration 1.txt        나레이션 원본 (사람용)
├── narration_tts.txt      TTS용 나레이션 (발음 교정판)
├── Logo/                  로고 및 사인규정
│   └── insightgroup 사인규정.ai    브랜드 가이드 원본
├── public/
│   ├── audio/             섹션별 mp3 (외부 TTS로 생성)
│   ├── images/            씬에서 쓰는 이미지
│   └── videos/            씬에서 쓰는 영상
├── preview-mp4/           과거 프리뷰 영상 (v1/v2/v3) — 참고용
├── out/                   렌더 결과물 (gitignore 됨)
├── src/
│   ├── Root.tsx           Remotion 컴포지션 등록 (Main + 9개 섹션)
│   ├── Main.tsx           전체 영상 시퀀스
│   ├── lib/
│   │   ├── sections.ts    섹션 메타데이터 (길이·slug·오디오 경로) — 단일 기준
│   │   └── brand.ts       브랜드 색상·폰트 (placeholder, 사인규정 반영 필요)
│   ├── components/        공용 컴포넌트 (SceneFrame, Spotlight, CountUp 등)
│   └── scenes/            섹션별 씬 (`01-Intro.tsx` ~ `09-Closing.tsx`)
└── scripts/
    ├── measure_audio.js   오디오 길이 일괄 측정
    └── generate_tts.py    (legacy) OpenAI TTS — 현재 사용 안 함
```

---

## 4. 자주 하는 실수

- **오디오 파일명을 `NN-slug.mp3` 규칙에서 벗어나게 저장** → `public/audio/02-ig-intro.mp3`처럼 정확히 지켜주세요. 대소문자·하이픈도 그대로.
- **오디오 바꾸고 `sections.ts`의 `estimatedSeconds`를 안 바꿈** → 전체 타이밍이 틀어집니다. 오디오 교체 시 항상 쌍으로 업데이트.
- **나레이션 `1.txt`만 고치고 `_tts.txt`는 안 고침** → 다음 TTS 재생성 때 예전 문구가 나옵니다. 둘 다 수정.
- **씬 파일에 프레임 수를 하드코딩** → 하지 마세요. 모든 타이밍은 `sections.ts`에서 내려옵니다.
- **`out/` 폴더 커밋** → gitignore 되어 있으니 신경 안 써도 됩니다. 렌더 결과물은 필요하면 별도 공유.

---

## 5. Legacy 참고사항 (읽지 않아도 됨)

[`scripts/generate_tts.py`](scripts/generate_tts.py)는 초기에 OpenAI TTS로 음성을 만들던 스크립트입니다. 한국어 발음이 부자연스러워 외부 TTS로 전환했고, 이 스크립트는 **더 이상 사용하지 않습니다**. 의도적으로 되살리지 않는 한 무시하세요.
