



export type YouTubeVideo = {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  channelTitle: string;
  channelId?: string;
  channelThumbnail?: string;
  duration?: string; // ISO 8601 duration
  durationSeconds?: number;
  viewCount?: string;
  likeCount?: string;
  subscriberCount?: string;
  liveBroadcastContent?: string;
};

export type YouTubeSubscription = {
    id: string;
    channelId: string | undefined;
    title: string;
    description: string;
    thumbnail: string;
};

type YouTubeSearchResponse = {
    videos: YouTubeVideo[];
    nextPageToken?: string;
};

const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

function parseDuration(isoDuration: string): number {
  const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
  const matches = isoDuration.match(regex);

  if (!matches) {
    return 0;
  }

  const hours = parseInt(matches[1] || '0', 10);
  const minutes = parseInt(matches[2] || '0', 10);
  const seconds = parseInt(matches[3] || '0', 10);

  return hours * 3600 + minutes * 60 + seconds;
}


function mapSearchResultToVideo(item: any, videoDetailsMap: Map<string, any>, channelThumbnailMap: Map<string, string>): YouTubeVideo {
  const videoId = item.id.videoId;
  const videoDetails = videoDetailsMap.get(videoId) || {};
  const duration = videoDetails.contentDetails?.duration;
  return {
    id: videoId,
    title: item.snippet.title,
    description: item.snippet.description,
    thumbnail: item.snippet.thumbnails.high.url,
    publishedAt: item.snippet.publishedAt,
    channelTitle: item.snippet.channelTitle,
    channelId: item.snippet.channelId,
    liveBroadcastContent: item.snippet.liveBroadcastContent,
    duration: duration,
    durationSeconds: duration ? parseDuration(duration) : 0,
    viewCount: videoDetails.statistics?.viewCount,
    likeCount: videoDetails.statistics?.likeCount,
    channelThumbnail: channelThumbnailMap.get(item.snippet.channelId),
  };
}

function mapVideoResultToVideo(item: any): YouTubeVideo {
    const duration = item.contentDetails?.duration;
    return {
      id: item.id,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.high.url,
      publishedAt: item.snippet.publishedAt,
      channelTitle: item.snippet.channelTitle,
      channelId: item.snippet.channelId,
      duration: duration,
      durationSeconds: duration ? parseDuration(duration) : 0,
      viewCount: item.statistics?.viewCount,
      likeCount: item.statistics?.likeCount,
      liveBroadcastContent: item.snippet.liveBroadcastContent,
    };
  }

async function fetchYouTubeAPI(endpoint: string, params: Record<string, string>, options: RequestInit = {}) {
  const url = new URL(`${BASE_URL}/${endpoint}`);
  const headers: HeadersInit = options.headers || {};
  
  if (API_KEY) {
    url.searchParams.append('key', API_KEY);
  } else {
    console.error('YouTube API key is missing.');
    return null;
  }
  
  for (const key in params) {
    url.searchParams.append(key, params[key]);
  }

  try {
    const response = await fetch(url.toString(), {
        ...options,
        headers,
        next: { revalidate: endpoint === 'search' || endpoint === 'videos' ? 3600 : 0, ...options.next }
    }); 
    if (!response.ok) {
      const errorData = await response.json();
      console.error('YouTube API Error:', errorData.error.message);
      return null;
    }
    if (response.status === 204) return true; // For DELETE requests
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch from YouTube API:', error);
    return null;
  }
}

export async function searchVideos(query: string, pageToken?: string): Promise<YouTubeSearchResponse> {
  const searchParams: Record<string, string> = {
    part: 'snippet',
    q: query,
    type: 'video',
    maxResults: '20',
  };

  if (pageToken) {
    searchParams.pageToken = pageToken;
  }

  const searchData = await fetchYouTubeAPI('search', searchParams);

  if (!searchData || !searchData.items) return { videos: [], nextPageToken: undefined };

  const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');
  if (!videoIds) return { videos: [], nextPageToken: searchData.nextPageToken };
  
  const channelIds = [...new Set(searchData.items.map((item: any) => item.snippet.channelId).filter(Boolean))].join(',');

  const [videosData, channelsData] = await Promise.all([
    fetchYouTubeAPI('videos', {
      part: 'contentDetails,statistics',
      id: videoIds,
    }),
    fetchYouTubeAPI('channels', {
      part: 'snippet',
      id: channelIds,
    }),
  ]);

  const videoDetailsMap = new Map<string, any>();
  if (videosData?.items) {
    videosData.items.forEach((item: any) => videoDetailsMap.set(item.id, item));
  }

  const channelThumbnailMap = new Map<string, string>();
  if (channelsData?.items) {
    channelsData.items.forEach((item: any) => channelThumbnailMap.set(item.id, item.snippet.thumbnails.default.url));
  }

  const videos = searchData.items.map((item: any) => mapSearchResultToVideo(item, videoDetailsMap, channelThumbnailMap));
  
  return { videos, nextPageToken: searchData.nextPageToken };
}

export async function getVideoDetails(videoId: string): Promise<YouTubeVideo | null> {
  const data = await fetchYouTubeAPI('videos', {
    part: 'snippet,contentDetails,statistics',
    id: videoId,
  });
  if (data && data.items.length > 0) {
    const video = mapVideoResultToVideo(data.items[0]);

    if (video.channelId) {
        const channelData = await fetchYouTubeAPI('channels', {
            part: 'snippet,statistics',
            id: video.channelId,
        });
        if (channelData && channelData.items.length > 0) {
            video.channelThumbnail = channelData.items[0].snippet.thumbnails.default.url;
            video.subscriberCount = channelData.items[0].statistics.subscriberCount;
        }
    }
    return video;
  }
  return null;
}

export async function getRelatedVideos(videoId: string): Promise<YouTubeVideo[]> {
    const data = await fetchYouTubeAPI('search', {
        part: 'snippet',
        relatedToVideoId: videoId,
        type: 'video',
        maxResults: '20',
    });
    if (!data || !data.items) return [];

    let videos = data.items
      .filter((item: any) => item.id.videoId) // Ensure videoId exists
      .map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.high.url,
        publishedAt: item.snippet.publishedAt,
        channelTitle: item.snippet.channelTitle,
        channelId: item.snippet.channelId,
        liveBroadcastContent: item.snippet.liveBroadcastContent,
      }));

    const videoIds = videos.map(v => v.id).join(',');
    if (!videoIds) return [];

    const videosData = await fetchYouTubeAPI('videos', {
      part: 'contentDetails,statistics',
      id: videoIds,
    });
    if (!videosData || !videosData.items) return [];

    const videoDetailsMap = new Map<string, any>();
    videosData.items.forEach((item: any) => {
        videoDetailsMap.set(item.id, item);
    });

    const detailedVideos = videos.map(video => {
        const details = videoDetailsMap.get(video.id);
        if (!details) return video;
        const duration = details.contentDetails?.duration;
        return {
            ...video,
            duration,
            durationSeconds: duration ? parseDuration(duration) : 0,
            viewCount: details.statistics?.viewCount,
        };
    });

    return detailedVideos.slice(0,10);
}
