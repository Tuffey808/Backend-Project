'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  createContract,
  getAdminVendors,
  getCustomers,
  type VendorRow,
} from '@/lib/api';
import { ContractForm } from '@/components/contracts/ContractForm';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useLocale } from '@/lib/i18n/LocaleProvider';

export default function NewContractPage() {
  const router = useRouter();
  const { token, ready } = useRequireAuth('ADMIN');
  const { t } = useLocale();
  const c = t.admin.contracts;
  const [customers, setCustomers] = useState<Array<{ id: string; name: string; email: string }>>(
    [],
  );
  const [vendors, setVendors] = useState<VendorRow[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    Promise.all([getCustomers(token), getAdminVendors(token)])
      .then(([cust, vend]) => {
        setCustomers(
          cust.map((u) => ({
            id: String(u.id),
            name: String(u.name || u.email),
            email: String(u.email),
          })),
        );
        setVendors(vend);
      })
      .catch((e) => setError(e.message));
  }, [token]);

  if (!ready || !token) return null;

  return (
    <div>
      <header className="mb-8">
        <Link href="/admin/contracts" className="text-sm text-[#8a6a1f] hover:underline">
          ← {c.back}
        </Link>
        <h1 className="mt-2 text-3xl font-semibold">{c.newContract}</h1>
      </header>

      {error && <p className="mb-4 text-red-700">{error}</p>}

      <ContractForm
        mode="admin"
        customers={customers}
        vendors={vendors.map((v) => ({ id: v.id, name: v.name, email: v.email }))}
        submitLabel={c.save}
        onSubmit={async (values) => {
          setError('');
          try {
            const created = await createContract(token, values);
            router.push(`/admin/contracts/${created.id}`);
          } catch (e) {
            setError(e instanceof Error ? e.message : t.admin.common.opFailed);
          }
        }}
      />
    </div>
  );
}
