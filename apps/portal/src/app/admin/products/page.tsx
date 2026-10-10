'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getProducts } from '@/lib/api';
import { Badge } from '@/components/ui/Badge';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useLocale } from '@/lib/i18n/LocaleProvider';

export default function AdminProductsPage() {
  const { token, ready } = useRequireAuth('ADMIN');
  const { t } = useLocale();
  const p = t.admin.products;
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
          <p className="text-sm text-[#8a6a1f]">{p.label}</p>
          <h1 className="text-3xl font-semibold">{p.title}</h1>
          <p className="mt-1 text-[#57534e]">
            {products.length} {p.count}
          </p>
        </div>
        <Link href="/admin/products/new" className="rounded-xl bg-[#8a6a1f] px-4 py-2 text-sm text-white">
          {p.add}
        </Link>
      </header>

      {error && <p className="mb-4 text-red-700">{error}</p>}

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-[#e7e5e4] bg-[#faf6ef] text-start">
            <tr>
              <th className="px-4 py-3 font-medium">{p.colProduct}</th>
              <th className="px-4 py-3 font-medium">{p.colPrice}</th>
              <th className="px-4 py-3 font-medium">{p.colQty}</th>
              <th className="px-4 py-3 font-medium">{p.colCategory}</th>
              <th className="px-4 py-3 font-medium">{p.colStatus}</th>
              <th className="px-4 py-3 font-medium"> </th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[#78716c]">
                  {p.empty}
                </td>
              </tr>
            )}
            {products.map((item) => (
              <tr key={String(item._id || item.id)} className="border-b border-[#f5f5f4]">
                <td className="px-4 py-3">
                  <div className="font-medium">{String(item.name)}</div>
                  {item.name_ar != null && item.name_ar !== false && (
                    <div className="text-xs text-[#78716c]" dir="rtl">
                      {String(item.name_ar)}
                    </div>
                  )}
                  {item.vendor && typeof item.vendor === 'object' ? (
                    <div className="text-xs text-[#8a6a1f]">
                      {String((item.vendor as { name?: string }).name || '')}
                    </div>
                  ) : null}
                </td>
                <td className="px-4 py-3 tabular-nums">{String(item.list_price)} SAR</td>
                <td className="px-4 py-3 tabular-nums">{String(item.qty_available)}</td>
                <td className="px-4 py-3">
                  {item.categ_id && typeof item.categ_id === 'object'
                    ? String((item.categ_id as { name?: string }).name || t.admin.common.dash)
                    : t.admin.common.dash}
                </td>
                <td className="px-4 py-3">
                  <Badge label={String(item.status || 'DRAFT')} />
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/products/${String(item._id || item.id)}/edit`}
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
