'use client';

import { useEffect, useState } from 'react';
import { getVendorEarnings } from '@/lib/api';
import { useRequireAuth } from '@/hooks/useRequireAuth';

export default function VendorEarningsPage() {
  const { token, ready } = useRequireAuth('VENDOR');
  const [data, setData] = useState<Awaited<
    ReturnType<typeof getVendorEarnings>
  > | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    getVendorEarnings(token)
      .then(setData)
      .catch((e) => setError(e.message));
  }, [token]);

  if (!ready) return null;

  return (
    <div>
      <header className="mb-8">
        <p className="text-sm text-[#8a6a1f]">المالية</p>
        <h1 className="text-3xl font-semibold">أرباحي</h1>
      </header>

      {error && <p className="mb-4 text-red-700">{error}</p>}

      {data && (
        <>
          <div className="mb-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <p className="text-xs text-[#78716c]">إجمالي الأرباح</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">
                {data.totalEarned} SAR
              </p>
            </div>
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <p className="text-xs text-[#78716c]">عمولة المنصة</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">
                {data.totalCommission} SAR
              </p>
            </div>
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <p className="text-xs text-[#78716c]">بانتظار التسوية</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">
                {data.pendingPayout} SAR
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-white shadow-sm">
            <div className="border-b border-[#e7e5e4] px-5 py-4 font-semibold">
              سجل الطلبات
            </div>
            <ul className="divide-y divide-[#f5f5f4]">
              {data.entries.length === 0 && (
                <li className="px-5 py-8 text-center text-[#78716c]">
                  لا توجد أرباح بعد — تظهر بعد دفع الطلبات
                </li>
              )}
              {data.entries.map((entry) => {
                const order = entry.order as {
                  orderNumber?: string;
                  numericId?: number;
                } | null;
                return (
                  <li
                    key={String(entry.id)}
                    className="flex justify-between gap-3 px-5 py-3 text-sm"
                  >
                    <span>
                      {order?.orderNumber || `#${order?.numericId}`} ·{' '}
                      {entry.payoutId ? 'مربوط بتسوية' : 'معلّق'}
                    </span>
                    <span className="tabular-nums">
                      {String(entry.amount)} SAR
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
