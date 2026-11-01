'use client';

import React from 'react';
import { Sparkles, Shield, Heart, GraduationCap } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full mt-20 border-t border-slate-200/80 bg-white/70 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-200/60">
          {/* 브랜드 & 슬로건 */}
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-red-500/20">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 tracking-tight text-base sm:text-lg">
                  YouTube Comments Analyzer
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-600 border border-red-200">
                  <GraduationCap className="w-3 h-3" />
                  INU
                </span>
              </div>
              <p className="typo-caption text-slate-500 mt-0.5">
                인공지능 한국어 형태소 분석 · 바이그램 네트워크 · 여론 감성 리포트 시스템
              </p>
            </div>
          </div>

          {/* 기술 스택 칩 */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-600">
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 font-medium">Gemini 3.6 Flash</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 font-medium">Next.js 16 (Turbopack)</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 font-medium">D3-Force Interactive</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 font-medium">YouTube Data API v3</span>
          </div>
        </div>

        {/* 하단 카피라이트 & 면책 조항 */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2 font-medium">
            <span className="text-slate-800 font-semibold">
              Copyright INU YouTube Comments Analyzer by Seoyeon
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-emerald-500" />
              <span>댓글 원문 비노출 원칙 준수</span>
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              <span>시스템 정상 가동</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
