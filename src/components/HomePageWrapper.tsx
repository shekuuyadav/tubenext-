
'use client';

import { useSearchParams } from 'next/navigation';
import { HomePage } from './HomePage';

export function HomePageWrapper() {
  const searchParams = useSearchParams();
  const query = searchParams.get('query');

  return <HomePage searchQuery={query} />;
}
