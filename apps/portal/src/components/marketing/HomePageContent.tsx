'use client';

import { SiteHeader } from '@/components/marketing/SiteHeader';
import { SiteFooter } from '@/components/marketing/SiteFooter';
import { HeroSection } from '@/components/marketing/HeroSection';
import { AboutSection } from '@/components/marketing/AboutSection';
import { ServicesSection } from '@/components/marketing/ServicesSection';
import { MerchantCtaSection } from '@/components/marketing/MerchantCtaSection';
import { ContactSection } from '@/components/marketing/ContactSection';
import { useLocale } from '@/lib/i18n/LocaleProvider';

export function HomePageContent() {
  const { t } = useLocale();

  return (
    <div className="site-page min-h-screen">
      <SiteHeader />
      <HeroSection />
      <AboutSection />
      <ServicesSection />
      <MerchantCtaSection />
      <section id="download" className="px-4 py-12 md:px-6">
        <div className="mx-auto max-w-6xl rounded-2xl border border-dashed border-[#d6d3d1] bg-white/60 p-8 text-center">
          <h2 className="text-xl font-bold">{t.download.title}</h2>
          <p className="mt-2 text-[#57534e]">{t.download.body}</p>
        </div>
      </section>
      <ContactSection />
      <SiteFooter />
    </div>
  );
}
