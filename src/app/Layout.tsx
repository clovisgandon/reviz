import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { TabBar } from '@/components/TabBar';
import { InstallBanner } from '@/components/InstallBanner';

export function Layout() {
  return (
    <div className="min-h-full pb-[calc(72px+env(safe-area-inset-bottom))]">
      <InstallBanner />
      <Suspense fallback={<div className="min-h-[50vh]" aria-busy="true" />}>
        <Outlet />
      </Suspense>
      <TabBar />
    </div>
  );
}
