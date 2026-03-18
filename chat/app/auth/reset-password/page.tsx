'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ResetPassword from '@/components/reset-password/reset-password';
import { getAuth } from '@/components/auth';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const token = auth.getToken();

    if (token) {
      // Already authenticated, redirect to chat
      router.push('/chat');
    } else {
      // Not authenticated, show reset password page
      setIsChecking(false);
    }
  }, [router]);

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <p className="text-zinc-600 dark:text-zinc-400">Loading...</p>
      </div>
    );
  }

  return <ResetPassword />;
}
