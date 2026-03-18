'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth } from '@/components/auth';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth();
    const token = auth.getToken();

    if (!token) {
      router.push('/auth/login');
    } else {
      // Redirect to chat/dashboard page when implemented
      router.push('/chat');
    }
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="text-center">
        <p className="text-zinc-600 dark:text-zinc-400">Redirecting...</p>
      </main>
    </div>
  );
}
