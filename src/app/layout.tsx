import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Inter } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { TdmMotionProvider } from '@/shared/motion/tdm-motion';
import './globals.sass';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--tdm-font-sans'
});

export const metadata: Metadata = {
  title: 'Teoria da Mudança',
  description: 'TDM Flow Builder V1'
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body>
        <NextIntlClientProvider>
          <TdmMotionProvider>{children}</TdmMotionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
