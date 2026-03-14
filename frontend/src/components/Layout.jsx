import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { LayoutDashboard, ShoppingCart, Map, Users, Package, DollarSign, LogOut, Wallet, Menu, X } from 'lucide-react';
import BrandMark from './BrandMark';

export default function Layout({ children, user, onLogout }) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const nav = [
    { path: '/', label: 'Inicio', icon: LayoutDashboard, roles: ['admin'] },
    { path: '/pedidos', label: 'Pedidos', icon: ShoppingCart, roles: ['admin', 'repartidor'] },
    { path: '/rutas', label: 'Rutas', icon: Map, roles: ['admin', 'repartidor'] },
    { path: '/clientes', label: 'Clientes', icon: Users, roles: ['admin'] },
    { path: '/inventario', label: 'Inventario', icon: Package, roles: ['admin'] },
    { path: '/ventas', label: 'Ventas', icon: DollarSign, roles: ['admin'] },
    { path: '/gastos', label: 'Gastos', icon: Wallet, roles: ['admin'] },
  ];

  const filteredNav = nav.filter(item => item.roles.includes(user.rol));

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b border-slate-200 h-14 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
            <BrandMark size={16} />
          </div>
          <span className="font-semibold text-slate-800 brand-title">Purificadora Diamante</span>
        </div>
        <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-slate-100">
          <Menu size={20} />
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col transform transition-transform duration-200 lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
            <BrandMark size={18} />
          </div>
          <h2 className="text-xl font-bold text-slate-800 brand-title">Purificadora Diamante</h2>
          <button onClick={() => setSidebarOpen(false)} className="ml-auto p-2 rounded-lg hover:bg-slate-100 lg:hidden">
            <X size={18} />
          </button>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          {filteredNav.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon size={20} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200">
          <div className="mb-4 px-4">
            <p className="text-sm font-medium text-slate-900">{user.nombre}</p>
            <p className="text-xs text-slate-500 capitalize">{user.rol}</p>
          </div>
          <button 
            onClick={onLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={20} />
            Salir
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/40 z-30 lg:hidden"
          aria-label="Cerrar menu"
        />
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white border-b border-slate-200 px-4 lg:px-8 py-4 flex justify-between items-center mt-14 lg:mt-0">
          <h1 className="text-xl font-semibold text-slate-800 capitalize">
            {location.pathname.replace('/', '') || 'Inicio'}
          </h1>
          <div className="text-sm text-slate-500">
            {new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
        </header>
        
        <div className="flex-1 overflow-auto p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
