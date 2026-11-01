'use client';

import React, { useState } from 'react';
import { SentimentSummary, TimeSeriesPoint } from '@/types/analyzer';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
  Legend,
} from 'recharts';
import { PieChart as PieIcon, TrendingUp, Info } from 'lucide-react';

interface SentimentChartsProps {
  summary: SentimentSummary;
  timeSeries: TimeSeriesPoint[];
}

const SENTIMENT_COLORS = {
  positive: '#10b981', // emerald-500
  negative: '#f43f5e', // rose-500
  neutral: '#64748b', // slate-500
};

export function SentimentCharts({ summary, timeSeries }: SentimentChartsProps) {
  const [timelineMode, setTimelineMode] = useState<'total' | 'sentiment'>('sentiment');

  // 파이 차트 데이터
  const pieData = [
    { name: '긍정', value: summary.positiveCount, ratio: summary.positiveRatio, color: SENTIMENT_COLORS.positive },
    { name: '부정', value: summary.negativeCount, ratio: summary.negativeRatio, color: SENTIMENT_COLORS.negative },
    { name: '중립', value: summary.neutralCount, ratio: summary.neutralRatio, color: SENTIMENT_COLORS.neutral },
  ].filter((d) => d.value > 0);

  // 커스텀 파이 툴팁
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white/95 backdrop-blur-xs p-3 rounded-xl shadow-xl border border-slate-200 typo-caption">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
            <span className="font-bold text-slate-800">{data.name} 반응</span>
          </div>
          <div className="mt-1.5 text-slate-600">
            총 <span className="font-semibold text-slate-900">{data.value}건</span> ({data.ratio}%)
          </div>
        </div>
      );
    }
    return null;
  };

  // 커스텀 타임라인 툴팁
  const CustomTimelineTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-xs p-3 rounded-xl shadow-xl border border-slate-200 typo-caption min-w-[140px]">
          <div className="font-bold text-slate-800 pb-1 mb-1.5 border-b border-slate-100">
            {label}
          </div>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                  {entry.name}
                </span>
                <span className="font-semibold text-slate-900">{entry.value}건</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* 5. 감정 분포 파이 차트 (4 cols) */}
      <div className="lg:col-span-4 rounded-2xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-red-50 text-red-600">
                <PieIcon className="w-4 h-4" />
              </div>
              <h3 className="typo-h3 text-slate-900 text-sm sm:text-base">감정 분포 비율</h3>
            </div>
            <span className="typo-caption text-slate-400">도넛 차트</span>
          </div>

          <div className="relative h-64 mt-2 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                  animationDuration={800}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={2} stroke="#fff" />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            {/* 도넛 중앙 요약 지표 */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="typo-caption text-slate-400">긍정률</span>
              <span className="typo-h2 font-black text-emerald-600">
                {summary.positiveRatio}%
              </span>
            </div>
          </div>
        </div>

        {/* 하단 범례 및 상세 */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-center">
          <div className="p-2 rounded-xl bg-emerald-50/60">
            <div className="typo-caption font-medium text-emerald-700">긍정</div>
            <div className="text-sm font-bold text-emerald-600">{summary.positiveCount}건</div>
            <div className="text-[10px] text-emerald-500">{summary.positiveRatio}%</div>
          </div>
          <div className="p-2 rounded-xl bg-rose-50/60">
            <div className="typo-caption font-medium text-rose-700">부정</div>
            <div className="text-sm font-bold text-rose-600">{summary.negativeCount}건</div>
            <div className="text-[10px] text-rose-500">{summary.negativeRatio}%</div>
          </div>
          <div className="p-2 rounded-xl bg-slate-50">
            <div className="typo-caption font-medium text-slate-600">중립</div>
            <div className="text-sm font-bold text-slate-700">{summary.neutralCount}건</div>
            <div className="text-[10px] text-slate-400">{summary.neutralRatio}%</div>
          </div>
        </div>
      </div>

      {/* 3 & 4. 시간대별 라인 / 감성 추이 차트 (8 cols) */}
      <div className="lg:col-span-8 rounded-2xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
        <div>
          <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-100 gap-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h3 className="typo-h3 text-slate-900 text-sm sm:text-base">
                  {timelineMode === 'sentiment'
                    ? '시간대별 긍정 · 부정 · 중립 댓글 추이'
                    : '시간대별 총 댓글 발생 추이'}
                </h3>
              </div>
            </div>

            {/* 보기 전환 탭 */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl typo-caption">
              <button
                type="button"
                onClick={() => setTimelineMode('sentiment')}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  timelineMode === 'sentiment'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                감성별 추이 (요구 4)
              </button>
              <button
                type="button"
                onClick={() => setTimelineMode('total')}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  timelineMode === 'total'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                전체 라인 차트 (요구 3)
              </button>
            </div>
          </div>

          <div className="h-64 mt-4 w-full">
            {timeSeries.length === 0 ? (
              <div className="h-full flex items-center justify-center typo-caption text-slate-400">
                시간대 데이터가 충분하지 않습니다.
              </div>
            ) : timelineMode === 'sentiment' ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="posGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={SENTIMENT_COLORS.positive} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={SENTIMENT_COLORS.positive} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="negGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={SENTIMENT_COLORS.negative} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={SENTIMENT_COLORS.negative} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="neuGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={SENTIMENT_COLORS.neutral} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={SENTIMENT_COLORS.neutral} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="timeLabel" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
                  <Tooltip content={<CustomTimelineTooltip />} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Area
                    type="monotone"
                    dataKey="positive"
                    name="긍정"
                    stroke={SENTIMENT_COLORS.positive}
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#posGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="negative"
                    name="부정"
                    stroke={SENTIMENT_COLORS.negative}
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#negGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="neutral"
                    name="중립"
                    stroke={SENTIMENT_COLORS.neutral}
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#neuGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="timeLabel" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
                  <Tooltip content={<CustomTimelineTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="total"
                    name="댓글 수"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ r: 3, fill: '#3b82f6' }}
                    activeDot={{ r: 6, stroke: '#60a5fa', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="mt-3 flex items-center gap-1.5 typo-caption text-slate-400">
          <Info className="w-3.5 h-3.5 shrink-0" />
          <span>차트의 각 포인트에 마우스를 올리면 해당 시간대의 상세 감정별 수량을 확인할 수 있습니다.</span>
        </div>
      </div>
    </div>
  );
}
