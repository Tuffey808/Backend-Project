'use client';

import { useLocale } from '@/lib/i18n/LocaleProvider';

export function ContactSection() {
  const { t } = useLocale();

  return (
    <section id="contact" className="border-t border-[#e7e5e4] bg-[#faf6ef] px-4 py-16 md:px-6 md:py-20">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-medium text-[#8a6a1f]">{t.contact.label}</p>
        <h2 className="mt-1 text-3xl font-bold">{t.contact.title}</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-lg font-medium">📧 {t.contact.email}</p>
            <a href="mailto:sales@gmall.sa" className="mt-2 block text-[#8a6a1f] hover:underline">
              sales@gmall.sa
            </a>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-lg font-medium">🕒 {t.contact.hours}</p>
            <p className="mt-2 text-[#57534e]">{t.contact.hoursValue}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
