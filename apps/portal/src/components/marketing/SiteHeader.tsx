'use client';

import Link from 'next/link';
import { useLocale } from '@/lib/i18n/LocaleProvider';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';

export function SiteHeader() {
  const { t } = useLocale();

  const links = [
    { href: '/#about', label: t.nav.about },
    { href: '/#services', label: t.nav.services },
    { href: '/join', label: t.nav.join },
    { href: '/#contact', label: t.nav.contact },
  ];

  return (
    <header className="site-header sticky top-0 z-50 border-b border-[#e7e5e4]/80 bg-[#faf6ef]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#8a6a1f] text-sm font-bold text-white">
            G
          </span>
          <span className="text-lg font-semibold tracking-tight">G-MALL</span>
        </Link>
        <nav className="hidden items-center gap-5 text-sm lg:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-[#57534e] hover:text-[#8a6a1f]">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <LanguageSwitcher className="hidden sm:flex" />
          <Link
            href="/login"
            className="hidden rounded-xl border border-[#d6d3d1] px-3 py-2 text-sm md:inline-block"
          >
            {t.nav.login}
          </Link>
          <Link
            href="/join"
            className="rounded-xl bg-[#8a6a1f] px-3 py-2 text-sm text-white hover:bg-[#735818] md:px-4"
          >
            {t.nav.join}
          </Link>
        </div>
      </div>
    </header>
  );
}
