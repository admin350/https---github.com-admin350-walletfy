
'use client';
import type { ReactNode } from "react";
import { Header } from "@/components/layout/header";
import { DataProvider } from "@/context/data-context";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <DataProvider>
      <div className="flex min-h-screen w-full">
        <div className="flex flex-1 flex-col">
          <Header />
          <main className="flex-1 bg-background p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </DataProvider>
  );
}
