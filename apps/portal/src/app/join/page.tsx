'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { submitVendorApplication } from '@/lib/api';
import { SiteHeader } from '@/components/marketing/SiteHeader';
import { SiteFooter } from '@/components/marketing/SiteFooter';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { useLocale } from '@/lib/i18n/LocaleProvider';

export default function JoinPage() {
  const { t } = useLocale();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      await submitVendorApplication({
        businessName: String(form.get('businessName')),
        contactName: String(form.get('contactName')),
        email: String(form.get('email')),
        phone: String(form.get('phone')),
        category: String(form.get('category')),
        city: String(form.get('city') || '') || undefined,
        description: String(form.get('description') || '') || undefined,
        commercialRegister: String(form.get('commercialRegister') || '') || undefined,
      });
      setDone(true);
      e.currentTarget.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="site-page min-h-screen">
      <SiteHeader />
      <main className="px-4 py-12 md:px-6 md:py-16">
        <div className="mx-auto mb-6 flex max-w-6xl justify-end">
          <LanguageSwitcher />
        </div>
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-[#8a6a1f]">{t.join.label}</p>
            <h1 className="mt-1 text-4xl font-bold">{t.join.title}</h1>
            <p className="mt-4 leading-relaxed text-[#57534e]">{t.join.intro}</p>
            <ul className="mt-8 space-y-4">
              {t.join.benefits.map((item) => (
                <li key={item} className="flex gap-3 text-[#57534e]">
                  <span className="mt-1 text-[#8a6a1f]">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-8 text-sm text-[#78716c]">
              {t.join.hasAccount}{' '}
              <Link href="/login" className="text-[#8a6a1f] hover:underline">
                {t.login.signIn}
              </Link>
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-lg md:p-8">
            {done ? (
              <div className="py-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-2xl text-emerald-700">
                  ✓
                </div>
                <h2 className="text-2xl font-bold">{t.join.successTitle}</h2>
                <p className="mt-3 text-[#57534e]">{t.join.successBody}</p>
                <Link
                  href="/"
                  className="mt-6 inline-block rounded-xl bg-[#8a6a1f] px-6 py-2.5 font-medium text-white"
                >
                  {t.join.backHome}
                </Link>
              </div>
            ) : (
              <>
                <h2 className="mb-6 text-xl font-bold">{t.join.formTitle}</h2>
                {error && (
                  <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>
                )}
                <form onSubmit={onSubmit} className="space-y-4">
                  <label className="block text-sm">
                    {t.join.businessName} *
                    <input
                      name="businessName"
                      required
                      className="mt-1 w-full rounded-xl border border-[#e7e5e4] px-3 py-2.5"
                    />
                  </label>
                  <label className="block text-sm">
                    {t.join.contactName} *
                    <input
                      name="contactName"
                      required
                      className="mt-1 w-full rounded-xl border border-[#e7e5e4] px-3 py-2.5"
                    />
                  </label>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block text-sm">
                      {t.join.email} *
                      <input
                        name="email"
                        type="email"
                        required
                        className="mt-1 w-full rounded-xl border border-[#e7e5e4] px-3 py-2.5"
                      />
                    </label>
                    <label className="block text-sm">
                      {t.join.phone} *
                      <input
                        name="phone"
                        type="tel"
                        required
                        placeholder="05xxxxxxxx"
                        className="mt-1 w-full rounded-xl border border-[#e7e5e4] px-3 py-2.5"
                      />
                    </label>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block text-sm">
                      {t.join.category} *
                      <select
                        name="category"
                        required
                        className="mt-1 w-full rounded-xl border border-[#e7e5e4] px-3 py-2.5"
                      >
                        <option value="">{t.join.selectCategory}</option>
                        {t.join.categories.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="block text-sm">
                      {t.join.city}
                      <input
                        name="city"
                        className="mt-1 w-full rounded-xl border border-[#e7e5e4] px-3 py-2.5"
                      />
                    </label>
                  </div>
                  <label className="block text-sm">
                    {t.join.commercialRegister}
                    <input
                      name="commercialRegister"
                      className="mt-1 w-full rounded-xl border border-[#e7e5e4] px-3 py-2.5"
                    />
                  </label>
                  <label className="block text-sm">
                    {t.join.description}
                    <textarea
                      name="description"
                      rows={4}
                      placeholder={t.join.descriptionPh}
                      className="mt-1 w-full rounded-xl border border-[#e7e5e4] px-3 py-2.5"
                    />
                  </label>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl bg-[#8a6a1f] py-3 font-medium text-white disabled:opacity-60"
                  >
                    {loading ? t.join.submitting : t.join.submit}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
