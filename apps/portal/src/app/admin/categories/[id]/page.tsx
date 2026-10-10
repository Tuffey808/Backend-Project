'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getCategory, type Category } from '@/lib/api';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useLocale } from '@/lib/i18n/LocaleProvider';

export default function CategoryDetailPage() {
  const params = useParams();
  const id = String(params.id);
  const { ready } = useRequireAuth('ADMIN');
  const { t } = useLocale();
  const c = t.admin.categories;
  const [category, setCategory] = useState<Category | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getCategory(id)
      .then(setCategory)
      .catch((e) => setError(e.message));
  }, [id]);

  if (!ready) return null;
  if (error) return <p className="text-red-700">{error}</p>;
  if (!category) return null;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link href="/admin/categories" className="text-sm text-[#8a6a1f] hover:underline">
          ← {c.back}
        </Link>
        <Link
          href={`/admin/categories/${id}/edit`}
          className="rounded-xl border border-[#d6d3d1] px-4 py-2 text-sm hover:bg-white"
        >
          {c.edit}
        </Link>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">{category.name}</h1>
        {category.nameAr && (
          <p className="mt-1 text-lg text-[#57534e]" dir="rtl">
            {category.nameAr}
          </p>
        )}
        {category._count && (
          <p className="mt-3 text-sm text-[#78716c]">
            {category._count.products} {c.products}
          </p>
        )}
        {category.imageUrl && (
          <div className="mt-4">
            <p className="text-xs text-[#78716c]">{c.imageUrl}</p>
            <p className="mt-1 break-all text-sm">{category.imageUrl}</p>
          </div>
        )}
      </div>
    </div>
  );
}
