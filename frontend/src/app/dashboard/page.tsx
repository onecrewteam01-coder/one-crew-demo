'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import Dashboard from '@/components/dashboard/Dashboard';
import { PageSkeleton } from '@/components/fallback/Skeleton';
import { isProfileSetupComplete } from '@/lib/profile';

export default function DashboardPage() {
  const router = useRouter();
  const [isAgentHubOpen, setIsAgentHubOpen] = React.useState<boolean>(true);
  const [gateStatus, setGateStatus] = React.useState<'checking' | 'allowed'>('checking');

  React.useEffect(() => {
    let active = true;
    isProfileSetupComplete().then((complete) => {
      if (!active) return;
      if (complete) {
        setGateStatus('allowed');
      } else {
        router.replace('/profile-setup');
      }
    });
    return () => {
      active = false;
    };
  }, [router]);

  if (gateStatus !== 'allowed') {
    return (
      <div className="relative bg-black text-slate-100 min-h-screen w-full max-w-full flex flex-col p-6">
        <PageSkeleton cards={3} />
      </div>
    );
  }

  return (
    /* Desktop: h-screen fixed shell. Mobile: allow layout-container to scroll */
    <div className="relative bg-black text-slate-100 h-screen w-full max-w-full flex flex-col overflow-hidden select-none max-[900px]:h-auto max-[900px]:min-h-screen max-[900px]:overflow-x-hidden">

      {/* Header: sticky on mobile so it stays at top while content scrolls */}
      <div className="sticky top-0 z-[200] max-[900px]:z-[200] shrink-0">
        <DashboardHeader isSidebarOpen={isAgentHubOpen} onToggleSidebar={() => setIsAgentHubOpen(!isAgentHubOpen)} />
      </div>

      {/* Content area: flex-grow on desktop (fixed shell), scroll container on mobile */}
      <main className="flex flex-col flex-grow w-full relative min-h-0 overflow-hidden max-[900px]:overflow-visible px-6 pt-0 pb-0 max-[900px]:px-0 max-[900px]:py-0">
        <Dashboard isSidebarOpen={isAgentHubOpen} onToggleSidebar={() => setIsAgentHubOpen(!isAgentHubOpen)} />
      </main>
    </div>
  );
}
