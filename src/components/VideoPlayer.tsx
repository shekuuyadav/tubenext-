'use client';

type VideoPlayerProps = {
  videoId: string;
};

export default function VideoPlayer({ videoId }: VideoPlayerProps) {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl shadow-2xl">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?autoplay=0&modestbranding=1&rel=0`}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute left-0 top-0 h-full w-full"
      ></iframe>
    </div>
  );
}
