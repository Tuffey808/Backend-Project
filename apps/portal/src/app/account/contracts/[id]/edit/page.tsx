'use client';

import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getContract, updateContract, type Contract } from '@/lib/api';
import { ContractForm } from '@/components/contracts/ContractForm';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useLocale } from '@/lib/i18n/LocaleProvider';

export default function CustomerEditContractPage() {
  const router = useRouter();
  const params = useParams();
  const id = String(params.id);
  const { token, ready } = useRequireAuth('CUSTOMER');
  const { t } = useLocale();
  const c = t.account.contracts;
  const [contract, setContract] = useState<Contract | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    getContract(token, id)
      .then(setContract)
      .catch((e) => setError(e.message));
  }, [token, id]);

  if (!ready || !token) return null;
  if (!contract && !error) return null;

  return (
    <div>
      <header className="mb-8">
        <Link href={`/account/contracts/${id}`} className="text-sm text-[#8a6a1f] hover:underline">
          ← {c.back}
        </Link>
        <h1 className="mt-2 text-3xl font-semibold">{c.edit}</h1>
      </header>

      {error && <p className="mb-4 text-red-700">{error}</p>}

      {contract && (
        <ContractForm
          mode="customer"
          initial={contract}
          submitLabel={c.save}
          onSubmit={async (values) => {
            setError('');
            try {
              await updateContract(token, id, values);
              router.push(`/account/contracts/${id}`);
            } catch (e) {
              setError(e instanceof Error ? e.message : t.admin.common.opFailed);
            }
          }}
        />
      )}
    </div>
  );
}
