'use client';

import { useLocale } from '@/lib/i18n/LocaleProvider';

export function ServicesSection() {
  const { t } = useLocale();

  return (
    <section id="services" className="px-4 py-16 md:px-6 md:py-20">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-medium text-[#8a6a1f]">{t.services.label}</p>
        <h2 className="mt-1 text-3xl font-bold md:text-4xl">{t.services.title}</h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {t.services.items.map((f) => (
            <article
              key={f.title}
              className="rounded-2xl border border-[#e7e5e4] bg-white p-6 shadow-sm transition hover:border-[#8a6a1f]/30 hover:shadow-md"
            >
              <h3 className="text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#57534e]">{f.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
