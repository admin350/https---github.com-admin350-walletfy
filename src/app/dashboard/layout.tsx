'use client';
import type { ReactNode } from "react";
import { Header } from "@/components/layout/header";
import { DataProvider, useData } from "@/context/data-context";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { redirect } from "next/navigation";
import { cn } from "@/lib/utils";

const AppContent = ({ children }: { children: ReactNode }) => {
  const { isLoading, user, settings, previewBackground } = useData();

  useEffect(() => {
    if (!isLoading && !user) {
      redirect('/login');
    }
  }, [isLoading, user]);

  const backgroundClass = previewBackground || settings?.background || 'theme-gradient';

  useEffect(() => {
    document.body.className = cn("font-body antialiased", backgroundClass);
     return () => {
      // Cleanup effect when leaving the dashboard
      document.body.className = "font-body antialiased";
    };
  }, [backgroundClass]);

  if (isLoading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full">
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 bg-transparent p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
      <DataProvider>
        <AppContent>{children}</AppContent>
      </DataProvider>
  );
}
