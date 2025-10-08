'use client';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function RootPage() {
  useEffect(() => {
    redirect('/login');
  }, []);

  return null; // Render nothing while redirecting
}
