'use client';

import { useEffect, useState } from 'react';
import {
  getReturns,
  updateReturnStatus,
  type ReturnRequest,
} from '@/lib/api';
import { useRequireAuth } from '@/hooks/useRequireAuth';

export default function VendorReturnsPage() {
  const { token, ready } = useRequireAuth('VENDOR');
  const [rows, setRows] = useState<ReturnRequest[]>([]);
  const [error, setError] = useState('');

  async function refresh(tok: string) {
    setRows(await getReturns(tok));
  }

  useEffect(() => {
    if (!token) return;
    refresh(token).catch((e) => setError(e.message));
  }, [token]);

  if (!ready) return null;

  return (
    <div>
      <header className="mb-8">
        <p className="text-sm text-[#8a6a1f]">الطلبات</p>
        <h1 className="text-3xl font-semibold">طلبات الإرجاع</h1>
      </header>
      {error && <p className="mb-4 text-red-700">{error}</p>}
      <ul className="space-y-3">
        {rows.length === 0 && (
          <li className="rounded-2xl bg-white px-5 py-10 text-center text-[#78716c] shadow-sm">
            لا توجد طلبات إرجاع لمتجرك
          </li>
        )}
        {rows.map((row) => (
          <li key={row.id} className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex flex-wrap justify-between gap-3">
              <div>
                <p className="font-medium">{row.order?.orderNumber}</p>
                <p className="text-sm text-[#57534e]">{row.reason}</p>
                <p className="text-xs text-[#a8a29e]">{row.user?.name}</p>
              </div>
              {token && (
                <select
                  className="rounded-xl border px-3 py-2 text-sm"
                  value={row.status}
                  onChange={async (e) => {
                    await updateReturnStatus(token, row.id, e.target.value);
                    await refresh(token);
                  }}
                >
                  {['REQUESTED', 'APPROVED', 'REJECTED', 'RECEIVED', 'REFUNDED'].map(
                    (s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ),
                  )}
                </select>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
