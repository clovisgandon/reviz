import { Outlet } from 'react-router-dom';
import { TabBar } from '@/components/TabBar';
import { InstallBanner } from '@/components/InstallBanner';
import { UpdateBanner } from '@/components/UpdateBanner';

export function Layout() {
  return (
    <div className="min-h-full pb-[calc(72px+env(safe-area-inset-bottom))]">
      <InstallBanner />
      <Outlet />
      <UpdateBanner />
      <TabBar />
    </div>
  );
}
