'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getAccountSummary, getProducts, type AccountSummary } from '@/lib/api';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { useRequireAuth } from '@/hooks/useRequireAuth';

export default function AccountDashboardPage() {
  const { token, user, ready } = useRequireAuth('CUSTOMER');
  const [summary, setSummary] = useState<AccountSummary | null>(null);
  const [products, setProducts] = useState<Array<Record<string, unknown>>>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    Promise.all([getAccountSummary(token), getProducts(token)])
      .then(([s, p]) => {
        setSummary(s);
        setProducts(p.slice(0, 6));
      })
      .catch((e) => setError(e.message));
  }, [token]);

  if (!ready) return null;

  return (
    <div>
      <header className="mb-8">
        <p className="text-sm text-[#8a6a1f]">مرحباً</p>
        <h1 className="text-3xl font-semibold">{user?.name || 'لوحة التحكم'}</h1>
        <p className="mt-1 text-[#57534e]">{user?.email}</p>
      </header>

      {error && <p className="mb-4 text-red-700">{error}</p>}

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatCard label="طلباتي" value={summary?._count.orders ?? 0} />
        <StatCard label="عناويني" value={summary?._count.addresses ?? 0} />
        <StatCard label="المفضلة" value={summary?._count.favorites ?? 0} />
      </div>

      <section className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">عقودي الأخيرة</h2>
          <Link href="/account/contracts" className="text-sm text-[#8a6a1f]">
            عرض الكل
          </Link>
        </div>
        <ul className="space-y-2">
          {(summary?.contracts || []).length === 0 && (
            <li className="text-sm text-[#78716c]">لا توجد عقود بعد</li>
          )}
          {(summary?.contracts || []).map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between rounded-xl border border-[#e7e5e4] px-4 py-3"
            >
              <span>{c.title}</span>
              <Badge label={c.status} />
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">منتجات المتجر</h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {products.map((p) => (
            <li key={String(p._id || p.id)} className="rounded-xl border border-[#e7e5e4] px-4 py-3">
              <p className="font-medium">{String(p.name)}</p>
              <p className="text-sm text-[#78716c]">{String(p.list_price)} SAR</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
