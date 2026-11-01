'use client';

import React, { useState, useEffect } from 'react';
import { Key, X, Check, ExternalLink } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ApiKeyModal({ isOpen, onClose }: ApiKeyModalProps) {
  const [youtubeKey, setYoutubeKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedYt = localStorage.getItem('custom_yt_key') || '';
      const savedGemini = localStorage.getItem('custom_gemini_key') || '';
      setYoutubeKey(savedYt);
      setGeminiKey(savedGemini);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('custom_yt_key', youtubeKey.trim());
      localStorage.setItem('custom_gemini_key', geminiKey.trim());
      setIsSaved(true);
      setTimeout(() => {
        setIsSaved(false);
        onClose();
      }, 700);
    }
  };

  const handleClear = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('custom_yt_key');
      localStorage.removeItem('custom_gemini_key');
      setYoutubeKey('');
      setGeminiKey('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400">
              <Key className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-lg text-slate-900 dark:text-white">API 키 설정</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          서버의 기본 환경변수 키가 이미 등록되어 있어 입력하지 않아도 바로 분석이 가능합니다.
          개인 전용 API 키를 사용하고 싶으신 경우에만 입력해 주세요.
        </p>

        <div className="mt-4 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                YouTube Data API v3 Key
              </label>
              <a
                href="https://console.cloud.google.com/apis/credentials"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-blue-600 hover:underline flex items-center gap-0.5"
              >
                발급받기 <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <input
              type="password"
              value={youtubeKey}
              onChange={(e) => setYoutubeKey(e.target.value)}
              placeholder="AIzaSy... (미입력 시 기본 키 사용)"
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-500/20 focus:border-red-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Google Gemini API Key
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-blue-600 hover:underline flex items-center gap-0.5"
              >
                발급받기 <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <input
              type="password"
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              placeholder="AQ... 또는 AIzaSy... (미입력 시 기본 키 사용)"
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-500/20 focus:border-red-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
            />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-slate-400 hover:text-slate-600 underline dark:hover:text-slate-300"
          >
            설정 초기화
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              닫기
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 text-xs font-medium rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center gap-1.5"
            >
              {isSaved ? (
                <>
                  <Check className="w-4 h-4" /> 저장됨
                </>
              ) : (
                '저장'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
