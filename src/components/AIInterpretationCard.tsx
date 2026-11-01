'use client';

import React from 'react';
import { AIInterpretation } from '@/types/analyzer';
import { Sparkles, ThumbsUp, AlertTriangle, Lightbulb, CheckCircle2 } from 'lucide-react';

interface AIInterpretationCardProps {
  interpretation: AIInterpretation;
}

export function AIInterpretationCard({ interpretation }: AIInterpretationCardProps) {
  return (
    <div className="rounded-2xl bg-white border border-slate-200/90 p-6 sm:p-7 shadow-2xs">
      {/* 헤더 */}
      <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
        <div className="p-2 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 text-white shadow-sm shadow-red-500/20">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h3 className="typo-h3 text-slate-900">
            Gemini 3.6 Flash 기반 AI 종합 심층 해석 리포트
          </h3>
          <p className="typo-caption text-slate-500">
            수집된 댓글 전체의 감성 분포와 고빈도 형태소 및 바이그램 연관망을 종합 분석한 인사이트입니다.
          </p>
        </div>
      </div>

      {/* 1. 총평 (Overview) */}
      <div className="mt-5 p-5 rounded-2xl bg-red-50/50 border border-red-100">
        <div className="flex items-center gap-2 typo-sub font-bold text-red-600 mb-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>시청자 여론 종합 총평</span>
        </div>
        <p className="typo-body text-slate-800 leading-relaxed font-medium">
          {interpretation.overview}
        </p>
      </div>

      {/* 2 & 3. 긍정 요인 vs 부정/개선 요인 2열 그리드 */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* 긍정 반응 요인 */}
        <div className="p-5 rounded-2xl bg-emerald-50/40 border border-emerald-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 typo-sub font-bold text-emerald-800 mb-3">
              <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                <ThumbsUp className="w-4 h-4" />
              </div>
              <span>주요 긍정 반응 요인 (시청자 호평)</span>
            </div>
            <ul className="space-y-2.5">
              {interpretation.positiveDrivers.map((driver, idx) => (
                <li key={idx} className="flex items-start gap-2.5 typo-sub text-slate-700 leading-snug">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                  <span>{driver}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-4 pt-3 border-t border-emerald-100/60 typo-caption text-emerald-700 font-semibold">
            시청 지속과 재방문을 이끌어내는 핵심 강점 포인트입니다.
          </div>
        </div>

        {/* 부정 / 개선 피드백 요인 */}
        <div className="p-5 rounded-2xl bg-rose-50/40 border border-rose-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 typo-sub font-bold text-rose-800 mb-3">
              <div className="p-1.5 rounded-lg bg-rose-100 text-rose-700">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <span>부정 및 개선 피드백 요인 (시청자 아쉬움)</span>
            </div>
            <ul className="space-y-2.5">
              {interpretation.negativeDrivers.map((driver, idx) => (
                <li key={idx} className="flex items-start gap-2.5 typo-sub text-slate-700 leading-snug">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0" />
                  <span>{driver}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-4 pt-3 border-t border-rose-100/60 typo-caption text-rose-700 font-semibold">
            향후 콘텐츠 제작 시 우선적으로 보완하면 반응이 극대화됩니다.
          </div>
        </div>
      </div>

      {/* 4. 크리에이터 액션 제언 */}
      <div className="mt-5 p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
        <div className="flex items-center gap-2 typo-sub font-bold text-slate-800 mb-3">
          <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
            <Lightbulb className="w-4 h-4" />
          </div>
          <span>크리에이터를 위한 향후 실천 및 콘텐츠 방향성 제언</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {interpretation.creatorRecommendations.map((rec, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs typo-sub text-slate-700 leading-relaxed"
            >
              <div className="font-bold text-red-600 mb-1 typo-caption">제언 {idx + 1}</div>
              {rec}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
