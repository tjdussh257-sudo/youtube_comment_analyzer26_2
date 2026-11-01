import { createGoogle } from '@ai-sdk/google';
import { generateText } from 'ai';
import {
  AnalysisResult,
  SentimentSummary,
  TimeSeriesPoint,
  TopKeyword,
  BigramLink,
  BigramSummaryItem,
  AIInterpretation,
  VideoMetadata,
} from '@/types/analyzer';
import { RawComment } from './youtube';

interface GeminiParsedResponse {
  sentiment_summary: {
    positive_count: number;
    negative_count: number;
    neutral_count: number;
    average_length?: number;
    sentiment_score?: number;
  };
  top_keywords: Array<{
    rank: number;
    word: string;
    pos: '명사' | '동사' | '형용사' | '기타';
    count: number;
  }>;
  bigrams: Array<{
    source: string;
    target: string;
    count: number;
    strength: number;
    context_summary: string;
  }>;
  bigram_summary: Array<{
    pair: string;
    frequency: number;
    insight: string;
  }>;
  ai_interpretation: {
    overview: string;
    positive_drivers: string[];
    negative_drivers: string[];
    creator_recommendations: string[];
  };
  comment_sentiments?: Array<{
    id: string;
    sentiment: 'positive' | 'negative' | 'neutral';
  }>;
}

/**
 * 시간대별 댓글 및 감성 집계 (라인 차트용)
 */
