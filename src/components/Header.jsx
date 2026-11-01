import React from 'react';
import { 
  Sun, 
  Moon, 
  Bell, 
  Car, 
  X, 
  User,
  Menu
} from 'lucide-react';

export default function Header({ 
  settings, 
  theme, 
  toggleTheme, 
  parts = [], 
  onOpenAlerts, 
  activeVehicle, 
  onClearVehicle,
  currentView,
  setCurrentView,
  onOpenMobileMenu
}) {
  const lowStockCount = parts.filter(p => p.stock <= p.minStock).length;

  const viewTitles = {
    dashboard: 'Panel General',
    pos: 'Punto de Venta (POS)',
    inventory: 'Inventario de Repuestos',
    vehicles: 'Compatibilidad Vehicular',
    sales: 'Ventas y Cotizaciones',
    settings: 'Configuración de Tienda'
  };

  return (
    <header style={{
      height: 'var(--header-height)',
      backgroundColor: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border-color)',
      padding: '0 clamp(10px, 3vw, 24px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 90,
      gap: '10px'
    }}>
      {/* Left: Hamburger (mobile) + View Title & Active Vehicle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden', minWidth: 0 }}>
        {/* Mobile Hamburger Button */}
        <button
          className="btn btn-secondary btn-icon mobile-only"
          onClick={onOpenMobileMenu}
          title="Abrir menú"
          style={{ width: '36px', height: '36px', flexShrink: 0 }}
        >
          <Menu size={20} />
        </button>

        {/* Small Logo */}
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          overflow: 'hidden',
          border: '1px solid rgba(0, 229, 255, 0.45)',
          boxShadow: '0 0 8px rgba(0, 229, 255, 0.25)',
          flexShrink: 0,
          backgroundColor: '#050811'
        }}>
          <img src="/logo.jpg" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>

        <div style={{ minWidth: 0, overflow: 'hidden' }}>
          <h2 style={{ 
            fontSize: 'clamp(0.95rem, 3.5vw, 1.18rem)', 
            fontWeight: 800, 
            color: 'var(--text-primary)',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            lineHeight: 1.2
          }}>
            {viewTitles[currentView] || 'B&G Multiservicios'}
          </h2>
          <div className="desktop-only" style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            {settings.legalName} • <span style={{ color: 'var(--accent-cyan)' }}>{settings.taxId}</span>
          </div>
        </div>

        {/* Active vehicle badge if any */}
        {activeVehicle && activeVehicle.make && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'var(--primary-light)',
            border: '1px solid var(--border-accent)',
            padding: '3px 8px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.75rem',
            color: 'var(--primary-hover)',
            fontWeight: 600,
            whiteSpace: 'nowrap',
            flexShrink: 0
          }}>
            <Car size={13} />
            <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {activeVehicle.make} {activeVehicle.model || ''}
            </span>
            <button
              onClick={onClearVehicle}
              title="Quitar filtro de vehículo"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                padding: '2px'
              }}
            >
              <X size={13} />
            </button>
          </div>
        )}
      </div>

      {/* Right: Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        {/* Stock Alert Bell */}
        <button
          className="btn btn-secondary btn-icon"
          onClick={onOpenAlerts}
          title="Alertas de Stock"
          style={{ position: 'relative', width: '36px', height: '36px' }}
        >
          <Bell size={17} />
          {lowStockCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '2px',
              right: '2px',
              width: '16px',
              height: '16px',
              backgroundColor: 'var(--danger)',
              color: '#ffffff',
              borderRadius: '50%',
              fontSize: '0.64rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 6px var(--danger)'
            }}>
              {lowStockCount}
            </span>
          )}
        </button>

        {/* Dark / Light Mode Switch */}
        <button
          className="btn btn-secondary btn-icon"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
          style={{ width: '36px', height: '36px' }}
        >
          {theme === 'dark' ? <Sun size={17} color="var(--warning)" /> : <Moon size={17} color="var(--primary)" />}
        </button>

        {/* User / Cashier Tag (Desktop only) */}
        <div className="desktop-only" style={{
          alignItems: 'center',
          gap: '8px',
          padding: '5px 10px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--bg-tertiary)',
          border: '1px solid var(--border-color)',
          fontSize: '0.78rem'
        }}>
          <div style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <User size={13} />
          </div>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.1 }}>
              Caja 1
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--success)', fontWeight: 500 }}>
              ● En línea
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
