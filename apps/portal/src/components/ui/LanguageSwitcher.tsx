'use client';

import { useLocale } from '@/lib/i18n/LocaleProvider';
import { localeMeta, type Locale } from '@/lib/i18n/translations';

export function LanguageSwitcher({
  className = '',
  dark = false,
}: {
  className?: string;
  dark?: boolean;
}) {
  const { locale, setLocale } = useLocale();

  return (
    <div
      className={`flex overflow-hidden rounded-xl border text-xs ${
        dark ? 'border-white/20' : 'border-[#d6d3d1]'
      } ${className}`}
    >
      {(['ar', 'en'] as Locale[]).map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLocale(code)}
          className={`px-3 py-1.5 transition ${
            locale === code
              ? 'bg-[#8a6a1f] text-white'
              : dark
                ? 'bg-transparent text-[#d6d3d1] hover:bg-white/10'
                : 'bg-white text-[#57534e] hover:bg-[#faf6ef]'
          }`}
          aria-label={localeMeta[code].label}
        >
          {code.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
