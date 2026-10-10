'use client';

import Link from 'next/link';
import { useLocale } from '@/lib/i18n/LocaleProvider';

export function HeroSection() {
  const { t } = useLocale();

  return (
    <section className="relative overflow-hidden px-4 py-16 md:px-6 md:py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(138,106,31,0.15),transparent_45%)]" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
        <div>
          <p className="mb-3 text-sm tracking-[0.15em] text-[#8a6a1f] uppercase">{t.hero.tag}</p>
          <h1 className="text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
            {t.hero.title1}
            <br />
            <span className="text-[#8a6a1f]">{t.hero.title2}</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-[#57534e]">{t.hero.subtitle}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#download"
              className="rounded-xl bg-[#1c1917] px-5 py-3 text-sm font-medium text-white hover:bg-[#292524]"
            >
               {t.hero.appStore}
            </a>
            <a
              href="#download"
              className="rounded-xl border border-[#d6d3d1] bg-white px-5 py-3 text-sm font-medium hover:bg-[#faf6ef]"
            >
              ▶ {t.hero.googlePlay}
            </a>
            <Link
              href="/join"
              className="rounded-xl bg-[#8a6a1f] px-5 py-3 text-sm font-medium text-white hover:bg-[#735818]"
            >
              {t.nav.join}
            </Link>
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          <div className="rounded-[2rem] border border-[#e7e5e4] bg-white p-4 shadow-2xl shadow-[#8a6a1f]/10">
            <div className="aspect-[9/16] overflow-hidden rounded-[1.5rem] bg-gradient-to-b from-[#faf6ef] to-[#e7e5e4]">
              <div className="flex h-full flex-col p-6">
                <p className="text-xs font-semibold text-[#8a6a1f]">G-MALL</p>
                <p className="mt-2 text-2xl font-bold">{t.hero.mockTitle}</p>
                <div className="mt-6 grid flex-1 grid-cols-2 gap-3">
                  {t.hero.mockCats.map((cat) => (
                    <div
                      key={cat}
                      className="rounded-2xl bg-white/80 p-4 text-center text-sm font-medium shadow-sm"
                    >
                      {cat}
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-2xl bg-[#8a6a1f] py-3 text-center text-sm font-medium text-white">
                  {t.hero.mockDeals}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
