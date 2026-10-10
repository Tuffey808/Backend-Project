'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getProducts } from '@/lib/api';
import { Badge } from '@/components/ui/Badge';
import { useRequireAuth } from '@/hooks/useRequireAuth';

export default function VendorProductsPage() {
  const { token, ready } = useRequireAuth('VENDOR');
  const [products, setProducts] = useState<Array<Record<string, unknown>>>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    getProducts(token)
      .then(setProducts)
      .catch((e) => setError(e.message));
  }, [token]);

  if (!ready) return null;

  return (
    <div>
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-[#8a6a1f]">المنتجات</p>
          <h1 className="text-3xl font-semibold">منتجاتي</h1>
          <p className="mt-1 text-[#57534e]">{products.length} منتج</p>
        </div>
        <Link
          href="/vendor/products/new"
          className="rounded-xl bg-[#8a6a1f] px-4 py-2 text-sm text-white"
        >
          + إضافة منتج
        </Link>
      </header>

      {error && <p className="mb-4 text-red-700">{error}</p>}

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-[#e7e5e4] bg-[#faf6ef] text-start">
            <tr>
              <th className="px-4 py-3 font-medium">المنتج</th>
              <th className="px-4 py-3 font-medium">السعر</th>
              <th className="px-4 py-3 font-medium">الكمية</th>
              <th className="px-4 py-3 font-medium">التصنيف</th>
              <th className="px-4 py-3 font-medium">الحالة</th>
              <th className="px-4 py-3 font-medium"> </th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[#78716c]">
                  لا توجد منتجات —{' '}
                  <Link href="/vendor/products/new" className="text-[#8a6a1f]">
                    أضف أول منتج
                  </Link>
                </td>
              </tr>
            )}
            {products.map((p) => (
              <tr key={String(p._id || p.id)} className="border-b border-[#f5f5f4]">
                <td className="px-4 py-3">
                  <div className="font-medium">{String(p.name)}</div>
                  {p.name_ar != null && p.name_ar !== false && (
                    <div className="text-xs text-[#78716c]" dir="rtl">
                      {String(p.name_ar)}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 tabular-nums">{String(p.list_price)} SAR</td>
                <td className="px-4 py-3 tabular-nums">{String(p.qty_available)}</td>
                <td className="px-4 py-3">
                  {p.categ_id && typeof p.categ_id === 'object'
                    ? String((p.categ_id as { name?: string }).name || '—')
                    : '—'}
                </td>
                <td className="px-4 py-3">
                  <Badge label={String(p.status || 'DRAFT')} />
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/vendor/products/${String(p._id || p.id)}/edit`}
                    className="text-sm text-[#8a6a1f] underline"
                  >
                    تعديل
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
