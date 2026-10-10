'use client';

import { FormEvent, useEffect, useState } from 'react';
import {
  getAdminVendors,
  setVendorActive,
  setVendorCommission,
  type VendorRow,
} from '@/lib/api';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useLocale } from '@/lib/i18n/LocaleProvider';

export default function VendorsPage() {
  const { token, ready } = useRequireAuth('ADMIN');
  const { t, locale } = useLocale();
  const v = t.admin.vendors;
  const [vendors, setVendors] = useState<VendorRow[]>([]);
  const [error, setError] = useState('');
  const dateLocale = locale === 'ar' ? 'ar-SA' : 'en-US';

  async function refresh(tok: string) {
    setVendors(await getAdminVendors(tok));
  }

  useEffect(() => {
    if (!token) return;
    refresh(token).catch((e) => setError(e.message));
  }, [token]);

  if (!ready) return null;

  return (
    <div>
      <header className="mb-8">
        <p className="text-sm text-[#8a6a1f]">{v.label}</p>
        <h1 className="text-3xl font-semibold">{v.title}</h1>
        <p className="mt-1 text-[#57534e]">
          {vendors.length} {v.count}
        </p>
      </header>

      {error && <p className="mb-4 text-red-700">{error}</p>}

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-[#e7e5e4] bg-[#faf6ef] text-start">
            <tr>
              <th className="px-4 py-3 font-medium">{v.colVendor}</th>
              <th className="px-4 py-3 font-medium">المتجر</th>
              <th className="px-4 py-3 font-medium">{v.colEmail}</th>
              <th className="px-4 py-3 font-medium">{v.colProducts}</th>
              <th className="px-4 py-3 font-medium">العمولة %</th>
              <th className="px-4 py-3 font-medium">الحالة</th>
              <th className="px-4 py-3 font-medium">{v.colRegistered}</th>
              <th className="px-4 py-3 font-medium"> </th>
            </tr>
          </thead>
          <tbody>
            {vendors.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-[#78716c]">
                  {v.empty}
                </td>
              </tr>
            )}
            {vendors.map((row) => (
              <tr key={row.id} className="border-b border-[#f5f5f4]">
                <td className="px-4 py-3 font-medium">{row.name}</td>
                <td className="px-4 py-3">
                  <div>{row.vendorProfile?.storeName || '—'}</div>
                  {row.vendorProfile?.slug && (
                    <div className="text-xs text-[#78716c]">/{row.vendorProfile.slug}</div>
                  )}
                </td>
                <td className="px-4 py-3">{row.email}</td>
                <td className="px-4 py-3 tabular-nums">{row._count.products}</td>
                <td className="px-4 py-3">
                  <form
                    className="flex items-center gap-1"
                    onSubmit={async (e: FormEvent<HTMLFormElement>) => {
                      e.preventDefault();
                      if (!token) return;
                      const form = new FormData(e.currentTarget);
                      await setVendorCommission(
                        token,
                        row.id,
                        Number(form.get('commission')),
                      );
                      await refresh(token);
                    }}
                  >
                    <input
                      name="commission"
                      type="number"
                      min={0}
                      max={100}
                      step="0.1"
                      defaultValue={
                        row.vendorProfile?.commissionPercent != null
                          ? Number(row.vendorProfile.commissionPercent)
                          : ''
                      }
                      placeholder="افتراضي"
                      className="w-20 rounded-lg border px-2 py-1"
                    />
                    <button type="submit" className="text-xs text-[#8a6a1f]">
                      حفظ
                    </button>
                  </form>
                </td>
                <td className="px-4 py-3">
                  {row.active ? 'نشط' : 'موقوف'}
                </td>
                <td className="px-4 py-3 text-[#78716c]">
                  {new Date(row.createdAt).toLocaleDateString(dateLocale)}
                </td>
                <td className="px-4 py-3">
                  {token && (
                    <button
                      type="button"
                      className="text-sm text-[#8a6a1f] underline"
                      onClick={async () => {
                        await setVendorActive(token, row.id, !row.active);
                        await refresh(token);
                      }}
                    >
                      {row.active ? 'إيقاف' : 'تفعيل'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
