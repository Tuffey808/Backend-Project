'use client';

import { useEffect, useState } from 'react';
import { getCustomers } from '@/lib/api';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useLocale } from '@/lib/i18n/LocaleProvider';

export default function CustomersPage() {
  const { token, ready } = useRequireAuth('ADMIN');
  const { t } = useLocale();
  const c = t.admin.customers;
  const [customers, setCustomers] = useState<Array<Record<string, unknown>>>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    getCustomers(token)
      .then(setCustomers)
      .catch((e) => setError(e.message));
  }, [token]);

  if (!ready) return null;

  return (
    <div>
      <header className="mb-8">
        <p className="text-sm text-[#8a6a1f]">{c.label}</p>
        <h1 className="text-3xl font-semibold">{c.title}</h1>
        <p className="mt-1 text-[#57534e]">
          {customers.length} {c.count}
        </p>
      </header>

      {error && <p className="mb-4 text-red-700">{error}</p>}

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-[#e7e5e4] bg-[#faf6ef] text-start">
            <tr>
              <th className="px-4 py-3 font-medium">{c.colName}</th>
              <th className="px-4 py-3 font-medium">{c.colEmail}</th>
              <th className="px-4 py-3 font-medium">{c.colPhone}</th>
              <th className="px-4 py-3 font-medium">{c.colCity}</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((row) => (
              <tr key={String(row.id)} className="border-b border-[#f5f5f4]">
                <td className="px-4 py-3 font-medium">{String(row.name)}</td>
                <td className="px-4 py-3">{String(row.email)}</td>
                <td className="px-4 py-3">{String(row.phone || t.admin.common.dash)}</td>
                <td className="px-4 py-3">
                  {row.customer && typeof row.customer === 'object'
                    ? String((row.customer as { city?: string }).city || t.admin.common.dash)
                    : t.admin.common.dash}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
