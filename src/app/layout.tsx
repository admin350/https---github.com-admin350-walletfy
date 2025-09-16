import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { DataProvider, useData } from '@/context/data-context';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

// Metadata no puede ser 'use client', así que la definimos fuera
export const metadata: Metadata = {
  title: 'FA WALLET',
  description: 'Gestión financiera integral para necesidades personales, familiares y de negocios.',
  icons: {
    icon: '/favicon.ico',
  }
};

// Un componente cliente para manejar la clase del body y el contenido
function AppContent({ children }: { children: ReactNode }) {
  const { settings, previewBackground } = useData();
  const backgroundClass = previewBackground || settings?.background || 'theme-gradient';

  return (
    <body className={cn("font-body antialiased", backgroundClass)}>
      {children}
      <Toaster />
    </body>
  );
}


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
        <AppContent>{children}</AppContent>
      </DataProvider>
    </html>
  );
}
