'use client';

import { usePathname } from 'next/navigation';
import { Footerbar, Navbar } from '..';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();

  const hideLayout = pathname === '/' || pathname === '/login' || pathname=== '/olvidarContrasena';

  return (
    <>
      {!hideLayout && <Navbar/>}
      {children}
      {!hideLayout && <Footerbar />}
    </>
  );
}
