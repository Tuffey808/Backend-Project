'use client';

import { useCallback, useEffect, useState } from 'react';
import { approveProduct, getPendingProducts, type PendingProduct } from '@/lib/api';
import { Badge } from '@/components/ui/Badge';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useLocale } from '@/lib/i18n/LocaleProvider';

export default function ApprovalsPage() {
  const { token, ready } = useRequireAuth('ADMIN');
  const { t } = useLocale();
  const a = t.admin.approvals;
  const [items, setItems] = useState<PendingProduct[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!token) return;
    getPendingProducts(token)
      .then(setItems)
      .catch((e) => setError(e.message));
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleApproval(id: string, approve: boolean) {
    if (!token) return;
    setBusy(id);
    setError('');
    try {
      await approveProduct(token, id, approve);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : a.opFailed);
    } finally {
      setBusy(null);
    }
  }

  if (!ready) return null;

  return (
    <div>
      <header className="mb-8">
        <p className="text-sm text-[#8a6a1f]">{a.label}</p>
        <h1 className="text-3xl font-semibold">{a.title}</h1>
        <p className="mt-1 text-[#57534e]">{a.subtitle}</p>
      </header>

      {error && <p className="mb-4 text-red-700">{error}</p>}

      <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
        {a.workflow}
      </div>

      <div className="space-y-4">
        {items.length === 0 && (
          <div className="rounded-2xl bg-white px-6 py-12 text-center text-[#78716c] shadow-sm">{a.empty}</div>
        )}
        {items.map((p) => {
          const id = String(p._id || p.id);
          const image =
            typeof p.image_1920 === 'string' && p.image_1920 ? p.image_1920 : null;
          return (
            <article key={id} className="rounded-2xl bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold">{String(p.name)}</h2>
                    <Badge label="PENDING" />
                  </div>
                  {p.name_ar != null && p.name_ar !== false && (
                    <p className="text-[#57534e]" dir="rtl">
                      {String(p.name_ar)}
                    </p>
                  )}
                  <p className="mt-2 text-sm text-[#78716c]">
                    {String(p.list_price)} SAR · {a.qty} {String(p.qty_available)}
                  </p>
                  {p.owner && (
                    <p className="mt-1 text-sm text-[#78716c]">
                      {a.vendor}: {String(p.owner.name)} ({String(p.owner.email)})
                    </p>
                  )}
                  {p.description_sale != null && p.description_sale !== false && (
                    <p className="mt-3 max-w-2xl text-sm text-[#57534e]">
                      {String(p.description_sale)}
                    </p>
                  )}
                </div>
                {image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={image} alt="" className="h-24 w-24 rounded-xl border object-cover" />
                )}
              </div>
              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  disabled={busy === id}
                  className="rounded-xl bg-emerald-700 px-4 py-2 text-sm text-white disabled:opacity-60"
                  onClick={() => handleApproval(id, true)}
                >
                  {a.approve}
                </button>
                <button
                  type="button"
                  disabled={busy === id}
                  className="rounded-xl border border-red-300 px-4 py-2 text-sm text-red-800 disabled:opacity-60"
                  onClick={() => handleApproval(id, false)}
                >
                  {a.reject}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
