'use client';

import React, { useState } from 'react';
import { AnalysisResult } from '@/types/analyzer';
import { Header } from '@/components/Header';
import { ApiKeyModal } from '@/components/ApiKeyModal';
import { InputSection } from '@/components/InputSection';
import { VideoInfoCard } from '@/components/VideoInfoCard';
import { StatCards } from '@/components/StatCards';
import { SentimentCharts } from '@/components/SentimentCharts';
import { KeywordChart } from '@/components/KeywordChart';
import { BigramNetwork } from '@/components/BigramNetwork';
import { AIInterpretationCard } from '@/components/AIInterpretationCard';
import { AnalysisSkeleton } from '@/components/AnalysisSkeleton';
import { Footer } from '@/components/Footer';
import { RotateCcw, AlertCircle, ArrowUp, RefreshCw } from 'lucide-react';

export default function Home() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null);
  const [lastAnalyzedInput, setLastAnalyzedInput] = useState<{ urlOrId: string; isDemo: boolean }>({
    urlOrId: '',
    isDemo: false,
  });

  // [다시시작] 버튼 핸들러
  const handleReset = () => {
    setResult(null);
    setErrorMessage(null);
    setSelectedKeyword(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAnalyze = async (urlOrId: string, isDemo: boolean = false) => {
    setIsLoading(true);
    setErrorMessage(null);
    setSelectedKeyword(null);
    setLastAnalyzedInput({ urlOrId, isDemo });

    try {
      setLoadingStep('1단계: YouTube API를 통해 영상 정보 및 실시간 댓글을 수집하고 있습니다...');

      const customYtKey = typeof window !== 'undefined' ? localStorage.getItem('custom_yt_key') || '' : '';
      const customGeminiKey = typeof window !== 'undefined' ? localStorage.getItem('custom_gemini_key') || '' : '';

      const stepTimer1 = setTimeout(() => {
        setLoadingStep('2단계: 한국어 형태소 분석 진행 중 (조사·어미 제거 및 실질 체언/용언 추출)...');
      }, 2500);

      const stepTimer2 = setTimeout(() => {
        setLoadingStep('3단계: 바이그램(Bigram) 동시 출현 빈도 및 연결 강도 연산 중...');
      }, 5000);

      const stepTimer3 = setTimeout(() => {
        setLoadingStep('4단계: Gemini 3.6 Flash 모델이 종합 여론 및 인사이트 리포트를 작성하고 있습니다...');
      }, 8000);

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          urlOrId,
          isDemo,
          youtubeApiKey: customYtKey,
          geminiApiKey: customGeminiKey,
        }),
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '댓글 분석 중 오류가 발생했습니다.');
      }

      setResult(data);

      setTimeout(() => {
        const resultAnchor = document.getElementById('analysis-results');
        if (resultAnchor) {
          resultAnchor.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : '댓글 분석 중 예기치 않은 오류가 발생했습니다.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  const handleRetry = () => {
    if (lastAnalyzedInput.urlOrId || lastAnalyzedInput.isDemo) {
      handleAnalyze(lastAnalyzedInput.urlOrId, lastAnalyzedInput.isDemo);
    }
  };

  return (
    <div className="min-h-screen bg-mesh-pattern text-slate-900 flex flex-col font-sans">
      {/* 글로벌 헤더 ([다시시작] 버튼 포함) */}
      <Header
        onReset={handleReset}
        onOpenSettings={() => setIsSettingsOpen(true)}
        hasResult={!!result}
      />

      {/* 메인 컨텐츠 영역 */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        {/* URL 검색 및 입력 섹션 */}
        <InputSection
          onAnalyze={handleAnalyze}
          isLoading={isLoading}
          loadingStep={loadingStep}
        />

        {/* 에러 처리 및 상태 관리 배너 */}
        {errorMessage && (
          <div className="max-w-2xl mx-auto p-5 rounded-2xl bg-rose-50/90 border border-rose-200 text-rose-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="typo-sub font-bold text-rose-900">댓글 분석에 실패했습니다</p>
                <p className="typo-caption text-rose-700 mt-0.5">{errorMessage}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <button
                type="button"
                onClick={handleRetry}
                className="px-3 py-1.5 rounded-xl bg-rose-600 text-white typo-caption font-semibold hover:bg-rose-700 transition-colors flex items-center gap-1 shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>재시도</span>
              </button>
            </div>
          </div>
        )}

        {/* 로딩 진행 상태: Skeleton UI with Shimmer animation */}
        {isLoading && (
          <div className="max-w-7xl mx-auto">
            <AnalysisSkeleton loadingStep={loadingStep} />
          </div>
        )}

        {/* 분석 완료 결과 대시보드 */}
        {!isLoading && result && (
          <div id="analysis-results" className="space-y-8 animate-in fade-in duration-300">
            {/* 결과 상단 바: 대시보드 타이틀 & [다시 시작] 바로가기 */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200/80">
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-red-600" />
                <h2 className="typo-h2 text-slate-900 tracking-tight">
                  댓글 정밀 분석 대시보드
                </h2>
              </div>

              {/* [다시시작] 버튼 */}
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-2 px-4 py-2 typo-sub font-semibold rounded-xl bg-red-600 text-white hover:bg-red-700 active:scale-95 transition-all shadow-md shadow-red-600/20 self-start sm:self-auto"
              >
                <RotateCcw className="w-4 h-4" />
                <span>새로운 영상 다시 시작</span>
              </button>
            </div>

            {/* 비디오 정보 카드 */}
            <VideoInfoCard video={result.video} />

            {/* 1. 댓글 통계 카드 */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="typo-h3 text-slate-800 text-sm sm:text-base flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  댓글 데이터 기본 통계
                </h3>
              </div>
              <StatCards summary={result.sentimentSummary} />
            </section>

            {/* 3, 4, 5. 감정 분포 및 시간대별 차트 */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="typo-h3 text-slate-800 text-sm sm:text-base flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  감성 분포 및 시간대별 댓글 발생 추이
                </h3>
              </div>
              <SentimentCharts
                summary={result.sentimentSummary}
                timeSeries={result.timeSeries}
              />
            </section>

            {/* 2. 주요 키워드 고빈도 TOP 20 (한국어 형태소 분석) */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="typo-h3 text-slate-800 text-sm sm:text-base flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  한국어 형태소 분석 고빈도 키워드 TOP 20
                </h3>
              </div>
              <KeywordChart
                keywords={result.topKeywords}
                selectedKeyword={selectedKeyword}
                onSelectKeyword={(word) =>
                  setSelectedKeyword((prev) => (prev === word ? null : word))
                }
              />
            </section>

            {/* 5, 6, 7. 바이그램 단어 쌍 네트워크 시각화 & 요약 */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="typo-h3 text-slate-800 text-sm sm:text-base flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  바이그램(Bigram) 단어 쌍 네트워크 & 문맥 요약
                </h3>
              </div>
              <BigramNetwork
                bigrams={result.bigrams}
                bigramSummary={result.bigramSummary}
                topKeywords={result.topKeywords}
                selectedKeyword={selectedKeyword}
                onSelectKeyword={(word) =>
                  setSelectedKeyword((prev) => (prev === word ? null : word))
                }
              />
            </section>

            {/* 9. 댓글 분석 바탕 AI 심층 해석 리포트 */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="typo-h3 text-slate-800 text-sm sm:text-base flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  AI 종합 인사이트 & 크리에이터 제언
                </h3>
              </div>
              <AIInterpretationCard interpretation={result.aiInterpretation} />
            </section>

            {/* 맨 위로 이동 및 하단 안내 */}
            <div className="pt-8 pb-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200/80 typo-caption text-slate-400">
              <span>※ 개인정보 및 시청자 보호를 위해 댓글 원문은 노출되지 않습니다.</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-3.5 py-2 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors flex items-center gap-1.5 shadow-sm shadow-red-600/20"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>다시 시작</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-2xs font-semibold"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                  <span>위로 이동</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 푸터 영역 (요구사항: Copyright INU YouTube Comments Analyzer by Seoyeon) */}
      <Footer />

      {/* API 키 설정 모달 다이얼로그 */}
      <ApiKeyModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
