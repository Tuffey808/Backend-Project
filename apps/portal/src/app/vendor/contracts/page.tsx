'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getContracts, type Contract } from '@/lib/api';
import { Badge } from '@/components/ui/Badge';
import { useRequireAuth } from '@/hooks/useRequireAuth';

export default function VendorContractsPage() {
  const { token, ready } = useRequireAuth('VENDOR');
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    getContracts(token)
      .then(setContracts)
      .catch((e) => setError(e.message));
  }, [token]);

  if (!ready) return null;

  return (
    <div>
      <header className="mb-8">
        <p className="text-sm text-[#8a6a1f]">العقود</p>
        <h1 className="text-3xl font-semibold">عقودي</h1>
        <p className="mt-1 text-[#57534e]">{contracts.length} عقد</p>
      </header>

      {error && <p className="mb-4 text-red-700">{error}</p>}

      <ul className="space-y-3">
        {contracts.length === 0 && (
          <li className="rounded-2xl bg-white px-5 py-10 text-center text-[#78716c] shadow-sm">
            لا توجد عقود مرتبطة بحسابك
          </li>
        )}
        {contracts.map((c) => (
          <li
            key={c.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white px-5 py-4 shadow-sm"
          >
            <div>
              <p className="font-medium">{c.titleAr || c.title}</p>
              <p className="text-sm text-[#78716c]">
                {c.customer?.name || c.customer?.email || '—'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge label={c.status} />
              <Link href={`/vendor/contracts/${c.id}`} className="text-sm text-[#8a6a1f]">
                عرض
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
