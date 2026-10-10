'use client';

import { VendorShell } from '@/components/layout/VendorShell';
import { useRequireAuth } from '@/hooks/useRequireAuth';

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  const { user, ready } = useRequireAuth('VENDOR');

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center text-[#78716c]">
        جاري التحميل…
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <VendorShell user={user}>{children}</VendorShell>;
}
