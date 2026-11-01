'use client';

import React, { useState } from 'react';
import { TopKeyword } from '@/types/analyzer';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Hash, Sparkles, Filter } from 'lucide-react';

interface KeywordChartProps {
  keywords: TopKeyword[];
  onSelectKeyword?: (word: string) => void;
  selectedKeyword?: string | null;
}

const POS_COLORS: Record<string, string> = {
  명사: '#3b82f6', // blue-500
  동사: '#10b981', // emerald-500
  형용사: '#f59e0b', // amber-500
  기타: '#8b5cf6', // violet-500
};

export function KeywordChart({ keywords, onSelectKeyword, selectedKeyword }: KeywordChartProps) {
  const [filterPos, setFilterPos] = useState<string>('전체');

  const filteredKeywords = keywords.filter((k) => {
    if (filterPos === '전체') return true;
    return k.pos === filterPos;
  });

  const chartData = [...filteredKeywords].reverse().map((k) => ({
    ...k,
    displayName: `${k.word} (${k.pos})`,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white/95 backdrop-blur-xs p-3 rounded-xl shadow-xl border border-slate-200 typo-caption">
          <div className="flex items-center gap-1.5 font-bold text-slate-800">
            <span className="text-red-600">#{data.rank}위</span>
            <span>{data.word}</span>
            <span className="px-1.5 py-0.5 rounded-sm text-[10px] bg-slate-100 text-slate-600">
              {data.pos}
            </span>
          </div>
          <div className="mt-1 text-slate-600">
            출현 빈도: <span className="font-bold text-slate-900">{data.count}회</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-2xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-red-50 text-red-600">
              <Hash className="w-4 h-4" />
            </div>
            <h3 className="typo-h3 text-slate-900">
              주요 키워드 고빈도 TOP 20
            </h3>
          </div>
          <p className="typo-caption text-slate-500 mt-1 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-red-500" />
            한국어 형태소 분석 실시 (조사/어미 및 불용어 제거, 실질 체언·용언 어간 추출)
          </p>
        </div>

        {/* 품사 필터 */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl typo-caption self-start sm:self-auto">
          <Filter className="w-3 h-3 text-slate-400 ml-1.5 mr-0.5" />
          {['전체', '명사', '동사', '형용사'].map((pos) => (
            <button
              key={pos}
              type="button"
              onClick={() => setFilterPos(pos)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                filterPos === pos
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {pos}
            </button>
          ))}
        </div>
      </div>

      {/* 키워드 태그 칩스 */}
      <div className="mt-4 flex flex-wrap gap-1.5">
        {filteredKeywords.map((k) => {
          const isSelected = selectedKeyword === k.word;
          return (
            <button
              key={k.word}
              type="button"
              onClick={() => onSelectKeyword && onSelectKeyword(k.word)}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg typo-caption font-medium border transition-all ${
                isSelected
                  ? 'bg-red-600 text-white border-red-600 shadow-xs scale-105'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              <span className="font-semibold">{k.word}</span>
              <span
                className={`text-[10px] px-1 rounded-xs ${
                  isSelected ? 'bg-red-700 text-white' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {k.count}회
              </span>
            </button>
          );
        })}
      </div>

      {/* 수평 막대 차트 */}
      <div className="mt-6 h-[460px] w-full">
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center typo-caption text-slate-400">
            해당 품사 키워드가 없습니다.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={chartData}
              margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
            >
              <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
              <YAxis
                type="category"
                dataKey="word"
                tick={{ fontSize: 12, fill: '#475569', fontWeight: 600 }}
                width={70}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                {chartData.map((entry, index) => {
                  const color = POS_COLORS[entry.pos] || '#3b82f6';
                  const isHighlighted = selectedKeyword === entry.word;
                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={isHighlighted ? '#dc2626' : color}
                      opacity={selectedKeyword && !isHighlighted ? 0.35 : 0.9}
                      className="cursor-pointer transition-opacity"
                      onClick={() => onSelectKeyword && onSelectKeyword(entry.word)}
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* 범례 */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-4 typo-caption text-slate-500">
        <span className="font-semibold text-slate-700">품사 구분:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]" />
          <span>명사 (사물·개념·인물)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
          <span>동사 (동작·행동 원형)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
          <span>형용사 (상태·성질 어간)</span>
        </div>
      </div>
    </div>
  );
}
