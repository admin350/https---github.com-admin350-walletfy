'use client';

import type { ReactNode } from 'react';
import { useData } from '@/context/data-context';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { useEffect } from 'react';

export default function AppContent({ children }: { children: ReactNode }) {
  const { settings, previewBackground } = useData();
  const backgroundClass = previewBackground || settings?.background || 'theme-gradient';

  useEffect(() => {
    document.body.className = cn("font-body antialiased", backgroundClass);
  }, [backgroundClass]);

  return (
    <>
      {children}
      <Toaster />
    </>
  );
}
