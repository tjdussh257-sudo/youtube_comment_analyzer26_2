import { VideoMetadata } from '@/types/analyzer';

export interface RawComment {
  id: string;
  text: string;
  author: string;
  publishedAt: string;
  likeCount: number;
}

/**
 * 유튜브 URL 또는 ID 문자열에서 비디오 ID를 추출합니다.
 */
export function extractVideoId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // 11자리 영숫자/기호 ID 직접 입력인 경우
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  try {
    const parsedUrl = new URL(trimmed);
    const hostname = parsedUrl.hostname.toLowerCase();

    // youtu.be/<id>
    if (hostname.includes('youtu.be')) {
      const id = parsedUrl.pathname.slice(1).split('/')[0];
      if (id && /^[a-zA-Z0-9_-]{11}$/.test(id)) return id;
    }

    // youtube.com/watch?v=<id>
    if (hostname.includes('youtube.com')) {
      const v = parsedUrl.searchParams.get('v');
      if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v;

      // youtube.com/shorts/<id> or youtube.com/embed/<id>
      const pathParts = parsedUrl.pathname.split('/').filter(Boolean);
      if (pathParts.length >= 2 && (pathParts[0] === 'shorts' || pathParts[0] === 'embed')) {
        const id = pathParts[1];
        if (id && /^[a-zA-Z0-9_-]{11}$/.test(id)) return id;
      }
    }
  } catch {
    // URL 객체 파싱 실패 시 정규식 대체 탐색
    const match = trimmed.match(/(?:youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]{11})/);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * YouTube Data API v3를 통해 비디오 상세 정보 가져오기
 */
