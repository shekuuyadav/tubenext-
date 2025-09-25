
import type { YouTubeVideo } from '@/lib/youtube';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from './ui/card';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from './ui/badge';
import { useBlocklist } from '@/hooks/use-blocklist';
import { MoreVertical, ShieldAlert, ShieldX, Ban } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

function formatDuration(seconds: number) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function formatViews(views: string) {
    const number = parseInt(views, 10);
    if (number > 1_000_000_000) {
        return `${(number / 1_000_000_000).toFixed(1)}B views`;
    }
    if (number > 1_000_000) {
        return `${(number / 1_000_000).toFixed(1)}M views`;
    }
    if (number > 1_000) {
        return `${(number / 1_000).toFixed(1)}K views`;
    }
    return `${number} views`;
}


export function VideoCard({ video }: { video: YouTubeVideo }) {
  const { isBlocked, addKeyword } = useBlocklist();
  const blocked = isBlocked(video.title) || isBlocked(video.channelTitle);

  if (blocked) {
    return (
        <Card className="overflow-hidden bg-muted/50">
            <CardContent className="p-0">
                <div className="relative flex aspect-video w-full items-center justify-center bg-muted">
                    <ShieldAlert className="h-10 w-10 text-muted-foreground" />
                </div>
                <div className="p-4">
                    <h3 className="font-headline text-base font-bold tracking-tight text-muted-foreground">
                        Video Blocked
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground/80">
                        This video is hidden due to your blocklist settings.
                    </p>
                </div>
            </CardContent>
        </Card>
    )
  }

  const isLive = video.liveBroadcastContent === 'live';

  return (
    <div className="group flex flex-col space-y-3">
        <Link href={`/watch/${video.id}`} className="block overflow-hidden rounded-xl">
            <div className="relative aspect-video w-full overflow-hidden">
                <Image
                src={video.thumbnail}
                alt={video.title}
                data-ai-hint="video thumbnail"
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute bottom-2 right-2 flex items-center gap-1">
                    {isLive && (
                         <Badge variant="destructive" className="bg-red-600/90 text-white">
                            LIVE
                        </Badge>
                    )}
                    {video.durationSeconds && !isLive && (
                        <Badge variant="secondary" className="bg-black/80 text-white">
                            {formatDuration(video.durationSeconds)}
                        </Badge>
                    )}
                </div>
            </div>
        </Link>
        <div className="flex items-start gap-4">
            <Link href={`https://youtube.com/channel/${video.channelId}`} target="_blank" className="shrink-0">
                <Avatar>
                    <AvatarImage src={video.channelThumbnail} alt={video.channelTitle} />
                    <AvatarFallback>{video.channelTitle.charAt(0)}</AvatarFallback>
                </Avatar>
            </Link>
            <div className="flex-grow">
                <Link href={`/watch/${video.id}`} className="block">
                     <h3 className="line-clamp-2 font-headline text-base font-bold tracking-tight group-hover:text-primary">
                        {video.title}
                    </h3>
                </Link>
                 <p className="mt-1 text-sm text-muted-foreground">
                    {video.channelTitle}
                </p>
                <p className="text-sm text-muted-foreground">
                    {video.viewCount && (
                        <span>{formatViews(video.viewCount)} &middot; </span>
                    )}
                    {isLive ? 'Started streaming recently' : formatDistanceToNow(new Date(video.publishedAt), {
                        addSuffix: true,
                    })}
                </p>
            </div>
        </div>
    </div>
  );
}
