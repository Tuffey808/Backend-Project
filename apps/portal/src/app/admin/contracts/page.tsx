'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getContracts, type Contract } from '@/lib/api';
import { Badge } from '@/components/ui/Badge';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useLocale } from '@/lib/i18n/LocaleProvider';

export default function ContractsPage() {
  const { token, ready } = useRequireAuth('ADMIN');
  const { t } = useLocale();
  const c = t.admin.contracts;
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
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-[#8a6a1f]">{c.label}</p>
          <h1 className="text-3xl font-semibold">{c.title}</h1>
          <p className="mt-1 text-[#57534e]">{c.subtitle}</p>
        </div>
        <Link
          href="/admin/contracts/new"
          className="rounded-xl bg-[#8a6a1f] px-4 py-2.5 text-sm text-white hover:bg-[#735818]"
        >
          {c.newContract}
        </Link>
      </header>

      {error && <p className="mb-4 text-red-700">{error}</p>}

      <div className="space-y-3">
        {contracts.length === 0 && (
          <div className="rounded-2xl bg-white px-6 py-10 text-center text-[#78716c] shadow-sm">
            {c.empty}
          </div>
        )}
        {contracts.map((item) => (
          <div
            key={item.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white px-5 py-4 shadow-sm"
          >
            <div>
              <p className="font-medium">{item.title}</p>
              <p className="text-sm text-[#78716c]">
                {item.customer?.name || c.noCustomer}
                {item.customer?.email ? ` · ${item.customer.email}` : ''}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge label={c.statuses[item.status as keyof typeof c.statuses] || item.status} />
              <Link
                href={`/admin/contracts/${item.id}`}
                className="rounded-lg border border-[#d6d3d1] px-3 py-1.5 text-sm hover:bg-[#faf6ef]"
              >
                {c.view}
              </Link>
              <Link
                href={`/admin/contracts/${item.id}/edit`}
                className="rounded-lg border border-[#d6d3d1] px-3 py-1.5 text-sm hover:bg-[#faf6ef]"
              >
                {c.edit}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
