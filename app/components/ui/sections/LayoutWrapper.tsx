'use client';

import { usePathname } from 'next/navigation';
import { Footerbar, Navbar } from '@/components/index';
import { useLayoutEffect } from 'react';
import { fetchTiposUsuarios } from '@/lib/store/utils';
import { AppDispatch, RootState } from '@/lib/store/store';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();
  const dispatch: AppDispatch = useAppDispatch();
  const { accessToken } = useAppSelector((state: RootState) => state.user);

  const PUBLIC_ROUTES = [
    '/',
    '/verificarCuenta',
    '/login',
    '/olvidarContrasena',
    '/resetPassword',
  ];

  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname === route);

  useLayoutEffect(() => {
    if (!isPublicRoute && accessToken) {
      dispatch(fetchTiposUsuarios());
    }
  }, [isPublicRoute, accessToken, dispatch]);

  const hideNavbar =
    pathname === '/' ||
    pathname === '/verificarCuenta' ||
    pathname === '/login' ||
    pathname === '/olvidarContrasena' || 
    pathname === '/resetPassword';

  const hideFooter = hideNavbar;

  if (hideNavbar) {
    return <div className="min-h-screen bg-background">{children}</div>;
  }

  const isCalendario = pathname?.startsWith('/admin/calendario');

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
