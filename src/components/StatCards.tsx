'use client';

import React from 'react';
import { SentimentSummary } from '@/types/analyzer';
import { MessageCircle, AlignLeft, Smile, Frown, Meh, Gauge } from 'lucide-react';

interface StatCardsProps {
  summary: SentimentSummary;
}

export function StatCards({ summary }: StatCardsProps) {
  const getScoreStatus = (score: number) => {
    if (score >= 40) return { label: '매우 긍정적', color: 'text-emerald-600', bg: 'bg-emerald-50' };
    if (score >= 10) return { label: '대체로 긍정적', color: 'text-teal-600', bg: 'bg-teal-50' };
    if (score > -10) return { label: '중립/균형', color: 'text-slate-600', bg: 'bg-slate-50' };
    if (score > -40) return { label: '다소 부정적', color: 'text-amber-600', bg: 'bg-amber-50' };
    return { label: '매우 부정적', color: 'text-rose-600', bg: 'bg-rose-50' };
  };

  const scoreStatus = getScoreStatus(summary.sentimentScore);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
      {/* 1. 총 분석 댓글 수 */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="typo-caption font-semibold">총 분석 댓글</span>
          <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
            <MessageCircle className="w-4 h-4" />
          </div>
        </div>
        <div className="typo-h2 text-slate-900 font-extrabold">
          {summary.totalAnalyzed.toLocaleString()}
          <span className="typo-caption font-normal text-slate-500 ml-1">건</span>
        </div>
        <p className="mt-1 typo-caption text-slate-400">수집된 유효 댓글</p>
      </div>

      {/* 2. 평균 댓글 길이 */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="typo-caption font-semibold">평균 댓글 길이</span>
          <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
            <AlignLeft className="w-4 h-4" />
          </div>
        </div>
        <div className="typo-h2 text-slate-900 font-extrabold">
          {summary.averageLength.toLocaleString()}
          <span className="typo-caption font-normal text-slate-500 ml-1">자</span>
        </div>
        <p className="mt-1 typo-caption text-slate-400">글자 수 기준 평균</p>
      </div>

      {/* 3. 긍정 비율 */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="typo-caption font-semibold text-emerald-600">긍정 반응</span>
          <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
            <Smile className="w-4 h-4" />
          </div>
        </div>
        <div className="typo-h2 text-emerald-600 font-extrabold">
          {summary.positiveRatio}%
        </div>
        <p className="mt-1 typo-caption text-slate-400">{summary.positiveCount}건 (호평·응원)</p>
      </div>

      {/* 4. 부정 비율 */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="typo-caption font-semibold text-rose-600">부정/개선</span>
          <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
            <Frown className="w-4 h-4" />
          </div>
        </div>
        <div className="typo-h2 text-rose-600 font-extrabold">
          {summary.negativeRatio}%
        </div>
        <p className="mt-1 typo-caption text-slate-400">{summary.negativeCount}건 (비판·아쉬움)</p>
      </div>

      {/* 5. 중립 비율 */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="typo-caption font-semibold text-slate-600">중립 반응</span>
          <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600">
            <Meh className="w-4 h-4" />
          </div>
        </div>
        <div className="typo-h2 text-slate-700 font-extrabold">
          {summary.neutralRatio}%
        </div>
        <p className="mt-1 typo-caption text-slate-400">{summary.neutralCount}건 (단순 문의·정보)</p>
      </div>

      {/* 6. 종합 여론 지수 */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="typo-caption font-semibold">감성 지수</span>
          <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
            <Gauge className="w-4 h-4" />
          </div>
        </div>
        <div className={`typo-h2 font-extrabold ${scoreStatus.color}`}>
          {summary.sentimentScore > 0 ? `+${summary.sentimentScore}` : summary.sentimentScore}
          <span className="typo-caption font-normal text-slate-400 ml-1">점</span>
        </div>
        <div className="mt-1 inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700">
          {scoreStatus.label}
        </div>
      </div>
    </div>
  );
}
