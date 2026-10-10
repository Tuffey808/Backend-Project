'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getContract, type Contract } from '@/lib/api';
import { ContractDetailView } from '@/components/contracts/ContractDetailView';
import { useRequireAuth } from '@/hooks/useRequireAuth';

export default function CustomerContractDetailPage() {
  const params = useParams();
  const id = String(params.id);
  const { token, ready } = useRequireAuth('CUSTOMER');
  const [contract, setContract] = useState<Contract | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    getContract(token, id)
      .then(setContract)
      .catch((e) => setError(e.message));
  }, [token, id]);

  if (!ready) return null;
  if (error) return <p className="text-red-700">{error}</p>;
  if (!contract) return null;

  return (
    <ContractDetailView
      contract={contract}
      mode="customer"
      backHref="/account/contracts"
      editHref={`/account/contracts/${id}/edit`}
    />
  );
}
