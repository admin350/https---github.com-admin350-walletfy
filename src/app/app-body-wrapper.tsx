
'use client';
import { useData } from '@/context/data-context';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

export const AppBodyWrapper = ({ children }: { children: ReactNode }) => {
  const { settings, previewBackground } = useData();
  const backgroundClass = previewBackground || settings.background || 'theme-gradient';
  
  return (
    <body className={cn("font-body antialiased", backgroundClass)}>
      {children}
    </body>
  );
};
