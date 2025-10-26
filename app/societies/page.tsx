"use client";

// This page is now deprecated - users go directly from /audience to /simulation
// Keeping for backward compatibility but should redirect

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SocietiesPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to simulation (new flow)
    router.push('/simulation');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
        <p className="text-sm text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}
