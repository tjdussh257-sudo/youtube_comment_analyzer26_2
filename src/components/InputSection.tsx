'use client';

import React, { useState } from 'react';
import { Search, Sparkles, X, ArrowRight, Loader2 } from 'lucide-react';

interface InputSectionProps {
  onAnalyze: (urlOrId: string, isDemo?: boolean) => void;
  isLoading: boolean;
  loadingStep: string;
}

const EXAMPLE_VIDEOS = [
  { label: '명곡 리마스터 (Never Gonna Give You Up)', id: 'dQw4w9WgXcQ' },
  { label: 'Google Keynote AI 프레젠테이션', id: 'WSk15Z42Pvg' },
  { label: '애플 신제품 이벤트 하이라이트', id: 'OXx-NxxmWhE' },
];

export function InputSection({ onAnalyze, isLoading }: InputSectionProps) {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    onAnalyze(inputValue.trim(), false);
  };

  const handleExampleClick = (id: string) => {
    setInputValue(id);
    onAnalyze(id, false);
  };

  const handleDemoClick = () => {
    onAnalyze('', true);
  };

  return (
    <section className="w-full max-w-4xl mx-auto pt-6 pb-4 px-4 sm:px-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full typo-caption font-semibold bg-red-50 text-red-600 border border-red-200 mb-3 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Gemini 3.6 Flash 기반 한국어 형태소 & 바이그램 분석 엔진</span>
        </div>
        <h2 className="typo-h1 text-slate-900 tracking-tight">
          YouTube Comments Analyzer
        </h2>
        <p className="typo-body text-slate-600 max-w-xl mx-auto mt-2">
          유튜브 영상 URL을 입력하면 실시간 댓글 수집부터 한국어 형태소 분석, 고빈도 TOP 20 키워드,
          바이그램 네트워크 시각화, 그리고 AI 심층 해석 리포트까지 원스톱으로 제공합니다.
        </p>
      </div>

      {/* 검색 입력 폼 */}
      <form onSubmit={handleSubmit} className="relative max-w-2xl mx-auto">
        <div className="relative flex items-center shadow-lg shadow-slate-200/50 rounded-2xl bg-white border border-slate-200/90 overflow-hidden focus-within:ring-2 focus-within:ring-red-500/20 focus-within:border-red-500 transition-all">
          <div className="pl-4 text-slate-400">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading}
            placeholder="유튜브 영상 링크 또는 비디오 ID 입력 (예: https://youtu.be/...)"
            className="w-full py-4 pl-3 pr-24 typo-body text-slate-900 placeholder-slate-400 bg-transparent focus:outline-hidden"
          />

          {inputValue && !isLoading && (
            <button
              type="button"
              onClick={() => setInputValue('')}
              className="p-1.5 text-slate-400 hover:text-slate-600 mr-1 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <div className="pr-2">
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-xl typo-sub font-semibold text-white bg-red-600 hover:bg-red-700 active:scale-95 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all shadow-md shadow-red-600/20"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>분석 중</span>
                </>
              ) : (
                <>
                  <span>분석 시작</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* 빠른 테스트 & 데모 버튼 */}
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2 typo-caption">
        <span className="text-slate-500 font-medium">추천 예시 영상:</span>
        {EXAMPLE_VIDEOS.map((ex) => (
          <button
            key={ex.id}
            type="button"
            disabled={isLoading}
            onClick={() => handleExampleClick(ex.id)}
            className="px-2.5 py-1 rounded-lg bg-white border border-slate-200/80 hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs font-medium"
          >
            {ex.label}
          </button>
        ))}
        <button
          type="button"
          disabled={isLoading}
          onClick={handleDemoClick}
          className="px-3 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 font-semibold transition-colors border border-red-200/80 shadow-2xs"
        >
          ✨ 샘플 데이터 즉시 체험
        </button>
      </div>
    </section>
  );
}
