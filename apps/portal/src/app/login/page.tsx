'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { login, register } from '@/lib/api';
import { saveSession } from '@/lib/session';
import { useLocale } from '@/lib/i18n/LocaleProvider';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { SiteHeader } from '@/components/marketing/SiteHeader';

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLocale();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const email = String(form.get('email') || '');
    const password = String(form.get('password') || '');
    const name = String(form.get('name') || '');
    try {
      const res =
        mode === 'login'
          ? await login(email, password)
          : await register({ email, password, name });
      saveSession(res.accessToken, res.user);
      router.push(
        res.user.role === 'ADMIN'
          ? '/admin'
          : res.user.role === 'VENDOR'
            ? '/vendor'
            : '/account',
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="site-page min-h-screen">
      <SiteHeader />
      <main className="mx-auto flex max-w-lg flex-col px-6 py-12">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/" className="text-sm text-[#8a6a1f] hover:underline">
            {t.login.back}
          </Link>
          <LanguageSwitcher />
        </div>
        <p className="mb-2 text-sm tracking-[0.2em] text-[#8a6a1f] uppercase">G-MALL</p>
        <h1 className="mb-2 text-4xl font-bold">{t.login.title}</h1>
        <p className="mb-8 text-[#57534e]">{t.login.subtitle}</p>

        <div className="mb-6 flex gap-3 text-sm">
          <button
            type="button"
            className={mode === 'login' ? 'font-semibold text-[#8a6a1f]' : 'text-[#78716c]'}
            onClick={() => setMode('login')}
          >
            {t.login.signIn}
          </button>
          <button
            type="button"
            className={mode === 'register' ? 'font-semibold text-[#8a6a1f]' : 'text-[#78716c]'}
            onClick={() => setMode('register')}
          >
            {t.login.register}
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
          {mode === 'register' && (
            <label className="block text-sm">
              {t.login.name}
              <input
                name="name"
                required
                className="mt-1 w-full rounded-xl border border-[#e7e5e4] px-3 py-2"
              />
            </label>
          )}
          <label className="block text-sm">
            {t.login.email}
            <input
              name="email"
              type="email"
              required
              className="mt-1 w-full rounded-xl border border-[#e7e5e4] px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            {t.login.password}
            <input
              name="password"
              type="password"
              required
              className="mt-1 w-full rounded-xl border border-[#e7e5e4] px-3 py-2"
            />
          </label>
          {error && <p className="text-sm text-red-700">{error}</p>}
          <button
            disabled={loading}
            className="w-full rounded-xl bg-[#8a6a1f] px-4 py-3 font-medium text-white disabled:opacity-60"
          >
            {loading
              ? t.login.loading
              : mode === 'login'
                ? t.login.submitLogin
                : t.login.submitRegister}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-[#78716c]">
          {t.login.merchant}{' '}
          <Link href="/join" className="text-[#8a6a1f] hover:underline">
            {t.login.joinLink}
          </Link>
        </p>
      </main>
    </div>
  );
}
