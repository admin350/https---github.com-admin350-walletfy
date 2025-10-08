
'use client';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardRedirectPage() {
  useEffect(() => {
    redirect('/dashboard/dashboard');
  }, []);

  return null; 
}
