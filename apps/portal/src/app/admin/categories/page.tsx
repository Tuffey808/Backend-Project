'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { createCategory, getCategories, type Category } from '@/lib/api';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useLocale } from '@/lib/i18n/LocaleProvider';

export default function CategoriesPage() {
  const { token, ready } = useRequireAuth('ADMIN');
  const { t } = useLocale();
  const c = t.admin.categories;
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState('');

  async function refresh() {
    setCategories(await getCategories());
  }

  useEffect(() => {
    refresh().catch((e) => setError(e.message));
  }, []);

  async function onCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token) return;
    const form = new FormData(e.currentTarget);
    await createCategory(token, {
      name: String(form.get('name')),
      nameAr: String(form.get('nameAr') || '') || undefined,
      imageUrl: String(form.get('imageUrl') || '') || undefined,
    });
    e.currentTarget.reset();
    await refresh();
  }

  if (!ready) return null;

  return (
    <div>
      <header className="mb-8">
        <p className="text-sm text-[#8a6a1f]">{c.label}</p>
        <h1 className="text-3xl font-semibold">{c.title}</h1>
      </header>

      {error && <p className="mb-4 text-red-700">{error}</p>}

      <form onSubmit={onCreate} className="mb-8 grid gap-3 rounded-2xl bg-white p-5 shadow-sm md:grid-cols-4">
        <input name="name" required placeholder={c.nameEn} className="rounded-xl border px-3 py-2" />
        <input name="nameAr" placeholder={c.nameAr} dir="rtl" className="rounded-xl border px-3 py-2" />
        <input name="imageUrl" placeholder={c.imageUrl} className="rounded-xl border px-3 py-2" />
        <button type="submit" className="rounded-xl bg-[#8a6a1f] px-4 py-2 text-white">
          {c.add}
        </button>
      </form>

      {categories.length === 0 && (
        <div className="rounded-2xl bg-white px-6 py-10 text-center text-[#78716c] shadow-sm">{c.empty}</div>
      )}

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => (
          <li key={cat.id} className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="font-medium">{cat.name}</p>
            {cat.nameAr && (
              <p className="text-sm text-[#78716c]" dir="rtl">
                {cat.nameAr}
              </p>
            )}
            {cat._count && (
              <p className="mt-1 text-xs text-[#78716c]">
                {cat._count.products} {c.products}
              </p>
            )}
            <div className="mt-3 flex gap-2">
              <Link
                href={`/admin/categories/${cat.id}`}
                className="rounded-lg border border-[#d6d3d1] px-3 py-1.5 text-sm hover:bg-[#faf6ef]"
              >
                {c.view}
              </Link>
              <Link
                href={`/admin/categories/${cat.id}/edit`}
                className="rounded-lg border border-[#d6d3d1] px-3 py-1.5 text-sm hover:bg-[#faf6ef]"
              >
                {c.edit}
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
