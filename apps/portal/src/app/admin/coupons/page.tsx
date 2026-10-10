'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import {
  createDiscountCode,
  deleteDiscountCode,
  getDiscountCodes,
  updateDiscountCode,
  type DiscountCode,
} from '@/lib/api';
import { Badge } from '@/components/ui/Badge';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useLocale } from '@/lib/i18n/LocaleProvider';

function formatDiscount(item: DiscountCode) {
  if (item.percentOff != null && item.percentOff !== '') {
    return `${Number(item.percentOff)}%`;
  }
  if (item.amountOff != null && item.amountOff !== '') {
    return `${Number(item.amountOff)} SAR`;
  }
  return '—';
}

export default function CouponsPage() {
  const { token, ready } = useRequireAuth('ADMIN');
  const { t } = useLocale();
  const c = t.admin.coupons;
  const [coupons, setCoupons] = useState<DiscountCode[]>([]);
  const [error, setError] = useState('');
  const [discountType, setDiscountType] = useState<'percent' | 'amount'>('percent');

  async function refresh(tok: string) {
    setCoupons(await getDiscountCodes(tok));
  }

  useEffect(() => {
    if (!token) return;
    refresh(token).catch((e) => setError(e.message));
  }, [token]);

  async function onCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token) return;
    const form = new FormData(e.currentTarget);
    setError('');
    try {
      const expiresAt = String(form.get('expiresAt') || '');
      const minOrder = Number(form.get('minOrderAmount') || 0);
      const maxUses = Number(form.get('maxUses') || 0);
      await createDiscountCode(token, {
        code: String(form.get('code')),
        percentOff:
          discountType === 'percent' ? Number(form.get('percentOff') || 0) : undefined,
        amountOff:
          discountType === 'amount' ? Number(form.get('amountOff') || 0) : undefined,
        active: form.get('active') === 'on',
        expiresAt: expiresAt || null,
        minOrderAmount: minOrder > 0 ? minOrder : undefined,
        maxUses: maxUses > 0 ? maxUses : undefined,
      });
      e.currentTarget.reset();
      await refresh(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.admin.common.opFailed);
    }
  }

  async function onToggle(item: DiscountCode) {
    if (!token) return;
    setError('');
    try {
      await updateDiscountCode(token, item.id, { active: !item.active });
      await refresh(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.admin.common.opFailed);
    }
  }

  async function onDelete(item: DiscountCode) {
    if (!token || !window.confirm(c.deleteConfirm)) return;
    setError('');
    try {
      await deleteDiscountCode(token, item.id);
      await refresh(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.admin.common.opFailed);
    }
  }

  if (!ready) return null;

  return (
    <div>
      <header className="mb-8">
        <p className="text-sm text-[#8a6a1f]">{c.label}</p>
        <h1 className="text-3xl font-semibold">{c.title}</h1>
        <p className="mt-1 text-[#57534e]">{c.subtitle}</p>
      </header>

      {error && <p className="mb-4 text-red-700">{error}</p>}

      <form onSubmit={onCreate} className="mb-8 space-y-4 rounded-2xl bg-white p-5 shadow-sm">
        <div className="grid gap-3 md:grid-cols-4">
          <label className="block text-sm md:col-span-1">
            {c.code}
            <input
              name="code"
              required
              placeholder={c.codePh}
              className="mt-1 w-full rounded-xl border border-[#e7e5e4] px-3 py-2 uppercase"
            />
          </label>
          <label className="block text-sm">
            {c.discountType}
            <select
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value as 'percent' | 'amount')}
              className="mt-1 w-full rounded-xl border border-[#e7e5e4] px-3 py-2"
            >
              <option value="percent">{c.typePercent}</option>
              <option value="amount">{c.typeAmount}</option>
            </select>
          </label>
          {discountType === 'percent' ? (
            <label className="block text-sm">
              {c.percentOff}
              <input
                name="percentOff"
                type="number"
                min="0"
                max="100"
                step="0.01"
                required
                defaultValue={10}
                className="mt-1 w-full rounded-xl border border-[#e7e5e4] px-3 py-2"
              />
            </label>
          ) : (
            <label className="block text-sm">
              {c.amountOff}
              <input
                name="amountOff"
                type="number"
                min="0"
                step="0.01"
                required
                defaultValue={50}
                className="mt-1 w-full rounded-xl border border-[#e7e5e4] px-3 py-2"
              />
            </label>
          )}
          <div className="flex items-end gap-3">
            <label className="flex items-center gap-2 pb-2 text-sm">
              <input name="active" type="checkbox" defaultChecked className="rounded" />
              {c.active}
            </label>
            <button type="submit" className="rounded-xl bg-[#8a6a1f] px-4 py-2 text-white">
              {c.add}
            </button>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <label className="block text-sm">
            الحد الأدنى للطلب (SAR)
            <input
              name="minOrderAmount"
              type="number"
              min="0"
              step="0.01"
              className="mt-1 w-full rounded-xl border border-[#e7e5e4] px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            أقصى استخدامات
            <input
              name="maxUses"
              type="number"
              min="1"
              className="mt-1 w-full rounded-xl border border-[#e7e5e4] px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            تاريخ الانتهاء
            <input
              name="expiresAt"
              type="date"
              className="mt-1 w-full rounded-xl border border-[#e7e5e4] px-3 py-2"
            />
          </label>
        </div>
      </form>

      <div className="space-y-3">
        {coupons.length === 0 && (
          <div className="rounded-2xl bg-white px-6 py-10 text-center text-[#78716c] shadow-sm">
            {c.empty}
          </div>
        )}
        {coupons.map((item) => (
          <div
            key={item.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white px-5 py-4 shadow-sm"
          >
            <div>
              <p className="font-mono text-lg font-semibold tracking-wide">{item.code}</p>
              <p className="text-sm text-[#78716c]">
                {formatDiscount(item)} · {new Date(item.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge label={item.active ? c.active : c.inactive} />
              <Link
                href={`/admin/coupons/${item.id}/edit`}
                className="rounded-lg border border-[#d6d3d1] px-3 py-1.5 text-sm hover:bg-[#faf6ef]"
              >
                {c.edit}
              </Link>
              <button
                type="button"
                onClick={() => onToggle(item)}
                className="rounded-lg border border-[#d6d3d1] px-3 py-1.5 text-sm hover:bg-[#faf6ef]"
              >
                {item.active ? c.inactive : c.active}
              </button>
              <button
                type="button"
                onClick={() => onDelete(item)}
                className="rounded-lg border border-red-300 px-3 py-1.5 text-sm text-red-800 hover:bg-red-50"
              >
                {c.delete}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
