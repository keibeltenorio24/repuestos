import React, { useEffect } from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  FileText, 
  Settings, 
  AlertTriangle,
  X
} from 'lucide-react';

export default function Sidebar({ 
  currentView, 
  setCurrentView, 
  settings, 
  parts = [], 
  collapsed, 
  setCollapsed,
  isMobileOpen = false,
  onCloseMobile
}) {
  const lowStockCount = parts.filter(p => p.stock <= p.minStock).length;

  const navItems = [
    { id: 'dashboard', label: 'Panel Principal', icon: LayoutDashboard },
    { id: 'pos', label: 'Punto de Venta (POS)', icon: ShoppingCart, highlight: true },
    { id: 'inventory', label: 'Inventario de Repuestos', icon: Package, badge: parts.length },
    { id: 'sales', label: 'Ventas y Cotizaciones', icon: FileText },
    { id: 'settings', label: 'Configuración / Marca', icon: Settings },
  ];

  // Cerrar con Escape en móvil
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isMobileOpen && onCloseMobile) {
        onCloseMobile();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileOpen, onCloseMobile]);

  const handleNavClick = (viewId) => {
    setCurrentView(viewId);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const sidebarContent = (isMobileMode = false) => (
    <aside 
      style={{
        width: isMobileMode ? '280px' : (collapsed ? '72px' : 'var(--sidebar-width)'),
        minWidth: isMobileMode ? '280px' : (collapsed ? '72px' : 'var(--sidebar-width)'),
        flexShrink: 0,
        backgroundColor: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.2s ease, min-width 0.2s ease, transform 0.25s ease',
        height: '100vh',
        position: isMobileMode ? 'fixed' : 'sticky',
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: isMobileMode ? 9999 : 100,
        userSelect: 'none',
        overflow: 'hidden',
        boxShadow: isMobileMode ? '4px 0 24px rgba(0,0,0,0.6)' : 'none'
      }}
    >
      {/* Brand Header with Neon Logo */}
      <div style={{
        height: 'var(--header-height)',
        padding: (!isMobileMode && collapsed) ? '0 8px' : '0 14px',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: (!isMobileMode && collapsed) ? 'center' : 'space-between',
        gap: '10px',
        flexShrink: 0,
        background: 'linear-gradient(180deg, rgba(0, 229, 255, 0.06) 0%, transparent 100%)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden', minWidth: 0 }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            overflow: 'hidden',
            border: '1.5px solid rgba(0, 229, 255, 0.55)',
            boxShadow: '0 0 10px rgba(0, 229, 255, 0.3)',
            flexShrink: 0,
            backgroundColor: '#040711',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <img 
              src={settings?.logoUrl || "/logo.jpg"} 
              alt="Logo" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          </div>
          {(isMobileMode || !collapsed) && (
            <div style={{ overflow: 'hidden', minWidth: 0 }}>
              <h1 className="brand-title" style={{
                fontSize: '0.92rem',
                fontWeight: 900,
                color: 'var(--text-primary)',
                lineHeight: 1.15,
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                overflow: 'hidden'
              }}>
                {settings.storeName || 'B&G Multiservicios'}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '1px' }}>
                <span style={{
                  fontSize: '0.6rem',
                  fontWeight: 800,
                  color: 'var(--primary)',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  textShadow: '0 0 10px rgba(255, 119, 0, 0.45)'
                }}>
                  SISTEMA DE REPUESTOS
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Close button for mobile drawer */}
        {isMobileMode && (
          <button 
            className="btn btn-secondary btn-icon btn-sm"
            onClick={onCloseMobile}
            title="Cerrar menú"
            style={{ flexShrink: 0, width: '32px', height: '32px' }}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <nav style={{
        flex: 1,
        padding: '12px 10px',
        display: 'flex',
        flexDirection: 'column',
        gap: '5px',
        overflowY: 'auto',
        overflowX: 'hidden'
      }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          const showFullLabel = isMobileMode || !collapsed;

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className="btn"
              title={(!isMobileMode && collapsed) ? item.label : undefined}
              style={{
                width: '100%',
                justifyContent: (!isMobileMode && collapsed) ? 'center' : 'flex-start',
                padding: (!isMobileMode && collapsed) ? '10px 0' : '10px 12px',
                gap: '10px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
                color: isActive ? 'var(--primary-hover)' : 'var(--text-secondary)',
                border: isActive ? '1px solid var(--border-accent)' : '1px solid transparent',
                fontWeight: isActive ? 700 : 500,
                transition: 'all 0.15s ease',
                position: 'relative',
                overflow: 'hidden'
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
              <Icon size={18} style={{ flexShrink: 0 }} />
              {showFullLabel && (
                <span style={{ 
                  flex: 1, 
                  textAlign: 'left', 
                  fontSize: '0.82rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {item.label}
                </span>
              )}
              {showFullLabel && item.badge !== undefined && item.badge > 0 && (
                <span className="badge badge-primary mono" style={{ fontSize: '0.66rem', padding: '1px 6px', flexShrink: 0 }}>
                  {item.badge}
                </span>
              )}
              {showFullLabel && item.highlight && (
                <span style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--success)',
                  boxShadow: '0 0 8px var(--success)',
                  flexShrink: 0
                }} />
              )}
            </button>
          );
        })}
      </nav>

      {/* Critical Stock Alert Box (Bottom) */}
      {(isMobileMode || !collapsed) && lowStockCount > 0 && (
        <div style={{
          margin: '8px 10px',
          padding: '9px 12px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--warning-light)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flexShrink: 0
        }}>
          <AlertTriangle size={16} color="var(--warning)" style={{ flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--warning)' }}>
              Stock Crítico ({lowStockCount})
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
              Repuestos por reponer
            </div>
          </div>
        </div>
      )}

      {/* Footer / Software info */}
      <div style={{
        padding: '10px 12px',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: (!isMobileMode && collapsed) ? 'center' : 'space-between',
        fontSize: '0.7rem',
        color: 'var(--text-muted)',
        flexShrink: 0
      }}>
        {(!isMobileMode && collapsed) ? (
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => setCollapsed(false)}
            style={{ padding: '4px 8px', fontSize: '0.68rem' }}
            title="Expandir menú"
          >
            ▶
          </button>
        ) : (
          <>
            <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>AutoPartes Pro</span>
              <div>v1.0 • Sistema POS</div>
            </div>
            {!isMobileMode && (
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => setCollapsed(true)}
                style={{ padding: '3px 7px', fontSize: '0.68rem', flexShrink: 0 }}
                title="Colapsar menú"
              >
                ◀
              </button>
            )}
          </>
        )}
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="desktop-only" style={{ flexShrink: 0 }}>
        {sidebarContent(false)}
      </div>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="mobile-only" style={{ display: 'contents' }}>
          <div 
            className="drawer-backdrop" 
            onClick={onCloseMobile}
            aria-label="Cerrar menú"
          />
          {sidebarContent(true)}
        </div>
      )}
    </>
  );
}
