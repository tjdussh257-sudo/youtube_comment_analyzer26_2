export interface VideoMetadata {
  id: string;
  title: string;
  channelTitle: string;
  publishedAt: string;
  thumbnailUrl: string;
  viewCount?: string;
  likeCount?: string;
  commentCount?: string;
}

export interface SentimentSummary {
  totalAnalyzed: number;
  averageLength: number;
  positiveCount: number;
  negativeCount: number;
  neutralCount: number;
  positiveRatio: number;
  negativeRatio: number;
  neutralRatio: number;
  sentimentScore: number; // -100 to +100
}

export interface TimeSeriesPoint {
  timeLabel: string;
  timestamp: string;
  total: number;
  positive: number;
  negative: number;
  neutral: number;
}

export interface TopKeyword {
  rank: number;
  word: string;
  pos: '명사' | '동사' | '형용사' | '기타';
  count: number;
  percentage?: number;
}

export interface BigramLink {
  source: string;
  target: string;
  count: number;
  strength: number; // 0 to 1
  contextSummary: string;
}

export interface BigramSummaryItem {
  pair: string;
  frequency: number;
  insight: string;
}

export interface AIInterpretation {
  overview: string;
  positiveDrivers: string[];
  negativeDrivers: string[];
  creatorRecommendations: string[];
}

export interface NetworkNode {
  id: string;
  word: string;
  pos: string;
  count: number;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface NetworkLink {
  source: string | NetworkNode;
  target: string | NetworkNode;
  count: number;
  strength: number;
  contextSummary: string;
}

export interface AnalysisResult {
  video: VideoMetadata;
  sentimentSummary: SentimentSummary;
  timeSeries: TimeSeriesPoint[];
  topKeywords: TopKeyword[];
  bigrams: BigramLink[];
  bigramSummary: BigramSummaryItem[];
  aiInterpretation: AIInterpretation;
  analyzedAt: string;
}
