'use client';

import Link from 'next/link';
import { useLocale } from '@/lib/i18n/LocaleProvider';

export function AboutSection() {
  const { t } = useLocale();

  return (
    <section id="about" className="border-y border-[#e7e5e4] bg-white px-4 py-16 md:px-6 md:py-20">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-medium text-[#8a6a1f]">{t.about.label}</p>
        <h2 className="mt-1 text-3xl font-bold md:text-4xl">{t.about.title}</h2>
        <p className="mt-6 text-lg leading-relaxed text-[#57534e]">{t.about.body}</p>
        <Link
          href="/join"
          className="mt-8 inline-block rounded-xl bg-[#8a6a1f] px-6 py-3 font-medium text-white hover:bg-[#735818]"
        >
          {t.about.cta}
        </Link>
      </div>
    </section>
  );
}
