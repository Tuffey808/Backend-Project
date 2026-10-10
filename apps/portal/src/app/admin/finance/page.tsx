'use client';

import { FormEvent, useEffect, useState } from 'react';
import {
  createVendorPayout,
  getAdminPayouts,
  getAdminVendors,
  getFinanceOverview,
  updateCommissionSettings,
  updatePayoutStatus,
  type VendorRow,
} from '@/lib/api';
import { useRequireAuth } from '@/hooks/useRequireAuth';

export default function AdminFinancePage() {
  const { token, ready } = useRequireAuth('ADMIN');
  const [overview, setOverview] = useState<Awaited<
    ReturnType<typeof getFinanceOverview>
  > | null>(null);
  const [payouts, setPayouts] = useState<Array<Record<string, unknown>>>([]);
  const [vendors, setVendors] = useState<VendorRow[]>([]);
  const [error, setError] = useState('');
  const [commission, setCommission] = useState('10');

  async function refresh(tok: string) {
    const [ov, po, ve] = await Promise.all([
      getFinanceOverview(tok),
      getAdminPayouts(tok),
      getAdminVendors(tok),
    ]);
    setOverview(ov);
    setPayouts(po);
    setVendors(ve);
    setCommission(String(ov.settings.defaultCommissionPercent));
  }

  useEffect(() => {
    if (!token) return;
    refresh(token).catch((e) => setError(e.message));
  }, [token]);

  if (!ready) return null;

  return (
    <div>
      <header className="mb-8">
        <p className="text-sm text-[#8a6a1f]">المالية</p>
        <h1 className="text-3xl font-semibold">العمولات والتسويات</h1>
      </header>

      {error && <p className="mb-4 text-red-700">{error}</p>}

      {overview && (
        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-xs text-[#78716c]">GMV</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">
              {overview.gmv} SAR
            </p>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-xs text-[#78716c]">عمولة المنصة</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">
              {overview.totalCommission} SAR
            </p>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-xs text-[#78716c]">أرباح البائعين</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">
              {overview.totalVendorEarnings} SAR
            </p>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-xs text-[#78716c]">الطلبات</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">
              {overview.orderCount}
            </p>
          </div>
        </div>
      )}

      <form
        className="mb-8 flex flex-wrap items-end gap-3 rounded-2xl bg-white p-5 shadow-sm"
        onSubmit={async (e: FormEvent) => {
          e.preventDefault();
          if (!token) return;
          await updateCommissionSettings(token, Number(commission));
          await refresh(token);
        }}
      >
        <label className="text-sm">
          عمولة المنصة الافتراضية %
          <input
            value={commission}
            onChange={(e) => setCommission(e.target.value)}
            type="number"
            min={0}
            max={100}
            step="0.1"
            className="mt-1 block w-40 rounded-xl border px-3 py-2"
          />
        </label>
        <button type="submit" className="rounded-xl bg-[#8a6a1f] px-4 py-2 text-white">
          حفظ
        </button>
      </form>

      <form
        className="mb-8 grid gap-3 rounded-2xl bg-white p-5 shadow-sm md:grid-cols-3"
        onSubmit={async (e: FormEvent<HTMLFormElement>) => {
          e.preventDefault();
          if (!token) return;
          const form = new FormData(e.currentTarget);
          await createVendorPayout(
            token,
            String(form.get('vendorId')),
            String(form.get('note') || '') || undefined,
          );
          e.currentTarget.reset();
          await refresh(token);
        }}
      >
        <select name="vendorId" required className="rounded-xl border px-3 py-2">
          <option value="">اختر بائعاً لإنشاء تسوية</option>
          {vendors.map((v) => (
            <option key={v.id} value={v.id}>
              {v.vendorProfile?.storeName || v.name} ({v.email})
            </option>
          ))}
        </select>
        <input name="note" placeholder="ملاحظة" className="rounded-xl border px-3 py-2" />
        <button type="submit" className="rounded-xl bg-[#8a6a1f] px-4 py-2 text-white">
          إنشاء تسوية من الأرباح المعلّقة
        </button>
      </form>

      <div className="rounded-2xl bg-white shadow-sm">
        <div className="border-b border-[#e7e5e4] px-5 py-4 font-semibold">
          التسويات
        </div>
        <ul className="divide-y divide-[#f5f5f4]">
          {payouts.length === 0 && (
            <li className="px-5 py-8 text-center text-[#78716c]">لا توجد تسويات بعد</li>
          )}
          {payouts.map((p) => {
            const vendor = p.vendor as {
              name?: string;
              vendorProfile?: { storeName?: string };
            } | null;
            return (
              <li
                key={String(p.id)}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 text-sm"
              >
                <div>
                  <p className="font-medium">
                    {vendor?.vendorProfile?.storeName || vendor?.name || '—'}
                  </p>
                  <p className="text-[#78716c]">
                    {String(p.amount)} SAR · {String(p.status)}
                  </p>
                </div>
                <div className="flex gap-2">
                  {String(p.status) === 'PENDING' && token && (
                    <>
                      <button
                        type="button"
                        className="rounded-lg border px-3 py-1"
                        onClick={async () => {
                          await updatePayoutStatus(token, String(p.id), 'APPROVED');
                          await refresh(token);
                        }}
                      >
                        موافقة
                      </button>
                      <button
                        type="button"
                        className="rounded-lg bg-[#8a6a1f] px-3 py-1 text-white"
                        onClick={async () => {
                          await updatePayoutStatus(token, String(p.id), 'PAID');
                          await refresh(token);
                        }}
                      >
                        تم الدفع
                      </button>
                    </>
                  )}
                  {String(p.status) === 'APPROVED' && token && (
                    <button
                      type="button"
                      className="rounded-lg bg-[#8a6a1f] px-3 py-1 text-white"
                      onClick={async () => {
                        await updatePayoutStatus(token, String(p.id), 'PAID');
                        await refresh(token);
                      }}
                    >
                      تم الدفع
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
