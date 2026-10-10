'use client';

import Link from 'next/link';
import { useLocale } from '@/lib/i18n/LocaleProvider';

export function SiteFooter() {
  const { t } = useLocale();

  return (
    <footer className="border-t border-[#e7e5e4] bg-[#1c1917] text-[#d6d3d1]">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 md:flex-row md:items-center md:justify-between md:px-6">
        <div>
          <p className="text-lg font-semibold text-white">G-MALL</p>
          <p className="mt-1 text-sm">{t.footer.tagline}</p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          <Link href="/#about" className="hover:text-white">
            {t.nav.about}
          </Link>
          <Link href="/join" className="hover:text-white">
            {t.nav.join}
          </Link>
          <Link href="/login" className="hover:text-white">
            {t.footer.login}
          </Link>
          <Link href="/privacy" className="hover:text-white">
            {t.footer.privacy}
          </Link>
          <a href="mailto:sales@gmall.sa" className="hover:text-white">
            sales@gmall.sa
          </a>
        </div>
        <p className="text-xs text-[#78716c]">© G-MALL</p>
      </div>
    </footer>
  );
}
