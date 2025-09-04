'use client';
import type { ReactNode } from "react";
import { Header } from "@/components/layout/header";
import { DataProvider } from "@/context/data-context";
import { useAuth } from "@/context/auth-context";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if loading is finished and there's no user.
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);
  
  // While loading, or if there's no user after loading, show a loader.
  // This prevents a flash of the dashboard content before redirection.
  if (loading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If loading is finished and a user exists, render the dashboard.
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
