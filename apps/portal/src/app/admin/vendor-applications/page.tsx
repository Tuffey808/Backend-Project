'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  getVendorApplications,
  reviewVendorApplication,
  type VendorApplication,
} from '@/lib/api';
import { Badge } from '@/components/ui/Badge';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useLocale } from '@/lib/i18n/LocaleProvider';

export default function VendorApplicationsPage() {
  const { token, ready } = useRequireAuth('ADMIN');
  const { t, locale } = useLocale();
  const a = t.admin.vendorApplications;
  const [items, setItems] = useState<VendorApplication[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<{
    email: string;
    temporaryPassword: string;
  } | null>(null);

  const load = useCallback(() => {
    if (!token) return;
    getVendorApplications(token)
      .then(setItems)
      .catch((e) => setError(e.message));
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleReview(id: string, approve: boolean) {
    if (!token) return;
    setBusy(id);
    setError('');
    setCredentials(null);
    try {
      const res = await reviewVendorApplication(token, id, approve);
      if (res.credentials) setCredentials(res.credentials);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : a.opFailed);
    } finally {
      setBusy(null);
    }
  }

  if (!ready) return null;

  const pending = items.filter((i) => i.status === 'PENDING');
  const dateLocale = locale === 'ar' ? 'ar-SA' : 'en-US';

  return (
    <div>
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-[#8a6a1f]">{a.label}</p>
          <h1 className="text-3xl font-semibold">{a.title}</h1>
          <p className="mt-1 text-[#57534e]">
            {pending.length} {a.pendingSummary} {items.length} {a.total}
          </p>
        </div>
        <Link href="/admin/vendors" className="rounded-xl border border-[#d6d3d1] px-4 py-2 text-sm hover:bg-[#faf6ef]">
          {a.approvedVendors}
        </Link>
      </header>

      {error && <p className="mb-4 text-red-700">{error}</p>}

      {credentials && (
        <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm">
          <p className="font-semibold text-emerald-900">{a.accountCreated}</p>
          <p className="mt-2 text-emerald-800">
            {a.email}: <strong>{credentials.email}</strong>
            <br />
            {a.tempPassword}: <strong>{credentials.temporaryPassword}</strong>
          </p>
          <p className="mt-2 text-emerald-700">{a.sendCredentials}</p>
        </div>
      )}

      <div className="space-y-4">
        {items.length === 0 && (
          <div className="rounded-2xl bg-white px-6 py-12 text-center text-[#78716c] shadow-sm">
            {a.empty}{' '}
            <a href="/join" className="text-[#8a6a1f]">
              /join
            </a>{' '}
            {a.emptyLink}
          </div>
        )}
        {items.map((app) => (
          <article key={app.id} className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold">{app.businessName}</h2>
                  <Badge label={app.status} />
                </div>
                <p className="mt-1 text-sm text-[#57534e]">
                  {app.contactName} · {app.email} · {app.phone}
                </p>
                <p className="mt-1 text-sm text-[#78716c]">
                  {app.category}
                  {app.city ? ` · ${app.city}` : ''}
                </p>
                {app.commercialRegister && (
                  <p className="mt-1 text-sm text-[#78716c]">
                    {a.commercialRegister}: {app.commercialRegister}
                  </p>
                )}
                {app.description && (
                  <p className="mt-3 max-w-2xl text-sm text-[#57534e]">{app.description}</p>
                )}
                <p className="mt-2 text-xs text-[#a8a29e]">
                  {new Date(app.createdAt).toLocaleString(dateLocale)}
                </p>
              </div>
              {app.status === 'PENDING' && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={busy === app.id}
                    className="rounded-xl bg-emerald-700 px-4 py-2 text-sm text-white disabled:opacity-60"
                    onClick={() => handleReview(app.id, true)}
                  >
                    {a.approve}
                  </button>
                  <button
                    type="button"
                    disabled={busy === app.id}
                    className="rounded-xl border border-red-300 px-4 py-2 text-sm text-red-800 disabled:opacity-60"
                    onClick={() => handleReview(app.id, false)}
                  >
                    {a.reject}
                  </button>
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
