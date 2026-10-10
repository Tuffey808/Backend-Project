import type { Metadata } from 'next';
import { Inter, Tajawal } from 'next/font/google';
import { AppProviders } from '@/components/providers/AppProviders';
import { LOCALE_KEY } from '@/lib/i18n/translations';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const tajawal = Tajawal({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '700', '800'],
  variable: '--font-tajawal',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'G-MALL | Shop Saudi Arabia in One App',
  description:
    'G-MALL brings the best stores and brands in Saudi Arabia together. Shop easily, pay securely, and enjoy fast delivery.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var l=localStorage.getItem(${JSON.stringify(LOCALE_KEY)});if(l==='en'){document.documentElement.lang='en';document.documentElement.dir='ltr';}}catch(e){}})();`,
          }}
        />
      </head>
      <body className={`${inter.variable} ${tajawal.variable} antialiased`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
