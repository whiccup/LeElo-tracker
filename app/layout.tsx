import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import AuthProvider from '@/components/auth/AuthProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'LeElo Tracker - Player Rankings',
  description:
    'Basketball league player rankings and Elo ratings tracker',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <div className="content-wrapper">
            <Header />
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
