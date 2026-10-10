'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  deleteDiscountCode,
  getDiscountCodes,
  updateDiscountCode,
  type DiscountCode,
} from '@/lib/api';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useLocale } from '@/lib/i18n/LocaleProvider';

export default function EditCouponPage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params.id);
  const { token, ready } = useRequireAuth('ADMIN');
  const { t } = useLocale();
  const c = t.admin.coupons;
  const [coupon, setCoupon] = useState<DiscountCode | null>(null);
  const [discountType, setDiscountType] = useState<'percent' | 'amount'>('percent');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    getDiscountCodes(token)
      .then((rows) => {
        const found = rows.find((row) => row.id === id) ?? null;
        setCoupon(found);
        if (found?.percentOff != null && found.percentOff !== '') {
          setDiscountType('percent');
        } else if (found?.amountOff != null && found.amountOff !== '') {
          setDiscountType('amount');
        }
      })
      .catch((e) => setError(e.message));
  }, [token, id]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token) return;
    const form = new FormData(e.currentTarget);
    setError('');
    try {
      await updateDiscountCode(token, id, {
        code: String(form.get('code')),
        ...(discountType === 'percent'
          ? { percentOff: Number(form.get('percentOff') || 0) }
          : { amountOff: Number(form.get('amountOff') || 0) }),
        active: form.get('active') === 'on',
      });
      router.push('/admin/coupons');
    } catch (err) {
      setError(err instanceof Error ? err.message : t.admin.common.opFailed);
    }
  }

  async function onDelete() {
    if (!token || !window.confirm(c.deleteConfirm)) return;
    try {
      await deleteDiscountCode(token, id);
      router.push('/admin/coupons');
    } catch (err) {
      setError(err instanceof Error ? err.message : t.admin.common.opFailed);
    }
  }

  if (!ready || !token) return null;
  if (!coupon && !error) return null;

  return (
    <div>
      <header className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/admin/coupons" className="text-sm text-[#8a6a1f] hover:underline">
            ← {c.back}
          </Link>
          <h1 className="mt-2 text-3xl font-semibold">{c.edit}</h1>
        </div>
        <button
          type="button"
          onClick={onDelete}
          className="rounded-xl border border-red-300 px-4 py-2 text-sm text-red-800 hover:bg-red-50"
        >
          {c.delete}
        </button>
      </header>

      {error && <p className="mb-4 text-red-700">{error}</p>}

      {coupon && (
        <form onSubmit={onSubmit} className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
          <label className="block text-sm">
            {c.code}
            <input
              name="code"
              required
              defaultValue={coupon.code}
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
                defaultValue={Number(coupon.percentOff || 0)}
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
                defaultValue={Number(coupon.amountOff || 0)}
                className="mt-1 w-full rounded-xl border border-[#e7e5e4] px-3 py-2"
              />
            </label>
          )}

          <label className="flex items-center gap-2 text-sm">
            <input
              name="active"
              type="checkbox"
              defaultChecked={coupon.active}
              className="rounded"
            />
            {c.active}
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
