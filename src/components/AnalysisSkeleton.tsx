'use client';

import React from 'react';
import { Loader2, Sparkles, CheckCircle2 } from 'lucide-react';

interface AnalysisSkeletonProps {
  loadingStep: string;
}

export function AnalysisSkeleton({ loadingStep }: AnalysisSkeletonProps) {
  return (
    <div className="w-full space-y-8 animate-in fade-in duration-300">
      {/* 실시간 로딩 진행 상태 배너 */}
      <div className="rounded-2xl bg-white border border-slate-200/90 p-6 shadow-sm overflow-hidden relative">
        {/* 상단 펄스 바 */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-slate-100 overflow-hidden">
          <div className="h-full bg-red-600 rounded-full w-2/3 animate-pulse transition-all duration-500" />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-50 text-red-600 border border-red-200">
                  <Sparkles className="w-3 h-3" />
                  Gemini 3.6 Flash 엔진 가동 중
                </span>
                <span className="text-xs text-slate-400">데이터 처리 중</span>
              </div>
              <h3 className="typo-h3 text-slate-900 mt-0.5">
                {loadingStep || '유튜브 댓글 수집 및 형태소 분석 진행 중...'}
              </h3>
            </div>
          </div>

          <div className="text-xs text-slate-500 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200/60 self-start sm:self-auto flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>AI 형태소 분석기 파이프라인 작동 중</span>
          </div>
        </div>

        {/* 진행 4단계 체크리스트 */}
        <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-50 border border-slate-200/50">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="font-medium">1. YouTube 댓글 수집</span>
          </div>
          <div className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-50 border border-slate-200/50">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="font-medium">2. 한국어 형태소 분리</span>
          </div>
          <div className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-50 border border-slate-200/50">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="font-medium">3. 바이그램 네트워크 연산</span>
          </div>
          <div className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-50 border border-slate-200/50">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="font-medium">4. AI 심층 해석 리포트</span>
          </div>
        </div>
      </div>

      {/* 1. 비디오 정보 카드 스켈레톤 */}
      <div className="rounded-2xl bg-white border border-slate-200/80 p-6 shadow-sm flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-72 h-44 rounded-xl shimmer-box shrink-0" />
        <div className="flex-1 space-y-3.5 justify-between flex flex-col">
          <div className="space-y-2">
            <div className="w-24 h-4 rounded-md shimmer-box" />
            <div className="w-full max-w-md h-7 rounded-lg shimmer-box" />
            <div className="w-3/4 h-5 rounded-lg shimmer-box" />
          </div>
          <div className="flex gap-3 pt-3">
            <div className="w-28 h-8 rounded-xl shimmer-box" />
            <div className="w-28 h-8 rounded-xl shimmer-box" />
            <div className="w-28 h-8 rounded-xl shimmer-box" />
          </div>
        </div>
      </div>

      {/* 2. 통계 카드 6개 스켈레톤 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="rounded-2xl bg-white border border-slate-200/80 p-4 shadow-2xs space-y-3">
            <div className="flex justify-between items-center">
              <div className="w-16 h-3 rounded-md shimmer-box" />
              <div className="w-6 h-6 rounded-lg shimmer-box" />
            </div>
            <div className="w-20 h-7 rounded-lg shimmer-box" />
            <div className="w-14 h-3 rounded-md shimmer-box" />
          </div>
        ))}
      </div>

      {/* 3. 감정 분포 & 시간대별 차트 스켈레톤 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 rounded-2xl bg-white border border-slate-200/80 p-5 shadow-2xs space-y-4">
          <div className="w-32 h-5 rounded-md shimmer-box" />
          <div className="w-48 h-48 rounded-full shimmer-box mx-auto my-4" />
          <div className="grid grid-cols-3 gap-2 pt-2">
            <div className="h-12 rounded-xl shimmer-box" />
            <div className="h-12 rounded-xl shimmer-box" />
            <div className="h-12 rounded-xl shimmer-box" />
          </div>
        </div>

        <div className="lg:col-span-8 rounded-2xl bg-white border border-slate-200/80 p-5 shadow-2xs space-y-4">
          <div className="flex justify-between">
            <div className="w-48 h-5 rounded-md shimmer-box" />
            <div className="w-32 h-7 rounded-xl shimmer-box" />
          </div>
          <div className="w-full h-64 rounded-xl shimmer-box" />
        </div>
      </div>

      {/* 4. 고빈도 키워드 TOP 20 스켈레톤 */}
      <div className="rounded-2xl bg-white border border-slate-200/80 p-6 shadow-2xs space-y-4">
        <div className="w-56 h-6 rounded-md shimmer-box" />
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5, 6, 7].map((j) => (
            <div key={j} className="w-16 h-6 rounded-lg shimmer-box" />
          ))}
        </div>
        <div className="space-y-2 pt-2">
          {[90, 75, 65, 55, 45, 38, 30].map((width, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <div className="w-12 h-4 rounded-md shimmer-box" />
              <div
                className="h-6 rounded-r-lg shimmer-box"
                style={{ width: `${width}%` }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* 5. 바이그램 네트워크 스켈레톤 */}
      <div className="rounded-2xl bg-white border border-slate-200/80 p-6 shadow-2xs space-y-4">
        <div className="flex justify-between items-center">
          <div className="w-64 h-6 rounded-md shimmer-box" />
          <div className="w-24 h-7 rounded-xl shimmer-box" />
        </div>
        <div className="w-full h-96 rounded-xl shimmer-box flex items-center justify-center">
          <span className="text-xs text-slate-400 font-medium animate-pulse">
            노드 및 엣지 물리 시뮬레이션 계산 중...
          </span>
        </div>
      </div>
    </div>
  );
}
