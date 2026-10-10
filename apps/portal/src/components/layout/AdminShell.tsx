'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { clearSession } from '@/lib/session';
import type { AuthUser } from '@/lib/api';
import { useLocale } from '@/lib/i18n/LocaleProvider';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';

export function AdminShell({
  user,
  children,
}: {
  user: AuthUser;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { t, dir } = useLocale();
  const a = t.admin;

  const nav = [
    { href: '/admin', label: a.nav.dashboard, icon: '◉' },
    { href: '/admin/products', label: a.nav.products, icon: '▣' },
    { href: '/admin/products/new', label: a.nav.addProduct, icon: '＋' },
    { href: '/admin/approvals', label: a.nav.approvals, icon: '✓' },
    { href: '/admin/vendor-applications', label: a.nav.vendorApplications, icon: '✉' },
    { href: '/admin/vendors', label: a.nav.vendors, icon: '◈' },
    { href: '/admin/contracts', label: a.nav.contracts, icon: '▤' },
    { href: '/admin/customers', label: a.nav.customers, icon: '◎' },
    { href: '/admin/categories', label: a.nav.categories, icon: '▦' },
    { href: '/admin/coupons', label: a.nav.coupons, icon: '◷' },
    { href: '/admin/orders', label: a.nav.orders, icon: '▧' },
    { href: '/admin/finance', label: a.nav.finance, icon: '₪' },
    { href: '/admin/returns', label: a.nav.returns, icon: '↩' },
    { href: '/admin/disputes', label: a.nav.disputes, icon: '⚠' },
  ];

  return (
    <div
      className={`portal-shell min-h-screen md:flex ${dir === 'rtl' ? 'md:flex-row-reverse' : 'md:flex-row'}`}
    >
      <aside className="portal-sidebar w-full shrink-0 border-b border-[#d6d3d1] bg-[#1c1917] text-[#fafaf9] md:w-64 md:border-b-0 md:border-e">
        <div className="border-b border-white/10 px-5 py-6">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="text-xs tracking-[0.25em] text-[#d6d3d1] uppercase">G-mall</p>
            <LanguageSwitcher dark className="hidden md:flex" />
          </div>
          <h1 className="mt-1 text-lg font-semibold">{a.shell.title}</h1>
          <p className="mt-1 truncate text-xs text-[#a8a29e]">{user.name || user.email}</p>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 py-4 md:block md:space-y-1 md:overflow-visible">
          {nav.map((item) => {
            const active =
              item.href === '/admin'
                ? pathname === '/admin'
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-sm transition md:w-full ${
                  active
                    ? 'bg-[#8a6a1f] text-white'
                    : 'text-[#d6d3d1] hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="text-base opacity-80">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="hidden border-t border-white/10 p-4 md:block">
          <button
            type="button"
            className="w-full rounded-xl border border-white/20 px-3 py-2 text-sm text-[#d6d3d1] hover:bg-white/10"
            onClick={() => {
              clearSession();
              router.push('/');
            }}
          >
            {a.shell.logout}
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-[#e7e5e4] bg-white/80 px-6 py-4 backdrop-blur md:hidden">
          <div>
            <p className="text-xs text-[#78716c]">{a.shell.welcome}</p>
            <p className="font-medium">{user.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <button
              type="button"
              className="rounded-xl border border-[#d6d3d1] px-3 py-1.5 text-sm"
              onClick={() => {
                clearSession();
                router.push('/');
              }}
            >
              {a.shell.logoutShort}
            </button>
          </div>
        </header>
        <div className="hidden border-b border-[#e7e5e4] bg-white/80 px-8 py-3 backdrop-blur md:flex md:justify-end">
          <LanguageSwitcher />
        </div>
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
