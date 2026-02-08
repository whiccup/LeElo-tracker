'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

export default function RefreshButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      className="meta-button"
      onClick={() => startTransition(() => router.refresh())}
      disabled={isPending}
      style={{ opacity: isPending ? 0.5 : 1, cursor: isPending ? 'default' : 'pointer' }}
    >
      {isPending ? '[refreshing...]' : '[refresh]'}
    </button>
  );
}
