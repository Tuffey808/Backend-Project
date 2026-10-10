'use client';

import Link from 'next/link';
import type { Contract } from '@/lib/api';
import { Badge } from '@/components/ui/Badge';
import { useLocale } from '@/lib/i18n/LocaleProvider';

type Props = {
  contract: Contract;
  mode: 'admin' | 'customer';
  editHref?: string;
  backHref: string;
};

function formatDate(value?: string | null, locale?: string) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US');
}

export function ContractDetailView({ contract, mode, editHref, backHref }: Props) {
  const { t, locale } = useLocale();
  const labels = mode === 'admin' ? t.admin.contracts : t.account.contracts;
  const statusLabels = t.admin.contracts.statuses;
  const statusKey = contract.status as keyof typeof statusLabels;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link href={backHref} className="text-sm text-[#8a6a1f] hover:underline">
          ← {labels.back}
        </Link>
        {editHref && (
          <Link
            href={editHref}
            className="rounded-xl border border-[#d6d3d1] px-4 py-2 text-sm hover:bg-white"
          >
            {labels.edit}
          </Link>
        )}
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">{contract.title}</h1>
            {contract.titleAr && (
              <p className="mt-1 text-lg text-[#57534e]" dir="rtl">
                {contract.titleAr}
              </p>
            )}
          </div>
          <Badge label={statusLabels[statusKey] || contract.status} />
        </div>

        <dl className="grid gap-4 sm:grid-cols-2">
          {mode === 'admin' && (
            <>
              <div>
                <dt className="text-xs text-[#78716c]">{t.admin.contracts.customer}</dt>
                <dd className="mt-1 font-medium">
                  {contract.customer?.name || t.admin.contracts.noCustomer}
                </dd>
                {contract.customer?.email && (
                  <dd className="text-sm text-[#57534e]">{contract.customer.email}</dd>
                )}
              </div>
              <div>
                <dt className="text-xs text-[#78716c]">{t.admin.contracts.vendor}</dt>
                <dd className="mt-1 font-medium">
                  {contract.vendor?.name || t.admin.contracts.noVendor}
                </dd>
                {contract.vendor?.email && (
                  <dd className="text-sm text-[#57534e]">{contract.vendor.email}</dd>
                )}
              </div>
            </>
          )}
          <div>
            <dt className="text-xs text-[#78716c]">{labels.startDate}</dt>
            <dd className="mt-1">{formatDate(contract.startDate, locale)}</dd>
          </div>
          <div>
            <dt className="text-xs text-[#78716c]">{labels.endDate}</dt>
            <dd className="mt-1">{formatDate(contract.endDate, locale)}</dd>
          </div>
          <div>
            <dt className="text-xs text-[#78716c]">{labels.created}</dt>
            <dd className="mt-1">{formatDate(contract.createdAt, locale)}</dd>
          </div>
        </dl>

        {contract.terms && (
          <div className="mt-6 border-t border-[#e7e5e4] pt-4">
            <p className="text-xs text-[#78716c]">{labels.terms}</p>
            <p className="mt-2 whitespace-pre-wrap leading-relaxed text-[#44403c]">
              {contract.terms}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
