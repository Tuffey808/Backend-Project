'use client';

import { FormEvent } from 'react';
import type { Contract, ContractPayload } from '@/lib/api';
import { useLocale } from '@/lib/i18n/LocaleProvider';

const STATUSES = ['DRAFT', 'ACTIVE', 'EXPIRED', 'CANCELLED'] as const;

type UserOption = { id: string; name: string; email: string };

type Props = {
  mode: 'admin' | 'customer';
  initial?: Contract;
  customers?: UserOption[];
  vendors?: UserOption[];
  submitLabel?: string;
  onSubmit: (values: ContractPayload) => Promise<void>;
};

export function ContractForm({
  mode,
  initial,
  customers = [],
  vendors = [],
  submitLabel,
  onSubmit,
}: Props) {
  const { t } = useLocale();
  const statusLabels = t.admin.contracts.statuses;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    if (mode === 'customer') {
      await onSubmit({
        title: initial?.title || '',
        titleAr: String(form.get('titleAr') || '') || undefined,
        terms: String(form.get('terms') || '') || undefined,
      });
      return;
    }

    await onSubmit({
      title: String(form.get('title')),
      titleAr: String(form.get('titleAr') || '') || undefined,
      status: String(form.get('status') || 'DRAFT'),
      startDate: String(form.get('startDate') || '') || undefined,
      endDate: String(form.get('endDate') || '') || undefined,
      terms: String(form.get('terms') || '') || undefined,
      customerId: String(form.get('customerId') || '') || undefined,
      vendorId: String(form.get('vendorId') || '') || undefined,
    });
  }

  function dateValue(value?: string | null) {
    if (!value) return '';
    return new Date(value).toISOString().slice(0, 10);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
      {mode === 'admin' && (
        <label className="block text-sm">
          {t.admin.contracts.titleEn} *
          <input
            name="title"
            required
            defaultValue={initial?.title || ''}
            className="mt-1 w-full rounded-xl border border-[#e7e5e4] px-3 py-2"
          />
        </label>
      )}

      {mode === 'customer' && initial && (
        <div className="rounded-xl bg-[#faf6ef] px-4 py-3 text-sm">
          <p className="font-medium">{initial.title}</p>
          <p className="mt-1 text-[#78716c]">{t.account.contracts.readOnlyNote}</p>
        </div>
      )}

      <label className="block text-sm">
        {mode === 'admin' ? t.admin.contracts.titleAr : t.account.contracts.titleAr}
        <input
          name="titleAr"
          dir="rtl"
          defaultValue={initial?.titleAr || ''}
          className="mt-1 w-full rounded-xl border border-[#e7e5e4] px-3 py-2"
        />
      </label>

      {mode === 'admin' && (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <label className="block text-sm">
              {t.admin.contracts.status}
              <select
                name="status"
                defaultValue={initial?.status || 'DRAFT'}
                className="mt-1 w-full rounded-xl border border-[#e7e5e4] px-3 py-2"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {statusLabels[s]}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              {t.admin.contracts.startDate}
              <input
                name="startDate"
                type="date"
                defaultValue={dateValue(initial?.startDate)}
                className="mt-1 w-full rounded-xl border border-[#e7e5e4] px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              {t.admin.contracts.endDate}
              <input
                name="endDate"
                type="date"
                defaultValue={dateValue(initial?.endDate)}
                className="mt-1 w-full rounded-xl border border-[#e7e5e4] px-3 py-2"
              />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm">
              {t.admin.contracts.customer}
              <select
                name="customerId"
                defaultValue={initial?.customerId || ''}
                className="mt-1 w-full rounded-xl border border-[#e7e5e4] px-3 py-2"
              >
                <option value="">{t.admin.contracts.selectCustomer}</option>
                {customers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              {t.admin.contracts.vendor}
              <select
                name="vendorId"
                defaultValue={initial?.vendorId || ''}
                className="mt-1 w-full rounded-xl border border-[#e7e5e4] px-3 py-2"
              >
                <option value="">{t.admin.contracts.selectVendor}</option>
                {vendors.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>
            </label>
          </div>
        </>
      )}

      <label className="block text-sm">
        {mode === 'admin' ? t.admin.contracts.terms : t.account.contracts.terms}
        <textarea
          name="terms"
          rows={5}
          defaultValue={initial?.terms || ''}
          className="mt-1 w-full rounded-xl border border-[#e7e5e4] px-3 py-2"
        />
      </label>

      <button
        type="submit"
        className="rounded-xl bg-[#8a6a1f] px-6 py-2.5 text-white hover:bg-[#735818]"
      >
        {submitLabel || (mode === 'admin' ? t.admin.contracts.save : t.account.contracts.save)}
      </button>
    </form>
  );
}
