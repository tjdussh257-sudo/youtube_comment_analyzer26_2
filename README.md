# YouTube Comments Analyzer

> **Gemini 3.6 Flash 기반 한국어 형태소 분석 · 감성 분포 · 바이그램 네트워크 시각화 대시보드**  
> *Copyright INU YouTube Comments Analyzer by Seoyeon*

![Next.js](https://img.shields.io/badge/Next.js-16.4.3-black?logo=next.js)
![React](https://img.shields.io/badge/React-19.3.0-blue?logo=react)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8?logo=tailwindcss)
![Google Gemini](https://img.shields.io/badge/Gemini-3.6--flash-orange?logo=google)
![D3.js](https://img.shields.io/badge/D3.js-Force_Network-F9A03C?logo=d3.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)

---

## 📌 프로젝트 소개 (Overview)

**YouTube Comments Analyzer**는 YouTube 동영상의 실시간 댓글을 수집하여 **Google Gemini 3.6 Flash** 언어 모델과 연동, 한국어 형태소 분석(Korean Morpheme POS Tagging) 및 감성 분석, 바이그램(Bigram) 동시 출현 네트워크 그래프, 그리고 AI 종합 해석 리포트를 인터랙티브하게 제공하는 웹 애플리케이션입니다.

---

## ✨ 핵심 기능 (Key Features)

1. **유튜브 댓글 실시간 수집 (`YouTube Data API v3`)**
   - 유튜브 영상 URL(일반 주소, 단축 `youtu.be`, Shorts 등) 또는 비디오 ID를 자동 파싱하여 댓글 및 메타데이터 수집
   - 원클릭 테스트를 위한 추천 예시 영상 및 샘플 데이터 즉시 체험 모드 지원

2. **한국어 형태소 분석 (Korean Morphological POS Analysis)**
   - 의미 없는 조사(은/는/이/가/을/를/의/에/로/도 등), 어미(-다, -요, -죠, -네 등), 특수문자, 단순 감탄사/신조어/불용어(ㅋㅋㅋ, 너무, 진짜, 그냥 등)를 정밀 필터링
   - 실질 형태소인 **명사**, **동사 원형**, **형용사 어간**만을 추출하여 분석 신뢰도 극대화

3. **1. 댓글 통계 카드 (Metrics Overview)**
   - 총 수집 댓글 수, 글자 수 기준 평균 댓글 길이, 긍정 반응률(%), 부정 반응률(%), 중립 반응률(%), 종합 감성 지수(-100 ~ +100) 제공

4. **2. 주요 키워드 고빈도 TOP 20 (High-frequency Keywords)**
   - 형태소 분석을 마친 상위 20개 키워드 인터랙티브 수평 막대 차트
   - 품사(명사/동사/형용사)별 필터 탭 및 클릭 가능한 키워드 태그 칩 제공

5. **3 & 4. 시간대별 댓글 수 라인 차트 & 감성별 추이 (Time-series Trends)**
   - 댓글 작성 일시 기준 타임라인 인터랙티브 라인/영역 차트
   - 긍정(녹색), 부정(로즈), 중립(슬레이트) 발생 추이를 비교하는 멀티 에어리어 뷰 전환 지원

6. **5. 감정 분포 파이 차트 (Sentiment Distribution)**
   - 긍정, 부정, 중립 비율을 나타내는 인터랙티브 도넛 파이 차트 및 중앙 긍정률 인디케이터

7. **6. 바이그램(Bigram) 단어 쌍 네트워크 시각화 & 7. 요약 정보 & 8. 화면 안쪽 배치**
   - **`D3-Force` 기반 물리 시뮬레이션**: 단어 노드(빈도수 비례 크기)와 공기(Co-occurrence) 링크(강도 비례 굵기)로 구성된 인터랙티브 네트워크
   - **화면 안쪽 자동 배치 제약**: 물리 시뮬레이션의 `tick` 단계에서 캔버스 바운딩 박스 클램핑을 적용하여 **어떤 노드도 화면 바깥으로 이탈하지 않음**
   - **부드러운 드래그 모션**: Pointer Events API와 `requestAnimationFrame`을 연동하여 젤리처럼 부드럽고 쫀득한 드래그 앤 드롭 제공
   - **바이그램 요약 카드**: 시각화 바로 아래에 상위 연관 단어 쌍, 동시 출현 횟수, 연관 결합도 및 Gemini가 해석한 문맥 의미 요약 카드 배치

8. **9. 댓글 분석 바탕 AI 심층 해석 리포트 (Gemini Deep Insights)**
   - 시청자 여론 종합 총평 (Overview)
   - 주요 긍정 반응 요인 (시청자 호평 포인트)
   - 부정 및 개선 피드백 요인 (시청자 아쉬움/불편)
   - 크리에이터를 위한 향후 실천 및 콘텐츠 방향성 제언 3가지

9. **10. 개인정보 보호 (Privacy First)**
   - 개인정보 및 시청자 보호 원칙에 따라 **댓글 원문 텍스트는 UI 어디에도 일절 표시하지 않고**, 가공된 통계와 AI 인사이트만 렌더링

10. **11. [다시 시작] 기능**
    - 상단 고정 헤더 및 결과 화면 상단에 눈에 띄는 **[다시 시작]** 버튼을 배치하여 언제든 새로운 영상 분석을 초기화 가능

---

## 🎨 디자인 시스템 & UX

- **60-30-10 컬러 밸런스**: 주색 60% (깨끗한 화이트/슬레이트 메쉬 배경 `#f8fafc`), 보조색 30% (가독성 높은 차콜/슬레이트 텍스트 `#0f172a`), 강조색 10% (유튜브 시그니처 레드 `#dc2626`)
- **1.333 타이포그래피 스케일 (Perfect Fourth Ratio)**:
  - `typo-display`: 3.157rem (~50.5px)
  - `typo-h1`: 2.369rem (~37.9px)
  - `typo-h2`: 1.777rem (~28.4px)
  - `typo-h3`: 1.333rem (~21.3px)
  - `typo-body`: 1.000rem (16px)
  - `typo-sub`: 0.875rem (14px)
  - `typo-caption`: 0.750rem (12px)
- **Pretendard + Noto Sans KR** 웹폰트 조합으로 한국어/영문 가독성 극대화
- **스켈레톤 UI (Skeleton UI) & Shimmer 효과**: 분석 진행 중 실제 결과 대시보드의 형태를 모방한 펄스 광원 이동 애니메이션 제공

---

## 🚀 빠른 시작 (Getting Started)

### 1. 레포지토리 클론
```bash
git clone https://github.com/tjdussh257-sudo/youtube_comment_analyzer26_2.git
cd youtube_comment_analyzer26_2
```

### 2. 패키지 설치
```bash
npm install
```

### 3. 환경 변수 설정 (`.env.local`)
프로젝트 루트 디렉토리에 `.env.local` 파일을 생성하고 다음 API 키를 설정합니다:
```env
YOUTUBE_API_KEY=your_youtube_data_api_key_here
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key_here
```
*(웹 UI 상단의 [API 설정] 모달을 통해서도 개인 API 키를 직접 입력하실 수 있습니다.)*

### 4. 개발 서버 실행
```bash
npm run dev
```
브라우저에서 `http://localhost:3000`으로 접속하여 즉시 이용하실 수 있습니다.

---

## 🛠️ 기술 스택 (Tech Stack)

| 구분 | 기술 / 라이브러리 |
| :--- | :--- |
| **Framework** | Next.js 16.4.3 (App Router, Turbopack) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS v4, shadcn/ui |
| **Typography** | Pretendard, Noto Sans KR (1.333 Perfect Fourth Ratio) |
| **AI / NLP** | Google Gemini (`gemini-3.6-flash`), AI SDK (`@ai-sdk/google`) |
| **Data Visualization** | Recharts, D3-Force (`d3-force`) |
| **API Integration** | YouTube Data API v3 |
| **Icons** | Lucide React |

---

## 📄 License & Copyright

Copyright INU YouTube Comments Analyzer by Seoyeon. All rights reserved.