function aggregateTimeSeries(
  comments: RawComment[],
  commentSentimentsMap: Map<string, 'positive' | 'negative' | 'neutral'>
): TimeSeriesPoint[] {
  if (comments.length === 0) return [];

  // 작성일 기준 정렬
  const sorted = [...comments].sort(
    (a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime()
  );

  const firstTime = new Date(sorted[0].publishedAt).getTime();
  const lastTime = new Date(sorted[sorted.length - 1].publishedAt).getTime();
  const diffHours = (lastTime - firstTime) / (1000 * 3600);

  // 시간대 그룹핑 포맷 결정: 하루 이내면 시간별, 며칠 이상이면 일자/시간별
  const bucketMap = new Map<
    string,
    { timestamp: string; total: number; positive: number; negative: number; neutral: number }
  >();

  for (const c of sorted) {
    const d = new Date(c.publishedAt);
    let key: string;

    if (diffHours <= 48) {
      // MM/DD HH:00
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const hour = String(d.getHours()).padStart(2, '0');
      key = `${month}/${day} ${hour}:00`;
    } else {
      // YYYY-MM-DD
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      key = `${year}-${month}-${day}`;
    }

    const sentiment = commentSentimentsMap.get(c.id) || 'neutral';
    const entry = bucketMap.get(key) || {
      timestamp: c.publishedAt,
      total: 0,
      positive: 0,
      negative: 0,
      neutral: 0,
    };

    entry.total += 1;
    if (sentiment === 'positive') entry.positive += 1;
    else if (sentiment === 'negative') entry.negative += 1;
    else entry.neutral += 1;

    bucketMap.set(key, entry);
  }

  return Array.from(bucketMap.entries()).map(([timeLabel, val]) => ({
    timeLabel,
    timestamp: val.timestamp,
    total: val.total,
    positive: val.positive,
    negative: val.negative,
    neutral: val.neutral,
  }));
}

/**
 * Gemini 3.6 Flash를 사용한 한국어 형태소 분석, 감성 분석, 바이그램 추출 및 AI 종합 해석
 */
export async function analyzeCommentsWithGemini(
  video: VideoMetadata,
  comments: RawComment[],
  geminiApiKey: string
): Promise<AnalysisResult> {
  const google = createGoogle({ apiKey: geminiApiKey });

  // 댓글 본문 길이 평균 계산
  const totalLength = comments.reduce((acc, c) => acc + (c.text?.length || 0), 0);
  const averageLength = comments.length > 0 ? Math.round(totalLength / comments.length) : 0;

  // Gemini에 전달할 간소화된 댓글 데이터 (id, text, publishedAt)
  const commentPayload = comments.map((c) => ({
    id: c.id,
    text: c.text,
    publishedAt: c.publishedAt,
  }));

  const systemPrompt = `
당신은 한국어 자연어 처리(NLP) 및 데이터 시각화 분석 전문가입니다.
주어진 유튜브 댓글 목록을 정밀 분석하여 통계, 키워드, 바이그램 단어 쌍, 감성 분석, AI 종합 해석을 도출하세요.

[필수 요구사항]
1. **한국어 형태소 분석 반드시 실시**:
   - 조사(은/는/이/가/을/를/의/에/에서/로/으로/과/와/도/만/부터/까지/한테/께 등)를 완벽히 제거하세요.
   - 어미(-다, -요, -죠, -네, -어서, -는데, -니까, -지, -자 등)를 완벽히 제거하세요.
   - 무의미한 감탄사/신조어/불용어(ㅋㅋㅋ, ㅎㅎㅎ, 너무, 진짜, 정말, 그냥, 아니, 대박, ㅠㅠ, 와 등)를 제거하세요.
   - 실질 형태소인 **명사, 대명사**, 그리고 **동사/형용사 기본형 어간**(예: '아쉽다', '어렵다', '이해하다', '지루하다')만을 유효 단어로 추출하세요.

2. **고빈도 키워드 TOP 20**:
   - 형태소 분석을 마친 실질 형태소 중 가장 빈번하게 등장한 상위 20개 단어.
   - 단어(word), 품사(pos: '명사' | '동사' | '형용사'), 빈도수(count, 1 이상 정수).

3. **바이그램(Bigram) 단어 쌍 분석**:
   - 한 문맥 또는 동일 댓글 내에서 긴밀하게 결합되어 등장하는 두 실질 형태소의 단어 쌍 12~25개 도출.
   - source: 첫 번째 형태소 단어
   - target: 두 번째 형태소 단어
   - count: 동시 출현 횟수 (정수)
   - strength: 결합 강도 (0.1 ~ 1.0)
   - context_summary: 이 두 단어가 함께 쓰인 문맥의 의미 한 줄 요약 (예: '마이크 잡음으로 인한 음질 불편 호소')

4. **바이그램 요약 정보 (bigram_summary)**:
   - 핵심 바이그램 쌍 4~6개를 선정하여 요약 인사이트 제공.
   - pair: "단어1 - 단어2" 형태
   - frequency: 출현 빈도수
   - insight: 시청자들이 왜 이 단어 쌍을 함께 언급했는지에 대한 분석 인사이트.

5. **개별 댓글 감성 분류 및 요약**:
   - 각 댓글(id)에 대해 'positive'(긍정), 'negative'(부정), 'neutral'(중립) 분류.
   - 전체 긍정, 부정, 중립 개수 집계.

6. **AI 종합 해석 (ai_interpretation)**:
   - overview: 시청자 전반의 여론과 핵심 화두를 관통하는 종합 요약 (3~4문장)
   - positive_drivers: 시청자들이 가장 호평하고 만족한 핵심 요인 3가지 (각각 구체적인 서술)
   - negative_drivers: 시청자들이 아쉬워하거나 비판, 개선을 요구한 핵심 요인 2~3가지
   - creator_recommendations: 크리에이터가 향후 채널 및 영상 제작에 즉시 반영할 수 있는 실질적 조언 3가지

반드시 오직 유효한 JSON 형식으로만 응답해야 하며, 마크다운 코드블록(\`\`\`json)이나 기타 텍스트를 포함하지 마세요.

JSON 응답 구조:
{
  "sentiment_summary": {
    "positive_count": 0,
    "negative_count": 0,
    "neutral_count": 0
  },
  "top_keywords": [
    { "rank": 1, "word": "설명", "pos": "명사", "count": 15 },
    ... 20개
  ],
  "bigrams": [
    { "source": "영상", "target": "설명", "count": 8, "strength": 0.85, "context_summary": "명확한 영상 설명에 대한 호평" },
    ...
  ],
  "bigram_summary": [
    { "pair": "영상 - 설명", "frequency": 8, "insight": "체계적인 설명 구성이 시청 만족도의 결정적 요인으로 작동함" }
  ],
  "ai_interpretation": {
    "overview": "...",
    "positive_drivers": ["...", "...", "..."],
    "negative_drivers": ["...", "..."],
    "creator_recommendations": ["...", "...", "..."]
  },
  "comment_sentiments": [
    { "id": "comment_id_1", "sentiment": "positive" }
  ]
}
`;

  let responseText = '';
  // 프롬프트에 지정된 gemini-3.6-flash 사용
  try {
    const res = await generateText({
      model: google('gemini-3.6-flash'),
      system: systemPrompt,
      prompt: `분석할 유튜브 동영상: "${video.title}" (채널: ${video.channelTitle})\n댓글 수: ${comments.length}개\n댓글 데이터:\n${JSON.stringify(commentPayload)}`,
    });
    responseText = res.text;
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.warn('gemini-3.6-flash 호출 실패, fallback 시도:', errorMsg);
    // 예외 시 안정적인 모델로 fallback
    const res = await generateText({
      model: google('gemini-2.5-flash'),
      system: systemPrompt,
      prompt: `분석할 유튜브 동영상: "${video.title}" (채널: ${video.channelTitle})\n댓글 수: ${comments.length}개\n댓글 데이터:\n${JSON.stringify(commentPayload)}`,
    });
    responseText = res.text;
  }

  // JSON 파싱
  const cleanedJson = responseText.replace(/^[\s\S]*?\{/, '{').replace(/\}[^}]*$/, '}');
  let parsed: GeminiParsedResponse;
  try {
    parsed = JSON.parse(cleanedJson) as GeminiParsedResponse;
  } catch (parseErr) {
    console.error('Failed to parse Gemini response:', responseText);
    throw new Error('Gemini 분석 응답 데이터를 파싱하지 못했습니다. 다시 시도해 주세요.');
  }

  // 감성 집계 검증 및 보정
  const totalAnalyzed = comments.length;
  let posCount = parsed.sentiment_summary?.positive_count ?? 0;
  let negCount = parsed.sentiment_summary?.negative_count ?? 0;
  let neuCount = parsed.sentiment_summary?.neutral_count ?? 0;

  // comment_sentiments가 있으면 정확한 카운트로 보정
  const commentSentimentsMap = new Map<string, 'positive' | 'negative' | 'neutral'>();
  if (parsed.comment_sentiments && Array.isArray(parsed.comment_sentiments)) {
    let p = 0, n = 0, u = 0;
    for (const item of parsed.comment_sentiments) {
      commentSentimentsMap.set(item.id, item.sentiment);
      if (item.sentiment === 'positive') p++;
      else if (item.sentiment === 'negative') n++;
      else u++;
    }
    if (p + n + u > 0) {
      posCount = p;
      negCount = n;
      neuCount = u;
    }
  }

  const calculatedTotal = posCount + negCount + neuCount;
  const effectiveTotal = calculatedTotal > 0 ? calculatedTotal : totalAnalyzed;
  const positiveRatio = Math.round((posCount / effectiveTotal) * 100);
  const negativeRatio = Math.round((negCount / effectiveTotal) * 100);
  const neutralRatio = Math.max(0, 100 - positiveRatio - negativeRatio);

  // 감정 지수: (긍정 - 부정) / 전체 * 100
  const sentimentScore = Math.round(((posCount - negCount) / effectiveTotal) * 100);

  const sentimentSummary: SentimentSummary = {
    totalAnalyzed,
    averageLength,
    positiveCount: posCount,
    negativeCount: negCount,
    neutralCount: neuCount,
    positiveRatio,
    negativeRatio,
    neutralRatio,
    sentimentScore,
  };

  // 시간대별 댓글 추이 계산
  const timeSeries = aggregateTimeSeries(comments, commentSentimentsMap);

  // 키워드 TOP 20 정리
  const topKeywords: TopKeyword[] = (parsed.top_keywords || [])
    .slice(0, 20)
    .map((k, index) => ({
      rank: k.rank || index + 1,
      word: k.word,
      pos: k.pos || '명사',
      count: k.count || 1,
      percentage: Math.round(((k.count || 1) / totalAnalyzed) * 100),
    }));

  // 바이그램 정리 (정규화)
  const bigrams: BigramLink[] = (parsed.bigrams || []).map((b) => ({
    source: String(b.source).trim(),
    target: String(b.target).trim(),
    count: Number(b.count) || 1,
    strength: Math.min(1, Math.max(0.1, Number(b.strength) || 0.5)),
    contextSummary: b.context_summary || `${b.source}와 ${b.target}의 연관 출현`,
  }));

  // 바이그램 요약
  const bigramSummary: BigramSummaryItem[] = (parsed.bigram_summary || []).map((bs) => ({
    pair: bs.pair,
    frequency: Number(bs.frequency) || 1,
    insight: bs.insight,
  }));

  // AI 해석
  const aiInterpretation: AIInterpretation = {
    overview: parsed.ai_interpretation?.overview || '댓글 분석이 성공적으로 완료되었습니다.',
    positiveDrivers: parsed.ai_interpretation?.positive_drivers || [
      '콘텐츠의 내용과 전달 방식에 대한 긍정적 반응이 확인되었습니다.',
    ],
    negativeDrivers: parsed.ai_interpretation?.negative_drivers || [
      '세부적인 기술 요소나 구성에 대한 개선 피드백이 존재합니다.',
    ],
    creatorRecommendations: parsed.ai_interpretation?.creator_recommendations || [
      '시청자 의견을 반영하여 다음 콘텐츠 품질을 보강하세요.',
    ],
  };

  return {
    video,
    sentimentSummary,
    timeSeries,
    topKeywords,
    bigrams,
    bigramSummary,
    aiInterpretation,
    analyzedAt: new Date().toISOString(),
  };
}
