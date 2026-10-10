'use client';

import { CustomerShell } from '@/components/layout/CustomerShell';
import { useRequireAuth } from '@/hooks/useRequireAuth';

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const { user, ready } = useRequireAuth('CUSTOMER');

  if (!ready || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-[#78716c]">
        جاري التحميل…
      </div>
    );
  }

  return <CustomerShell user={user}>{children}</CustomerShell>;
}
