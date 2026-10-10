'use client';

import { FormEvent, useEffect, useState } from 'react';
import {
  getVendorProfile,
  updateVendorProfile,
  type VendorProfile,
} from '@/lib/api';
import { useRequireAuth } from '@/hooks/useRequireAuth';

export default function VendorStorePage() {
  const { token, ready } = useRequireAuth('VENDOR');
  const [profile, setProfile] = useState<VendorProfile | null>(null);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!token) return;
    getVendorProfile(token)
      .then(setProfile)
      .catch((e) => setError(e.message));
  }, [token]);

  if (!ready) return null;

  return (
    <div>
      <header className="mb-8">
        <p className="text-sm text-[#8a6a1f]">المتجر</p>
        <h1 className="text-3xl font-semibold">إعدادات المتجر</h1>
        <p className="mt-1 text-[#57534e]">
          تظهر هذه البيانات في التطبيق وصفحة المتجر العامة
        </p>
      </header>

      {error && <p className="mb-4 text-red-700">{error}</p>}
      {saved && <p className="mb-4 text-green-700">تم الحفظ</p>}

      {profile && token && (
        <form
          className="space-y-4 rounded-2xl bg-white p-6 shadow-sm"
          onSubmit={async (e: FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            setSaved(false);
            setError('');
            const form = new FormData(e.currentTarget);
            try {
              const updated = await updateVendorProfile(token, {
                storeName: String(form.get('storeName')),
                storeNameAr: String(form.get('storeNameAr') || '') || undefined,
                slug: String(form.get('slug') || '') || undefined,
                city: String(form.get('city') || '') || undefined,
                description: String(form.get('description') || '') || undefined,
                descriptionAr:
                  String(form.get('descriptionAr') || '') || undefined,
                shippingPolicy:
                  String(form.get('shippingPolicy') || '') || undefined,
                returnPolicy: String(form.get('returnPolicy') || '') || undefined,
                bankIban: String(form.get('bankIban') || '') || undefined,
                bankName: String(form.get('bankName') || '') || undefined,
                logoUrl: String(form.get('logoUrl') || '') || undefined,
              });
              setProfile(updated);
              setSaved(true);
            } catch (err) {
              setError(err instanceof Error ? err.message : 'فشل الحفظ');
            }
          }}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm">
              اسم المتجر (EN) *
              <input
                name="storeName"
                required
                defaultValue={profile.storeName}
                className="mt-1 w-full rounded-xl border px-3 py-2"
              />
            </label>
            <label className="text-sm">
              اسم المتجر (AR)
              <input
                name="storeNameAr"
                dir="rtl"
                defaultValue={profile.storeNameAr || ''}
                className="mt-1 w-full rounded-xl border px-3 py-2"
              />
            </label>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm">
              الرابط (slug)
              <input
                name="slug"
                defaultValue={profile.slug}
                className="mt-1 w-full rounded-xl border px-3 py-2"
              />
            </label>
            <label className="text-sm">
              المدينة
              <input
                name="city"
                defaultValue={profile.city || ''}
                className="mt-1 w-full rounded-xl border px-3 py-2"
              />
            </label>
          </div>
          <label className="block text-sm">
            شعار (URL)
            <input
              name="logoUrl"
              defaultValue={profile.logoUrl || ''}
              className="mt-1 w-full rounded-xl border px-3 py-2"
            />
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm">
              الوصف
              <textarea
                name="description"
                rows={3}
                defaultValue={profile.description || ''}
                className="mt-1 w-full rounded-xl border px-3 py-2"
              />
            </label>
            <label className="text-sm">
              الوصف بالعربي
              <textarea
                name="descriptionAr"
                dir="rtl"
                rows={3}
                defaultValue={profile.descriptionAr || ''}
                className="mt-1 w-full rounded-xl border px-3 py-2"
              />
            </label>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm">
              سياسة الشحن
              <textarea
                name="shippingPolicy"
                rows={2}
                defaultValue={profile.shippingPolicy || ''}
                className="mt-1 w-full rounded-xl border px-3 py-2"
              />
            </label>
            <label className="text-sm">
              سياسة الإرجاع
              <textarea
                name="returnPolicy"
                rows={2}
                defaultValue={profile.returnPolicy || ''}
                className="mt-1 w-full rounded-xl border px-3 py-2"
              />
            </label>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm">
              اسم البنك
              <input
                name="bankName"
                defaultValue={profile.bankName || ''}
                className="mt-1 w-full rounded-xl border px-3 py-2"
              />
            </label>
            <label className="text-sm">
              IBAN
              <input
                name="bankIban"
                defaultValue={profile.bankIban || ''}
                className="mt-1 w-full rounded-xl border px-3 py-2"
              />
            </label>
          </div>
          <button type="submit" className="rounded-xl bg-[#8a6a1f] px-6 py-2.5 text-white">
            حفظ إعدادات المتجر
          </button>
        </form>
      )}
    </div>
  );
}
