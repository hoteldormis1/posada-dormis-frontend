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

  // Lista de rutas públicas (debe coincidir con AuthProvider)
  const PUBLIC_ROUTES = [
    '/',
    '/verificarCuenta',
    '/login',
    '/olvidarContrasena',
    '/resetPassword',
    '/reservas-publicas',
  ];

  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname === route);

  useLayoutEffect(() => {
    // Solo cargar tipos de usuario si NO estamos en una ruta pública
    if (!isPublicRoute) {
      dispatch(fetchTiposUsuarios());
    }
  }, [isPublicRoute, dispatch]);

  // Rutas donde ocultar el navbar y footer
  const hideNavbar =
    pathname === '/' ||
    pathname === '/verificarCuenta' ||
    pathname === '/login' ||
    pathname === '/olvidarContrasena' || 
    pathname === '/resetPassword' ||
    pathname === '/reservas-publicas';

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
