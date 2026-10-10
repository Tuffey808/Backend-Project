'use client';

import { FormEvent, useEffect, useState } from 'react';
import {
  getDisputes,
  resolveDispute,
  type DisputeRow,
} from '@/lib/api';
import { useRequireAuth } from '@/hooks/useRequireAuth';

export default function AdminDisputesPage() {
  const { token, ready } = useRequireAuth('ADMIN');
  const [rows, setRows] = useState<DisputeRow[]>([]);
  const [error, setError] = useState('');

  async function refresh(tok: string) {
    setRows(await getDisputes(tok));
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
        <h1 className="text-3xl font-semibold">النزاعات والشكاوى</h1>
        <p className="mt-1 text-[#57534e]">{rows.length} نزاع</p>
      </header>

      {error && <p className="mb-4 text-red-700">{error}</p>}

      <ul className="space-y-4">
        {rows.length === 0 && (
          <li className="rounded-2xl bg-white px-5 py-10 text-center text-[#78716c] shadow-sm">
            لا توجد نزاعات مفتوحة
          </li>
        )}
        {rows.map((row) => (
          <li key={row.id} className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex flex-wrap justify-between gap-2">
              <div>
                <p className="font-medium">{row.subject}</p>
                <p className="mt-1 text-sm text-[#57534e]">{row.description}</p>
                <p className="mt-2 text-xs text-[#a8a29e]">
                  من: {row.openedBy?.name || row.openedBy?.email} · طلب:{' '}
                  {row.order?.orderNumber || '—'} · بائع: {row.vendor?.name || '—'}
                </p>
                <p className="mt-1 text-sm">الحالة: {row.status}</p>
                {row.resolution && (
                  <p className="mt-1 text-sm text-green-800">الحل: {row.resolution}</p>
                )}
              </div>
            </div>
            {token && row.status !== 'RESOLVED' && row.status !== 'CLOSED' && (
              <form
                className="mt-4 grid gap-2 border-t border-[#f5f5f4] pt-4 md:grid-cols-3"
                onSubmit={async (e: FormEvent<HTMLFormElement>) => {
                  e.preventDefault();
                  const form = new FormData(e.currentTarget);
                  await resolveDispute(
                    token,
                    row.id,
                    String(form.get('status')),
                    String(form.get('resolution') || '') || undefined,
                  );
                  await refresh(token);
                }}
              >
                <select name="status" defaultValue="RESOLVED" className="rounded-xl border px-3 py-2">
                  <option value="IN_REVIEW">IN_REVIEW</option>
                  <option value="RESOLVED">RESOLVED</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
                <input
                  name="resolution"
                  placeholder="ملاحظات الحل"
                  className="rounded-xl border px-3 py-2 md:col-span-1"
                />
                <button type="submit" className="rounded-xl bg-[#8a6a1f] px-4 py-2 text-white">
                  تحديث
                </button>
              </form>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
