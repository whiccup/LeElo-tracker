'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

export default function RefreshButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => router.refresh())}
      disabled={isPending}
      style={{
        background: 'none',
        border: 'none',
        color: 'var(--accent-blue)',
        cursor: isPending ? 'default' : 'pointer',
        fontSize: 'var(--text-xs)',
        fontFamily: 'Arial, Helvetica, sans-serif',
        textDecoration: 'underline',
        padding: 0,
        marginLeft: '6px',
        opacity: isPending ? 0.5 : 1,
      }}
    >
      {isPending ? '[refreshing...]' : '[refresh]'}
    </button>
  );
}
