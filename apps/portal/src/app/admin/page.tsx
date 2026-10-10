'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getAdminStats, type AdminStats } from '@/lib/api';
import { StatCard } from '@/components/ui/StatCard';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useLocale } from '@/lib/i18n/LocaleProvider';

export default function AdminDashboardPage() {
  const { token, ready } = useRequireAuth('ADMIN');
  const { t } = useLocale();
  const a = t.admin.dashboard;
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    getAdminStats(token)
      .then(setStats)
      .catch((e) => setError(e.message));
  }, [token]);

  if (!ready) return null;

  return (
    <div>
      <header className="mb-8">
        <p className="text-sm text-[#8a6a1f]">{a.home}</p>
        <h1 className="text-3xl font-semibold">{a.title}</h1>
        <p className="mt-1 text-[#57534e]">{a.subtitle}</p>
      </header>

      {error && <p className="mb-4 text-red-700">{error}</p>}

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label={a.orders} value={stats?.orders ?? '—'} />
        <StatCard label={a.pendingProducts} value={stats?.pendingProducts ?? '—'} hint={a.pendingHint} />
        <StatCard label={a.publishedProducts} value={stats?.publishedProducts ?? '—'} />
        <StatCard label={a.vendors} value={stats?.vendors ?? '—'} />
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label={a.customers} value={stats?.customers ?? '—'} />
        <StatCard label={a.contracts} value={stats?.contracts ?? '—'} />
        <StatCard label={a.totalProducts} value={stats?.products ?? '—'} />
      </div>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">{a.quickActions}</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/products/new" className="rounded-xl bg-[#8a6a1f] px-4 py-2 text-sm text-white">
            {a.addProduct}
          </Link>
          <Link href="/admin/approvals" className="rounded-xl border border-[#d6d3d1] px-4 py-2 text-sm hover:bg-[#faf6ef]">
            {a.reviewProducts} ({stats?.pendingProducts ?? 0})
          </Link>
          <Link href="/admin/vendor-applications" className="rounded-xl border border-[#d6d3d1] px-4 py-2 text-sm hover:bg-[#faf6ef]">
            {a.vendorApplications} ({stats?.vendorApplications ?? 0})
          </Link>
          <Link href="/admin/contracts" className="rounded-xl border border-[#d6d3d1] px-4 py-2 text-sm hover:bg-[#faf6ef]">
            {a.manageContracts}
          </Link>
          <Link href="/admin/orders" className="rounded-xl border border-[#d6d3d1] px-4 py-2 text-sm hover:bg-[#faf6ef]">
            {a.trackOrders}
          </Link>
        </div>
      </section>
    </div>
  );
}
