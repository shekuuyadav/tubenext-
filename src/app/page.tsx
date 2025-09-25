import { HomePageWrapper } from '@/components/HomePageWrapper';
import { Suspense } from 'react';
import { Header } from '@/components/Header';
import { VideoGridSkeleton } from '@/components/HomePage';

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Suspense fallback={<VideoGridSkeleton />}>
        <Header />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-screen-2xl">
            <HomePageWrapper />
          </div>
        </main>
      </Suspense>
    </div>
  );
}
