
'use client';

import { Header } from '@/components/Header';
import {
  getVideoDetails,
  getRelatedVideos,
  type YouTubeVideo,
} from '@/lib/youtube';
import { notFound, useParams } from 'next/navigation';
import VideoPlayer from '@/components/VideoPlayer';
import { RelatedVideoCard } from '@/components/RelatedVideoCard';
import { format } from 'date-fns';
import { Suspense, useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

function RelatedVideosSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="flex items-start gap-4">
          <Skeleton className="h-20 w-32 shrink-0 rounded-lg" />
          <div className="w-full space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

function RelatedVideos({ videoId }: { videoId: string }) {
  const [relatedVideos, setRelatedVideos] = useState<YouTubeVideo[]>([]);

  useEffect(() => {
    getRelatedVideos(videoId).then(setRelatedVideos);
  }, [videoId]);

  if (!relatedVideos.length) return <RelatedVideosSkeleton />;

  return (
    <div className="space-y-4">
      <h2 className="font-headline text-2xl font-bold tracking-tighter">
        Related Videos
      </h2>
      {relatedVideos.map((video) => (
        <RelatedVideoCard key={video.id} video={video} />
      ))}
    </div>
  );
}

export default function WatchPage() {
  const { id: videoId } = useParams() as { id: string };

  const [video, setVideo] = useState<YouTubeVideo | null>(null);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  useEffect(() => {
    if (videoId) {
      getVideoDetails(videoId).then((videoDetails) => {
        if (!videoDetails) {
          notFound();
          return;
        }
        setVideo(videoDetails);
      });
    }
  }, [videoId]);

  if (!video || !videoId) {
    return (
      <div className="flex min-h-screen w-full flex-col">
        <Header />
        <main className="mx-auto w-full max-w-screen-2xl flex-1 p-4 md:p-6 lg:p-8">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <Skeleton className="aspect-video w-full rounded-xl" />
                    <div className="py-4">
                        <Skeleton className="h-8 w-3/4" />
                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="space-y-2">
                              <Skeleton className="h-4 w-32" />
                              <Skeleton className="h-3 w-24" />
                            </div>
                          </div>
                          <Skeleton className="h-10 w-28 rounded-full" />
                        </div>
                    </div>
                    <Separator className="my-4" />
                    <Skeleton className="h-24 w-full" />
                </div>
                <div className="lg:col-span-1">
                    <RelatedVideosSkeleton />
                </div>
            </div>
        </main>
      </div>
    );
  }
  
  const currentVideoId = Array.isArray(videoId) ? videoId[0] : videoId;

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="mx-auto w-full max-w-screen-2xl flex-1 p-4 md:p-6 lg:p-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <VideoPlayer key={currentVideoId} videoId={currentVideoId} />
            <div className="py-4">
              <h1 className="flex-1 font-headline text-2xl font-bold leading-tight tracking-tighter md:text-3xl">
                {video.title}
              </h1>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={video.channelThumbnail} alt={video.channelTitle} />
                        <AvatarFallback>{video.channelTitle.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h2 className="font-semibold">{video.channelTitle}</h2>
                        {video.subscriberCount && (
                             <p className="text-sm text-muted-foreground">{parseInt(video.subscriberCount).toLocaleString()} subscribers</p>
                        )}
                    </div>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-lg bg-secondary/50 p-4">
              <div className="flex items-center gap-4 font-semibold">
                <p>{video.viewCount ? `${parseInt(video.viewCount).toLocaleString()} views` : ''}</p>
                <p>{format(new Date(video.publishedAt), 'MMM d, yyyy')}</p>
              </div>
              <p className={cn("mt-2 whitespace-pre-wrap text-sm text-foreground/80", !isDescriptionExpanded && "line-clamp-3")}>
                {video.description}
              </p>
               <Button
                variant="link"
                className="px-0 text-sm"
                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
              >
                {isDescriptionExpanded ? 'Show less' : 'Show more'}
              </Button>
            </div>
          </div>
          <div className="lg-col-span-1">
            <Suspense fallback={<RelatedVideosSkeleton />}>
              <RelatedVideos videoId={currentVideoId} />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
}
