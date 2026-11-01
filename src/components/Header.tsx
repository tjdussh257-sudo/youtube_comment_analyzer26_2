'use client';

import React from 'react';
import { Sparkles, RotateCcw, Settings } from 'lucide-react';

interface HeaderProps {
  onReset: () => void;
  onOpenSettings: () => void;
  hasResult: boolean;
}

export function Header({ onReset, onOpenSettings, hasResult }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* 로고 & 타이틀 */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-white shadow-md shadow-red-500/20 shrink-0">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight">
                YouTube Comments Analyzer
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-50 text-red-600 border border-red-200/80">
                <Sparkles className="w-3 h-3" />
                gemini-3.6-flash
              </span>
            </div>
            <p className="typo-caption text-slate-500 hidden sm:block">
              한국어 형태소 분석 · 바이그램 네트워크 · AI 인사이트 해석
            </p>
          </div>
        </div>

        {/* 액션 버튼들 */}
        <div className="flex items-center gap-2">
          {/* [다시시작] 버튼 */}
          <button
            onClick={onReset}
            disabled={!hasResult}
            title="새로운 유튜브 영상 분석하기"
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 typo-sub font-semibold rounded-xl transition-all shadow-xs ${
              hasResult
                ? 'bg-red-600 text-white hover:bg-red-700 active:scale-95 shadow-red-600/20'
                : 'bg-slate-100 text-slate-400 border border-slate-200/60 cursor-not-allowed'
            }`}
          >
            <RotateCcw className={`w-3.5 h-3.5 ${hasResult ? 'transition-transform hover:-rotate-45' : ''}`} />
            <span>다시 시작</span>
          </button>

          {/* API 설정 버튼 */}
          <button
            onClick={onOpenSettings}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 typo-sub font-medium rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Settings className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">API 설정</span>
          </button>
        </div>
      </div>
    </header>
  );
}
