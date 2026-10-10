'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getProducts } from '@/lib/api';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { useRequireAuth } from '@/hooks/useRequireAuth';

function countByStatus(products: Array<Record<string, unknown>>, status: string) {
  return products.filter((p) => String(p.status || '').toUpperCase() === status).length;
}

export default function VendorDashboardPage() {
  const { token, user, ready } = useRequireAuth('VENDOR');
  const [products, setProducts] = useState<Array<Record<string, unknown>>>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    getProducts(token)
      .then(setProducts)
      .catch((e) => setError(e.message));
  }, [token]);

  if (!ready) return null;

  const pending = countByStatus(products, 'PENDING');
  const published = countByStatus(products, 'PUBLISHED');
  const rejected = countByStatus(products, 'REJECTED');

  return (
    <div>
      <header className="mb-8">
        <p className="text-sm text-[#8a6a1f]">مرحباً</p>
        <h1 className="text-3xl font-semibold">{user?.name || 'لوحة المورد'}</h1>
        <p className="mt-1 text-[#57534e]">إدارة منتجاتك ومتابعة حالة الموافقة</p>
      </header>

      {error && <p className="mb-4 text-red-700">{error}</p>}

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="إجمالي المنتجات" value={products.length} />
        <StatCard label="قيد المراجعة" value={pending} hint="بانتظار موافقة الإدارة" />
        <StatCard label="منشورة" value={published} />
        <StatCard label="مرفوضة" value={rejected} />
      </div>

      <section className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-950">
        <strong>سير العمل:</strong> أضف المنتج → يُرسل للمراجعة → الإدارة توافق (نشر) أو ترفض
        → يمكنك تعديل المنتج وإعادة الإرسال.
      </section>

      <section className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">آخر المنتجات</h2>
          <Link
            href="/vendor/products/new"
            className="rounded-xl bg-[#8a6a1f] px-4 py-2 text-sm text-white"
          >
            + إضافة منتج
          </Link>
        </div>
        <ul className="space-y-2">
          {products.length === 0 && (
            <li className="text-sm text-[#78716c]">لم تضف منتجات بعد</li>
          )}
          {products.slice(0, 5).map((p) => (
            <li
              key={String(p._id || p.id)}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#e7e5e4] px-4 py-3"
            >
              <div>
                <p className="font-medium">{String(p.name)}</p>
                <p className="text-sm text-[#78716c]">{String(p.list_price)} SAR</p>
              </div>
              <Badge label={String(p.status || 'DRAFT')} />
            </li>
          ))}
        </ul>
        {products.length > 5 && (
          <Link href="/vendor/products" className="mt-4 inline-block text-sm text-[#8a6a1f]">
            عرض كل المنتجات
          </Link>
        )}
      </section>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/vendor/products"
          className="rounded-xl border border-[#d6d3d1] px-4 py-2 text-sm hover:bg-[#faf6ef]"
        >
          منتجاتي
        </Link>
        <Link
          href="/vendor/products/new"
          className="rounded-xl border border-[#d6d3d1] px-4 py-2 text-sm hover:bg-[#faf6ef]"
        >
          إرسال منتج جديد
        </Link>
      </div>
    </div>
  );
}
