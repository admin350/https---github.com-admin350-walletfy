import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { DataProvider } from '@/context/data-context';
import { AppBody } from './app-body';


export const metadata: Metadata = {
  title: 'FA WALLET',
  description: 'Gestión financiera integral para necesidades personales, familiares y de negocios.',
  icons: {
    icon: '/favicon.ico',
  }
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <DataProvider>
        <AppBody>
            <Toaster />
            {children}
        </AppBody>
      </DataProvider>
    </html>
  );
}
