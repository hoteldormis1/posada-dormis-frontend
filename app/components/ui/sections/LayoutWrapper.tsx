'use client';

import { usePathname } from 'next/navigation';
import { Footerbar, Navbar } from '@/components/index';
import { useLayoutEffect } from 'react';
import { fetchTiposUsuarios } from '@/lib/store/utils';
import { AppDispatch } from '@/lib/store/store';
import { useAppDispatch } from '@/lib/store/hooks';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();
  const dispatch: AppDispatch = useAppDispatch();

  useLayoutEffect(() => {
    dispatch(fetchTiposUsuarios());
  }, []);

  // Rutas donde ocultar el navbar y footer
  const hideNavbar =
    pathname === '/' ||
    pathname === '/verificarCuenta' ||
    pathname === '/login' ||
    pathname === '/olvidarContrasena' || 
    pathname === '/resetPassword';

  const hideFooter = hideNavbar;

  // Si estamos en una ruta de login, usar layout simple
  if (hideNavbar) {
    return <div className="min-h-screen bg-background">{children}</div>;
  }

  // No agregar padding horizontal en calendario
  const isCalendario = pathname?.startsWith('/calendario');

  return (
    <div className="layout-grid bg-background">
      {/* Header/Navbar */}
      <header className="layout-header">
        <Navbar />
      </header>

      {/* Main Content */}
      <main className={`layout-main ${isCalendario ? '' : 'px-4 py-6'} `}>
        {children}
      </main>

      {/* Footer */}
      {!hideFooter && (
        <footer className="layout-footer">
          <Footerbar />
        </footer>
      )}
    </div>
  );
}
