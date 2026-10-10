'use client';

import Link from 'next/link';
import { useLocale } from '@/lib/i18n/LocaleProvider';

export function MerchantCtaSection() {
  const { t } = useLocale();

  return (
    <section className="px-4 py-16 md:px-6 md:py-20">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl bg-[#1c1917] px-6 py-12 text-[#fafaf9] md:px-12 md:py-16">
        <div className="grid gap-8 md:grid-cols-2 md:items-center">
          <div>
            <p className="text-sm text-[#d6d3d1]">{t.merchant.label}</p>
            <h2 className="mt-1 text-3xl font-bold">{t.merchant.title}</h2>
            <p className="mt-4 leading-relaxed text-[#a8a29e]">{t.merchant.body}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row md:justify-end">
            <Link
              href="/join"
              className="rounded-xl bg-[#8a6a1f] px-6 py-3 text-center font-medium text-white hover:bg-[#735818]"
            >
              {t.merchant.cta}
            </Link>
            <a
              href="mailto:sales@gmall.sa"
              className="rounded-xl border border-white/20 px-6 py-3 text-center hover:bg-white/10"
            >
              sales@gmall.sa
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
