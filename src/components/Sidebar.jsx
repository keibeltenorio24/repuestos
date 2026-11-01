import React from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Car, 
  FileText, 
  Settings, 
  AlertTriangle,
  Wrench
} from 'lucide-react';

export default function Sidebar({ currentView, setCurrentView, settings, parts = [], collapsed, setCollapsed }) {
  const lowStockCount = parts.filter(p => p.stock <= p.minStock).length;

  const navItems = [
    { id: 'dashboard', label: 'Panel Principal', icon: LayoutDashboard },
    { id: 'pos', label: 'Punto de Venta (POS)', icon: ShoppingCart, highlight: true },
    { id: 'inventory', label: 'Inventario de Repuestos', icon: Package, badge: parts.length },
    { id: 'vehicles', label: 'Buscador Vehicular', icon: Car },
    { id: 'sales', label: 'Ventas y Cotizaciones', icon: FileText },
    { id: 'settings', label: 'Configuración / Marca', icon: Settings },
  ];

  return (
    <aside style={{
      width: collapsed ? '80px' : 'var(--sidebar-width)',
      backgroundColor: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.2s ease',
      height: '100vh',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      userSelect: 'none'
    }}>
      {/* Brand Header with Neon Logo */}
      <div style={{
        padding: collapsed ? '14px 12px' : '16px 16px',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        background: 'linear-gradient(180deg, rgba(0, 229, 255, 0.06) 0%, transparent 100%)'
      }}>
        <div style={{
          width: '46px',
          height: '46px',
          borderRadius: '10px',
          overflow: 'hidden',
          border: '1.5px solid rgba(0, 229, 255, 0.55)',
          boxShadow: '0 0 14px rgba(0, 229, 255, 0.35)',
          flexShrink: 0,
          backgroundColor: '#040711',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <img 
            src="/logo.jpg" 
            alt="B&G Multiservicios Logo" 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
        </div>
        {!collapsed && (
          <div style={{ overflow: 'hidden' }}>
            <h1 className="brand-title" style={{
              fontSize: '1.05rem',
              fontWeight: 900,
              color: 'var(--text-primary)',
              lineHeight: 1.15,
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              overflow: 'hidden'
            }}>
              {settings.storeName || 'B&G Multiservicios'}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
              <span style={{
                fontSize: '0.66rem',
                fontWeight: 800,
                color: 'var(--primary)',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                textShadow: '0 0 10px rgba(255, 119, 0, 0.45)'
              }}>
                MULTISERVICIOS 2024
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Navigation List */}
      <nav style={{
        flex: 1,
        padding: '16px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        overflowY: 'auto'
      }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className="btn"
              title={collapsed ? item.label : undefined}
              style={{
                width: '100%',
                justifyContent: collapsed ? 'center' : 'flex-start',
                padding: collapsed ? '12px 0' : '11px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
                color: isActive ? 'var(--primary-hover)' : 'var(--text-secondary)',
                border: isActive ? '1px solid var(--border-accent)' : '1px solid transparent',
                fontWeight: isActive ? 600 : 500,
                transition: 'all 0.15s ease',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
            >
              <Icon size={20} style={{ flexShrink: 0 }} />
              {!collapsed && (
                <span style={{ flex: 1, textAlign: 'left', fontSize: '0.88rem' }}>
                  {item.label}
                </span>
              )}
              {!collapsed && item.badge !== undefined && (
                <span className="badge badge-primary mono" style={{ fontSize: '0.7rem', padding: '2px 7px' }}>
                  {item.badge}
                </span>
              )}
              {!collapsed && item.highlight && (
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--success)',
                  boxShadow: '0 0 8px var(--success)'
                }} />
              )}
            </button>
          );
        })}
      </nav>

      {/* Critical Stock Alert Box (Bottom) */}
      {!collapsed && lowStockCount > 0 && (
        <div style={{
          margin: '12px 14px',
          padding: '12px 14px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--warning-light)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <AlertTriangle size={18} color="var(--warning)" style={{ flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--warning)' }}>
              Stock Crítico ({lowStockCount})
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Repuestos por reponer
            </div>
          </div>
        </div>
      )}

      {/* Footer / Software info */}
      <div style={{
        padding: '14px 16px',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        fontSize: '0.74rem',
        color: 'var(--text-muted)'
      }}>
        {!collapsed ? (
          <>
            <div>
              <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>AutoPartes Pro</span>
              <div>v1.0 • Listo para venta</div>
            </div>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => setCollapsed(true)}
              style={{ padding: '4px 8px', fontSize: '0.7rem' }}
              title="Colapsar menú"
            >
              ◀
            </button>
          </>
        ) : (
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => setCollapsed(false)}
            style={{ padding: '6px 8px', fontSize: '0.7rem' }}
            title="Expandir menú"
          >
            ▶
          </button>
        )}
      </div>
    </aside>
  );
}
