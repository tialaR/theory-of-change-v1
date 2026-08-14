import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { TdmMotionProvider } from '@/shared/motion/tdm-motion';
import './globals.sass';

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
    <html lang="pt-BR">
      <body>
        <NextIntlClientProvider>
          <TdmMotionProvider>{children}</TdmMotionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
