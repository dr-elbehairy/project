import './globals.css';
import type { Metadata } from 'next';
import { AuthProvider } from '@/lib/db/auth-context';

export const metadata: Metadata = {
  title: 'واكب - منصة موائمة المناهج الأكاديمية',
  description:
    'منصة واكب لقياس موائمة المناهج الأكاديمية مع متطلبات سوق العمل والمعايير العالمية',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
