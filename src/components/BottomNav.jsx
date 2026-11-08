import React from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  FileText, 
  Menu 
} from 'lucide-react';

export default function BottomNav({ 
  currentView, 
  setCurrentView, 
  onOpenMenu, 
  cartCount = 0,
  lowStockCount = 0 
}) {
  const tabs = [
    { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard },
    { id: 'pos', label: 'Mostrador', icon: ShoppingCart, badge: cartCount > 0 ? cartCount : null, badgeColor: 'var(--primary)' },
    { id: 'inventory', label: 'Repuestos', icon: Package, badge: lowStockCount > 0 ? lowStockCount : null, badgeColor: 'var(--warning)' },
    { id: 'sales', label: 'Ventas', icon: FileText }
  ];

  return (
    <nav className="bottom-nav no-print" aria-label="Navegación móvil">
      {tabs.map(tab => {
        const Icon = tab.icon;
        const isActive = currentView === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => setCurrentView(tab.id)}
            className={`bottom-nav-item ${isActive ? 'active' : ''}`}
            aria-current={isActive ? 'page' : undefined}
          >
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
              {tab.badge && (
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-8px',
                  backgroundColor: tab.badgeColor || 'var(--primary)',
                  color: '#ffffff',
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  minWidth: '15px',
                  height: '15px',
                  borderRadius: 'var(--radius-full)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 3px',
                  boxShadow: '0 0 6px rgba(0,0,0,0.4)'
                }}>
                  {tab.badge}
                </span>
              )}
            </div>
            <span>{tab.label}</span>
          </button>
        );
      })}

      {/* Button to open full drawer menu */}
      <button
        onClick={onOpenMenu}
        className="bottom-nav-item"
        title="Más opciones y configuración"
      >
        <Menu size={20} strokeWidth={1.8} />
        <span>Menú</span>
      </button>
    </nav>
  );
}
