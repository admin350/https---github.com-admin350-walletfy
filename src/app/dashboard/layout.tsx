'use client';
import type { ReactNode } from "react";
import { Header } from "@/components/layout/header";
import { useData } from "@/context/data-context";
import { Loader2 } from "lucide-react";

const AppContent = ({ children }: { children: ReactNode }) => {
  const { isLoading: dataLoading } = useData();

  if (dataLoading) {
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
        <main className="flex-1 bg-background p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
      <AppContent>{children}</AppContent>
  );
}
