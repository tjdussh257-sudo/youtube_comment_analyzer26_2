'use client';

import React from 'react';
import { VideoMetadata } from '@/types/analyzer';
import { Eye, ThumbsUp, MessageSquare, Calendar, ExternalLink, User } from 'lucide-react';

interface VideoInfoCardProps {
  video: VideoMetadata;
}

export function VideoInfoCard({ video }: VideoInfoCardProps) {
  const formattedDate = video.publishedAt
    ? new Date(video.publishedAt).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  return (
    <div className="w-full rounded-2xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden transition-all hover:shadow-md">
      <div className="flex flex-col md:flex-row">
        {/* 썸네일 영역 */}
        <div className="relative md:w-80 h-48 md:h-auto shrink-0 bg-slate-950 overflow-hidden group">
          {video.thumbnailUrl ? (
            <img
              src={video.thumbnailUrl}
              alt={video.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center typo-caption text-slate-500">
              썸네일 없음
            </div>
          )}
          <a
            href={`https://www.youtube.com/watch?v=${video.id}`}
            target="_blank"
            rel="noreferrer"
            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white typo-caption font-semibold gap-1.5"
          >
            <span>YouTube에서 보기</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {/* 상세 정보 영역 */}
        <div className="p-5 sm:p-6 flex flex-col justify-between flex-1">
          <div>
            <div className="flex items-center gap-2 typo-caption text-red-600 font-semibold mb-1">
              <span>분석 대상 동영상</span>
            </div>
            <h3 className="typo-h3 text-slate-900 line-clamp-2 leading-snug">
              {video.title}
            </h3>

            <div className="mt-3 flex flex-wrap items-center gap-y-2 gap-x-4 typo-caption text-slate-500">
              <div className="flex items-center gap-1 font-medium text-slate-700">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>{video.channelTitle}</span>
              </div>
              {formattedDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{formattedDate}</span>
                </div>
              )}
            </div>
          </div>

          {/* 통계 지표 배지 */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3">
            {video.viewCount && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 text-slate-700 typo-caption font-medium border border-slate-100">
                <Eye className="w-3.5 h-3.5 text-blue-500" />
                <span>조회수 {Number(video.viewCount).toLocaleString()}회</span>
              </div>
            )}
            {video.likeCount && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 text-slate-700 typo-caption font-medium border border-slate-100">
                <ThumbsUp className="w-3.5 h-3.5 text-rose-500" />
                <span>좋아요 {Number(video.likeCount).toLocaleString()}개</span>
              </div>
            )}
            {video.commentCount && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 text-slate-700 typo-caption font-medium border border-slate-100">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                <span>전체 댓글 {Number(video.commentCount).toLocaleString()}개</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
