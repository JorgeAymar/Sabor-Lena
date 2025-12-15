'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logout } from '@/app/actions/auth-actions';

const Sidebar = () => {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Normalize path to match IDs (e.g. /orders -> orders)
  const currentView = pathname === '/' ? 'dashboard' : pathname.replace('/', '');

  const menuItems = [
    { id: 'dashboard', icon: 'dashboard', label: 'Panel', path: '/' },
    { id: 'orders', icon: 'receipt_long', label: 'Pedidos', path: '/orders' },
    { id: 'menu', icon: 'restaurant_menu', label: 'Menú', path: '/menu' },
    { id: 'users', icon: 'manage_accounts', label: 'Usuarios', path: '/users' },
    { id: 'customers', icon: 'group', label: 'Clientes', path: '/customers' },
    { id: 'reports', icon: 'bar_chart', label: 'Informes', path: '/reports' },
    { id: 'inventory', icon: 'inventory_2', label: 'Inventario', path: '/inventory' },
    { id: 'settings', icon: 'settings', label: 'Configuración', path: '/settings' },
  ];

  return (
    <>
      {/* Mobile Toggle Button (Visible only on mobile) */}
      <button 
        className="fixed top-4 left-4 z-40 p-2 bg-white rounded-lg shadow-md md:hidden"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        <span className="material-symbols-outlined">menu</span>
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-[#e6e0db] flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 md:static
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 flex flex-col h-full">
          {/* Brand */}
          <div className="flex items-center gap-3 mb-8 px-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500 text-white">
              <span className="material-symbols-outlined">restaurant_menu</span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-bold leading-tight text-gray-800">Sabor & Leña</h1>
              <p className="text-sm font-normal text-gray-500">Admin Panel</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-2 flex-1">
            {menuItems.map((item) => {
              const isActive = currentView === item.id;
              return (
                <Link
                  key={item.id}
                  href={item.path}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${
                    isActive
                      ? 'bg-orange-500/10 text-orange-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className={`material-symbols-outlined ${isActive ? 'fill-1' : ''}`}>
                    {item.icon}
                  </span>
                  <p className={`text-sm ${isActive ? 'font-bold' : 'font-medium'}`}>
                    {item.label}
                  </p>
                </Link>
              );
            })}
          </nav>

          {/* User Info */}
          <div className="flex flex-col gap-2 pt-4 border-t border-[#e6e0db]">
            <div className="flex items-center gap-3 rounded-lg px-3 py-2 mt-2">
              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                <span className="material-symbols-outlined">person</span>
              </div>
              <div className="flex flex-col text-left">
                <p className="text-sm font-medium text-gray-800">Admin User</p>
                <p className="text-xs font-normal text-gray-500">Gerente</p>
              </div>
            </div>
            
            <button
              onClick={() => logout()}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-red-600 hover:bg-red-50 transition-colors w-full text-left mt-1"
            >
              <span className="material-symbols-outlined">logout</span>
              <p className="text-sm font-medium">Cerrar Sesión</p>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
