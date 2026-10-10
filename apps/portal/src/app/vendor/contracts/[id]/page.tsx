'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ContractDetailView } from '@/components/contracts/ContractDetailView';
import { getContract, type Contract } from '@/lib/api';
import { useRequireAuth } from '@/hooks/useRequireAuth';

export default function VendorContractDetailPage() {
  const { token, ready } = useRequireAuth('VENDOR');
  const params = useParams<{ id: string }>();
  const [contract, setContract] = useState<Contract | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token || !params.id) return;
    getContract(token, params.id)
      .then(setContract)
      .catch((e) => setError(e.message));
  }, [token, params.id]);

  if (!ready) return null;

  return (
    <div>
      <Link href="/vendor/contracts" className="text-sm text-[#8a6a1f]">
        ← العقود
      </Link>
      {error && <p className="mt-4 text-red-700">{error}</p>}
      {contract && (
        <div className="mt-4">
          <ContractDetailView
            contract={contract}
            mode="customer"
            backHref="/vendor/contracts"
          />
        </div>
      )}
    </div>
  );
}
