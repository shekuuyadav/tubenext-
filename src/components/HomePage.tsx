
'use client';

import { VideoCard } from '@/components/VideoCard';
import { searchVideos, type YouTubeVideo } from '@/lib/youtube';
import { Suspense, useEffect, useState, useRef, useCallback } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useSearchParams } from 'next/navigation';
import { Loader2, RefreshCw } from 'lucide-react';

export function VideoGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="flex flex-col space-y-3">
          <Skeleton className="h-[180px] w-full rounded-xl" />
          <div className="flex items-start gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="w-full space-y-2">
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function VideoGrid({
  query,
  refreshKey,
}: {
  query: string;
  refreshKey: number;
}) {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>(undefined);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);

  const fetchAndSetVideos = async (searchQuery: string, token?: string) => {
      if (token) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
        setVideos([]); // Reset videos for a new search
      }
      
      const { videos: newVideos, nextPageToken: newNextPageToken } = await searchVideos(searchQuery, token);
      
      setVideos((prevVideos) => {
        if (!token) return newVideos;
        const existingIds = new Set(prevVideos.map(v => v.id));
        const uniqueNewVideos = newVideos.filter(v => !existingIds.has(v.id));
        return [...prevVideos, ...uniqueNewVideos];
      });
      setNextPageToken(newNextPageToken);

      if (token) {
        setIsLoadingMore(false);
      } else {
        setIsLoading(false);
      }
  };

  useEffect(() => {
    // Reset and fetch videos when the query or shorts filter changes
    fetchAndSetVideos(query);
  }, [query, refreshKey]);


  const lastVideoElementRef = useCallback((node: HTMLDivElement) => {
    if (isLoading || isLoadingMore) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && nextPageToken) {
        fetchAndSetVideos(query, nextPageToken);
      }
    });

    if (node) observer.current.observe(node);
  }, [isLoading, isLoadingMore, nextPageToken, query]);

  if (isLoading) {
    return <VideoGridSkeleton />;
  }

  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20 p-12 text-center">
        <h3 className="text-xl font-bold tracking-tight">No videos found</h3>
        <p className="text-muted-foreground">
          Try searching for something else.
        </p>
      </div>
    );
  }

  return (
    <>
        <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {videos.map((video: YouTubeVideo, index) => {
            if (videos.length === index + 1) {
                return <div ref={lastVideoElementRef} key={video.id}><VideoCard video={video} /></div>
            } else {
                return <VideoCard key={video.id} video={video} />;
            }
        })}
        </div>
        {isLoadingMore && (
            <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )}
        {!isLoadingMore && !nextPageToken && videos.length > 0 && (
             <div className="py-8 text-center text-muted-foreground">
                <p>You&apos;ve reached the end of the results.</p>
            </div>
        )}
    </>
  );
}

export function HomePage({ searchQuery }: { searchQuery: string | null }) {
  const query = searchQuery || 'Next.js 15';
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey(prevKey => prevKey + 1);
  };

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="font-headline text-3xl font-bold tracking-tighter">
            {searchQuery
              ? `Search results for "${query}"`
              : 'Trending Videos'}
          </h2>
          <Button variant="ghost" size="icon" onClick={handleRefresh}>
              <RefreshCw className="h-6 w-6" />
              <span className="sr-only">Refresh</span>
          </Button>
        </div>
      </div>
      <VideoGrid query={query} refreshKey={refreshKey} />
    </>
  );
}
