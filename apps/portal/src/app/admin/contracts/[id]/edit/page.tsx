'use client';

import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  deleteContract,
  getAdminVendors,
  getContract,
  getCustomers,
  updateContract,
  type Contract,
  type VendorRow,
} from '@/lib/api';
import { ContractForm } from '@/components/contracts/ContractForm';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useLocale } from '@/lib/i18n/LocaleProvider';

export default function EditContractPage() {
  const router = useRouter();
  const params = useParams();
  const id = String(params.id);
  const { token, ready } = useRequireAuth('ADMIN');
  const { t } = useLocale();
  const c = t.admin.contracts;
  const [contract, setContract] = useState<Contract | null>(null);
  const [customers, setCustomers] = useState<Array<{ id: string; name: string; email: string }>>(
    [],
  );
  const [vendors, setVendors] = useState<VendorRow[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    Promise.all([getContract(token, id), getCustomers(token), getAdminVendors(token)])
      .then(([item, cust, vend]) => {
        setContract(item);
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
  }, [token, id]);

  async function onDelete() {
    if (!token || !window.confirm(c.deleteConfirm)) return;
    try {
      await deleteContract(token, id);
      router.push('/admin/contracts');
    } catch (e) {
      setError(e instanceof Error ? e.message : t.admin.common.opFailed);
    }
  }

  if (!ready || !token) return null;
  if (!contract && !error) return null;

  return (
    <div>
      <header className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href={`/admin/contracts/${id}`} className="text-sm text-[#8a6a1f] hover:underline">
            ← {c.back}
          </Link>
          <h1 className="mt-2 text-3xl font-semibold">{c.edit}</h1>
        </div>
        <button
          type="button"
          onClick={onDelete}
          className="rounded-xl border border-red-300 px-4 py-2 text-sm text-red-800 hover:bg-red-50"
        >
          {c.delete}
        </button>
      </header>

      {error && <p className="mb-4 text-red-700">{error}</p>}

      {contract && (
        <ContractForm
          mode="admin"
          initial={contract}
          customers={customers}
          vendors={vendors.map((v) => ({ id: v.id, name: v.name, email: v.email }))}
          submitLabel={c.save}
          onSubmit={async (values) => {
            setError('');
            try {
              await updateContract(token, id, values);
              router.push(`/admin/contracts/${id}`);
            } catch (e) {
              setError(e instanceof Error ? e.message : t.admin.common.opFailed);
            }
          }}
        />
      )}
    </div>
  );
}
