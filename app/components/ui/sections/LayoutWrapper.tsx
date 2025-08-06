'use client';

import { usePathname } from 'next/navigation';
import { Footerbar, Navbar } from '@/components/index';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();

  // Rutas donde ocultar el footer
  const hideNavbar = pathname === '/' || pathname === '/login' || pathname === '/olvidarContrasena';

  // Rutas donde ocultar el navbar
  const hideFooter = pathname === '/perfil' || hideNavbar;

  return (
    <>
      {!hideNavbar && <Navbar />}
      {children}
      {!hideFooter && <Footerbar />}
    </>
  );
}
