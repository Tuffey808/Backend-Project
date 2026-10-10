'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createProduct, getCategories, type Category } from '@/lib/api';
import { ProductForm } from '@/components/products/ProductForm';
import { useRequireAuth } from '@/hooks/useRequireAuth';

export default function VendorNewProductPage() {
  const router = useRouter();
  const { token, ready } = useRequireAuth('VENDOR');
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
        <p className="text-sm text-[#8a6a1f]">المنتجات</p>
        <h1 className="text-3xl font-semibold">إضافة منتج</h1>
        <p className="mt-1 text-[#57534e]">
          يُرسل المنتج للمراجعة ولا يُنشر في المتجر حتى موافقة الإدارة
        </p>
      </header>

      {error && <p className="mb-4 text-red-700">{error}</p>}
      {success && <p className="mb-4 text-emerald-700">{success}</p>}

      <ProductForm
        token={token}
        categories={categories}
        defaultStatus="PENDING"
        hideStatus
        submitLabel="إرسال للمراجعة"
        onSubmit={async (values) => {
          setError('');
          setSuccess('');
          try {
            await createProduct(token, { ...values, status: 'PENDING' });
            setSuccess('تم إرسال المنتج للمراجعة');
            setTimeout(() => router.push('/vendor/products'), 800);
          } catch (e) {
            setError(e instanceof Error ? e.message : 'فشل الإرسال');
          }
        }}
      />
    </div>
  );
}
