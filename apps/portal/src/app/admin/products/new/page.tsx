'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createProduct, getCategories, type Category } from '@/lib/api';
import { ProductForm } from '@/components/products/ProductForm';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useLocale } from '@/lib/i18n/LocaleProvider';

export default function NewProductPage() {
  const router = useRouter();
  const { token, ready } = useRequireAuth('ADMIN');
  const { t } = useLocale();
  const p = t.admin.products;
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    getCategories().then(setCategories).catch((e) => setError(e.message));
  }, []);

  if (!ready || !token) return null;

  return (
    <div>
      <header className="mb-8">
        <p className="text-sm text-[#8a6a1f]">{p.label}</p>
        <h1 className="text-3xl font-semibold">{p.newTitle}</h1>
        <p className="mt-1 text-[#57534e]">{p.newSubtitle}</p>
      </header>

      {error && <p className="mb-4 text-red-700">{error}</p>}
      {success && <p className="mb-4 text-emerald-700">{success}</p>}

      <ProductForm
        token={token}
        categories={categories}
        defaultStatus="PUBLISHED"
        submitLabel={p.savePublish}
        onSubmit={async (values) => {
          setError('');
          setSuccess('');
          try {
            await createProduct(token, values);
            setSuccess(p.saveSuccess);
            setTimeout(() => router.push('/admin/products'), 800);
          } catch (e) {
            setError(e instanceof Error ? e.message : p.saveFailed);
          }
        }}
      />
    </div>
  );
}
