'use client';

import { SiteFooter } from '@/components/marketing/SiteFooter';
import { SiteHeader } from '@/components/marketing/SiteHeader';
import { useLocale } from '@/lib/i18n/LocaleProvider';

export default function PrivacyPage() {
  const { t } = useLocale();
  const p = t.privacy;

  return (
    <div className="site-page min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-12 md:px-6 md:py-16">
        <h1 className="text-3xl font-bold">{p.title}</h1>
        <p className="mt-2 text-sm text-[#78716c]">{p.updated}</p>
        <div className="mt-8 space-y-6">
          {p.sections.map((section) => (
            <section key={section.h}>
              <h2 className="text-lg font-semibold">{section.h}</h2>
              <p className="mt-2 leading-relaxed text-[#57534e]">{section.p}</p>
            </section>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
