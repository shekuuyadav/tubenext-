
import type { YouTubeVideo } from '@/lib/youtube';
import Image from 'next/image';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { useBlocklist } from '@/hooks/use-blocklist';
import { MoreVertical, ShieldAlert, Ban, ShieldX } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from './ui/dropdown-menu';

function formatViews(views: string) {
    const number = parseInt(views, 10);
    if (number > 1_000_000_000) {
        return `${(number / 1_000_000_000).toFixed(1)}B`;
    }
    if (number > 1_000_000) {
        return `${(number / 1_000_000).toFixed(1)}M`;
    }
    if (number > 1_000) {
        return `${(number / 1_000).toFixed(1)}K`;
    }
    return `${number}`;
}

export function RelatedVideoCard({ video }: { video: YouTubeVideo }) {
  const { isBlocked, addKeyword } = useBlocklist();
  const blocked = isBlocked(video.title) || isBlocked(video.channelTitle);

  if (blocked) {
    return (
      <div className="flex items-center gap-4 rounded-lg bg-muted/50 p-2">
        <div className="flex h-24 w-48 shrink-0 items-center justify-center rounded-lg bg-muted">
          <ShieldAlert className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="flex-grow">
          <h3 className="font-semibold text-sm text-muted-foreground">
            Video Blocked
          </h3>
          <p className="text-xs text-muted-foreground/80">
            This video is hidden based on your blocklist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="group flex items-start gap-4">
      <Link href={`/watch/${video.id}`} className="block shrink-0">
        <div className="relative aspect-video w-48 shrink-0 overflow-hidden rounded-lg">
          <Image
            src={video.thumbnail}
            alt={video.title}
            data-ai-hint="video thumbnail"
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      </Link>
      <div className="flex-grow">
        <Link href={`/watch/${video.id}`} className="block">
            <h3 className="line-clamp-2 font-semibold leading-tight text-sm group-hover:text-primary">
            {video.title}
            </h3>
        </Link>
        <p className="mt-1 text-xs text-muted-foreground">
          {video.channelTitle}
        </p>
        <p className="text-xs text-muted-foreground">
            {video.viewCount && (
                <span>{formatViews(video.viewCount)} views &middot; </span>
            )}
            {formatDistanceToNow(new Date(video.publishedAt), { addSuffix: true })}
        </p>
      </div>
    </div>
  );
}
