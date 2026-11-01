import { NextRequest, NextResponse } from 'next/server';
import {
  extractVideoId,
  fetchVideoMetadata,
  fetchYouTubeComments,
  getSampleComments,
} from '@/lib/youtube';
import { analyzeCommentsWithGemini } from '@/lib/analyzer';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { urlOrId, isDemo, youtubeApiKey: clientYtKey, geminiApiKey: clientGeminiKey } = body;

    const youtubeApiKey =
      clientYtKey?.trim() ||
      process.env.YOUTUBE_API_KEY ||
      '';

    const geminiApiKey =
      clientGeminiKey?.trim() ||
      process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
      process.env.GEMINI_API_KEY ||
      '';

    // 1. 데모 모드인 경우 샘플 데이터로 분석
    if (isDemo) {
      if (!geminiApiKey) {
        return NextResponse.json(
          { error: 'Gemini API Key가 설정되지 않았습니다. .env.local을 확인하거나 API 키를 입력해 주세요.' },
          { status: 400 }
        );
      }
      const sample = getSampleComments();
      const analysisResult = await analyzeCommentsWithGemini(
        sample.video,
        sample.comments,
        geminiApiKey
      );
      return NextResponse.json(analysisResult);
    }

    // 2. 비디오 ID 추출
    if (!urlOrId || typeof urlOrId !== 'string') {
      return NextResponse.json(
        { error: '유튜브 동영상 링크나 비디오 ID를 입력해 주세요.' },
        { status: 400 }
      );
    }

    const videoId = extractVideoId(urlOrId);
    if (!videoId) {
      return NextResponse.json(
        { error: '유효한 유튜브 영상 링크나 비디오 ID 형식이 아닙니다.' },
        { status: 400 }
      );
    }

    // 3. API 키 확인
    if (!youtubeApiKey) {
      return NextResponse.json(
        { error: 'YouTube API Key가 필요합니다. 상단 설정에서 입력하거나 .env.local에 설정해 주세요.' },
        { status: 400 }
      );
    }

    if (!geminiApiKey) {
      return NextResponse.json(
        { error: 'Gemini API Key가 필요합니다. 상단 설정에서 입력하거나 .env.local에 설정해 주세요.' },
        { status: 400 }
      );
    }

    // 4. 비디오 정보 및 댓글 가져오기
    const videoMetadata = await fetchVideoMetadata(videoId, youtubeApiKey);
    const comments = await fetchYouTubeComments(videoId, youtubeApiKey, 100);

    // 5. Gemini 3.6 Flash를 통한 형태소 및 감성 분석
    const analysisResult = await analyzeCommentsWithGemini(
      videoMetadata,
      comments,
      geminiApiKey
    );

    return NextResponse.json(analysisResult);
  } catch (err: unknown) {
    console.error('API Error in /api/analyze:', err);
    const message = err instanceof Error ? err.message : '댓글 분석 중 예기치 않은 오류가 발생했습니다.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
