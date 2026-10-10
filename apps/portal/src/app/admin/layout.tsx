'use client';

import { AdminShell } from '@/components/layout/AdminShell';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useLocale } from '@/lib/i18n/LocaleProvider';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, ready } = useRequireAuth('ADMIN');
  const { t } = useLocale();

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center text-[#78716c]">
        {t.admin.shell.loading}
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <AdminShell user={user}>{children}</AdminShell>;
}
