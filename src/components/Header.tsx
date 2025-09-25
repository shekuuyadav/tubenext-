
'use client';

import Link from 'next/link';
import { ArrowLeft, PlayCircle } from 'lucide-react';
import { SearchBar } from './SearchBar';
import { Button } from './ui/button';
import { usePathname, useRouter } from 'next/navigation';

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const showBackButton = pathname.startsWith('/watch/');

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex items-center">
          {showBackButton && (
            <Button
              variant="ghost"
              size="icon"
              className="mr-2 h-8 w-8"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back</span>
            </Button>
          )}
          <Link href="/" className="flex items-center gap-2">
            <PlayCircle className="h-7 w-7 text-primary" />
            <span className="hidden font-headline text-xl font-bold sm:inline-block">
              TubeNext
            </span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center px-4 sm:px-8">
            <div className="w-full max-w-lg">
                <SearchBar />
            </div>
        </div>
        <div className="flex items-center justify-end gap-2">
           {/* Placeholder for potential future buttons */}
        </div>
      </div>
    </header>
  );
}
