'use client';

import { useEffect, useState } from 'react';
import {
  getReturns,
  updateReturnStatus,
  type ReturnRequest,
} from '@/lib/api';
import { useRequireAuth } from '@/hooks/useRequireAuth';

const STATUSES = [
  'REQUESTED',
  'APPROVED',
  'REJECTED',
  'RECEIVED',
  'REFUNDED',
  'CANCELLED',
] as const;

export default function AdminReturnsPage() {
  const { token, ready } = useRequireAuth('ADMIN');
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
        <p className="text-sm text-[#8a6a1f]">العمليات</p>
        <h1 className="text-3xl font-semibold">طلبات الإرجاع</h1>
        <p className="mt-1 text-[#57534e]">{rows.length} طلب</p>
      </header>

      {error && <p className="mb-4 text-red-700">{error}</p>}

      <ul className="space-y-3">
        {rows.length === 0 && (
          <li className="rounded-2xl bg-white px-5 py-10 text-center text-[#78716c] shadow-sm">
            لا توجد طلبات إرجاع
          </li>
        )}
        {rows.map((row) => (
          <li key={row.id} className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium">
                  {row.order?.orderNumber || '—'} · {row.user?.name || row.user?.email}
                </p>
                <p className="mt-1 text-sm text-[#57534e]">{row.reason}</p>
                <p className="mt-1 text-xs text-[#a8a29e]">
                  بائع: {row.vendor?.name || '—'} · {new Date(row.createdAt).toLocaleString('ar-SA')}
                </p>
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
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