export async function fetchVideoMetadata(videoId: string, apiKey: string): Promise<VideoMetadata> {
  const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoId}&key=${apiKey}`;
  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok || data.error) {
    throw new Error(data.error?.message || 'YouTube 영상 정보를 불러오지 못했습니다.');
  }

  if (!data.items || data.items.length === 0) {
    throw new Error('해당 비디오를 찾을 수 없습니다. 비디오 ID 또는 URL을 확인해 주세요.');
  }

  const item = data.items[0];
  const snippet = item.snippet;
  const stats = item.statistics;

  return {
    id: videoId,
    title: snippet.title || '제목 없음',
    channelTitle: snippet.channelTitle || '알 수 없는 채널',
    publishedAt: snippet.publishedAt,
    thumbnailUrl:
      snippet.thumbnails?.maxres?.url ||
      snippet.thumbnails?.high?.url ||
      snippet.thumbnails?.medium?.url ||
      snippet.thumbnails?.default?.url ||
      '',
    viewCount: stats?.viewCount,
    likeCount: stats?.likeCount,
    commentCount: stats?.commentCount,
  };
}

/**
 * YouTube Data API v3를 통해 댓글 목록 가져오기 (최대 maxComments개)
 */
export async function fetchYouTubeComments(
  videoId: string,
  apiKey: string,
  maxComments: number = 100
): Promise<RawComment[]> {
  const comments: RawComment[] = [];
  let nextPageToken: string | undefined = undefined;

  while (comments.length < maxComments) {
    const fetchLimit = Math.min(100, maxComments - comments.length);
    let url = `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&maxResults=${fetchLimit}&order=relevance&key=${apiKey}`;
    if (nextPageToken) {
      url += `&pageToken=${nextPageToken}`;
    }

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok || data.error) {
      // 댓글 비활성화 등의 경우
      if (data.error?.errors?.[0]?.reason === 'commentsDisabled') {
        throw new Error('이 동영상은 댓글 기능이 사용 중지되어 있습니다.');
      }
      throw new Error(data.error?.message || '댓글을 불러오는 중 오류가 발생했습니다.');
    }

    if (!data.items || data.items.length === 0) {
      break;
    }

    for (const item of data.items) {
      const topComment = item.snippet?.topLevelComment?.snippet;
      if (topComment) {
        comments.push({
          id: item.id,
          text: topComment.textDisplay || topComment.textOriginal || '',
          author: topComment.authorDisplayName || '익명',
          publishedAt: topComment.publishedAt,
          likeCount: topComment.likeCount || 0,
        });
      }
      if (comments.length >= maxComments) break;
    }

    nextPageToken = data.nextPageToken;
    if (!nextPageToken) break;
  }

  if (comments.length === 0) {
    throw new Error('이 영상에는 수집 가능한 댓글이 없습니다.');
  }

  return comments;
}

/**
 * API 키가 없거나 테스트를 원하는 사용자를 위한 샘플 데이터 생성기
 */
export function getSampleComments(): { video: VideoMetadata; comments: RawComment[] } {
  const sampleVideo: VideoMetadata = {
    id: 'sample_vid_2026',
    title: '[심층분석] 차세대 AI 기술 트렌드와 2026년 이후 개발자의 미래 완벽 정리',
    channelTitle: '테크 인사이트 코리아',
    publishedAt: new Date(Date.now() - 3600 * 24 * 7 * 1000).toISOString(),
    thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60',
    viewCount: '154820',
    likeCount: '8940',
    commentCount: '482',
  };

  const sampleTexts = [
    { text: '설명이 너무 명확하고 깔끔해서 머리에 쏙쏙 들어옵니다. 다음 후속 영상도 기대할게요!', type: 'pos', offsetH: 1 },
    { text: '목소리 톤이 편안해서 집중이 정말 잘 되었어요. 자료 퀄리티가 상당하네요.', type: 'pos', offsetH: 2 },
    { text: 'AI 모델 발전 속도가 무서울 정도네요. 개발자로서 앞으로 어떤 스택을 준비해야 할지 감이 잡힙니다.', type: 'pos', offsetH: 3 },
    { text: '중간 부분 코드 예시 설명이 다소 빠르게 지나가서 아쉬웠습니다. 조금만 더 천천히 짚어주셨으면 좋겠어요.', type: 'neg', offsetH: 4 },
    { text: '음향 마이크 노이즈가 살짝 들려서 거슬리는 부분이 있었습니다. 마이크 필터 신경 써주시면 완벽할 것 같아요.', type: 'neg', offsetH: 5 },
    { text: '전체적인 흐름은 좋았으나 이전 편 강의와 겹치는 설명이 많아 약간 지루했습니다.', type: 'neg', offsetH: 6 },
    { text: '핵심 개념 정리가 잘 되어 있어서 실무에 바로 적용해볼 생각입니다. 훌륭한 영상 감사드립니다.', type: 'pos', offsetH: 8 },
    { text: '그냥 일반적인 기술 소개 수준이라 특별히 새로운 정보는 없네요. 평이합니다.', type: 'neu', offsetH: 10 },
    { text: '발표 슬라이드와 시각 자료 디자인이 너무 직관적이라 이해하기 훨씬 수월했습니다.', type: 'pos', offsetH: 12 },
    { text: '영상 길이가 길어서 2배속으로 봤는데도 전달력이 좋네요. 요약본 공유도 부탁드립니다.', type: 'pos', offsetH: 15 },
    { text: '기술 용어 설명에 대한 자막 폰트가 작아서 모바일로 보기에 가독성이 조금 떨어집니다.', type: 'neg', offsetH: 18 },
    { text: '참고할 만한 영상이네요. 링크에 남겨주신 깃허브 레포지토리 잘 살펴봤습니다.', type: 'neu', offsetH: 20 },
    { text: '이 분야 입문자에게 교과서 같은 강의입니다. 주변 동료들에게도 적극 추천했습니다!', type: 'pos', offsetH: 24 },
    { text: '설명 도중 음성 싱크가 1초 정도 밀리는 구간이 있네요. 편집 시 확인 부탁드립니다.', type: 'neg', offsetH: 28 },
    { text: '심화 과정 2탄도 꼭 제작해 주시면 감사하겠습니다. 구독과 좋아요 누르고 갑니다.', type: 'pos', offsetH: 32 },
    { text: '중립적인 입장에서 기술의 장단점을 균형 있게 다뤄주셔서 신뢰가 갑니다.', type: 'pos', offsetH: 36 },
    { text: '다 좋은데 중간 광고가 너무 자주 나와서 시청 흐름이 끊기네요.', type: 'neg', offsetH: 40 },
    { text: '인사이트 넘치는 좋은 강의였습니다. 지속적인 업로드 응원합니다!', type: 'pos', offsetH: 48 },
    { text: '이 부분 개념은 공식 문서와 조금 상이한 것 같은데 추가 확인이 필요해 보입니다.', type: 'neu', offsetH: 52 },
    { text: '영상 퀄리티가 날이 갈수록 업그레이드되네요. 항상 유익한 지식 감사합니다.', type: 'pos', offsetH: 60 },
  ];

  const now = Date.now();
  const comments: RawComment[] = sampleTexts.map((s, idx) => ({
    id: `sample_comment_${idx + 1}`,
    text: s.text,
    author: `시청자_${idx + 1}`,
    publishedAt: new Date(now - s.offsetH * 3600 * 1000).toISOString(),
    likeCount: Math.floor(Math.random() * 45) + 1,
  }));

  return { video: sampleVideo, comments };
}
