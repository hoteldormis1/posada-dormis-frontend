'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/index';
import Sidebar from './Sidebar';
import AprobacionesPopup from './AprobacionesPopup';
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
    '/reservas-publicas',
    '/confirmar-reserva',
  ];

  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(route + '/'));

  // Routes that show the top Navbar (logo + login button)
  const NAVBAR_ROUTES: string[] = [];
  const showNavbar = NAVBAR_ROUTES.some((route) => pathname === route || pathname.startsWith(route + '/'));

  useLayoutEffect(() => {
    if (!isPublicRoute && accessToken) {
      dispatch(fetchTiposUsuarios());
    }
  }, [isPublicRoute, accessToken, dispatch]);

  // Public pages: optional navbar on top, no sidebar
  if (isPublicRoute) {
    return (
      <div className="min-h-screen bg-background">
        {showNavbar && (
          <header className="layout-header">
            <Navbar />
          </header>
        )}
        {children}
      </div>
    );
  }

  const isCalendario = pathname?.startsWith('/admin/calendario');

  return (
    <div className="layout-grid">
      {/* Sidebar */}
      <Sidebar />

      {/* Right column */}
      <div className="layout-main flex flex-col">
        {/* Admin top bar */}
        <header className="h-16 shrink-0 flex items-center justify-end px-6 border-b border-white/10 bg-[#081f14]/90 backdrop-blur-xl sticky top-0 z-30">
          <AprobacionesPopup />
        </header>

        {/* Main Content */}
        <main className={`flex-1 ${isCalendario ? '' : 'px-4 py-6'}`}>
          {children}
        </main>
      </div>
    </div>
  );
}
