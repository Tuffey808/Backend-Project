'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getCategory, updateCategory, type Category } from '@/lib/api';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useLocale } from '@/lib/i18n/LocaleProvider';

export default function EditCategoryPage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params.id);
  const { token, ready } = useRequireAuth('ADMIN');
  const { t } = useLocale();
  const c = t.admin.categories;
  const [category, setCategory] = useState<Category | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getCategory(id)
      .then(setCategory)
      .catch((e) => setError(e.message));
  }, [id]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token) return;
    const form = new FormData(e.currentTarget);
    setError('');
    try {
      await updateCategory(token, id, {
        name: String(form.get('name')),
        nameAr: String(form.get('nameAr') || '') || undefined,
        imageUrl: String(form.get('imageUrl') || '') || undefined,
      });
      router.push(`/admin/categories/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.admin.common.opFailed);
    }
  }

  if (!ready || !token) return null;
  if (!category && !error) return null;

  return (
    <div>
      <header className="mb-8">
        <Link href={`/admin/categories/${id}`} className="text-sm text-[#8a6a1f] hover:underline">
          ← {c.back}
        </Link>
        <h1 className="mt-2 text-3xl font-semibold">{c.edit}</h1>
      </header>

      {error && <p className="mb-4 text-red-700">{error}</p>}

      {category && (
        <form onSubmit={onSubmit} className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
          <label className="block text-sm">
            {c.nameEn} *
            <input
              name="name"
              required
              defaultValue={category.name}
              className="mt-1 w-full rounded-xl border border-[#e7e5e4] px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            {c.nameAr}
            <input
              name="nameAr"
              dir="rtl"
              defaultValue={category.nameAr || ''}
              className="mt-1 w-full rounded-xl border border-[#e7e5e4] px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            {c.imageUrl}
            <input
              name="imageUrl"
              defaultValue={category.imageUrl || ''}
              className="mt-1 w-full rounded-xl border border-[#e7e5e4] px-3 py-2"
            />
          </label>
          <button
            type="submit"
            className="rounded-xl bg-[#8a6a1f] px-6 py-2.5 text-white hover:bg-[#735818]"
          >
            {c.save}
          </button>
        </form>
      )}
    </div>
  );
}
