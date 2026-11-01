import React from 'react';
import { 
  Sun, 
  Moon, 
  Bell, 
  Car, 
  X, 
  User 
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
  setCurrentView
}) {
  const lowStockCount = parts.filter(p => p.stock <= p.minStock).length;

  const viewTitles = {
    dashboard: 'Panel General y Métricas',
    pos: 'Punto de Venta & Mostrador (POS)',
    inventory: 'Inventario y Almacén de Repuestos',
    vehicles: 'Buscador de Compatibilidad Vehicular',
    sales: 'Historial de Ventas y Cotizaciones',
    settings: 'Configuración de la Tienda (Marca Blanca)'
  };

  return (
    <header style={{
      height: 'var(--header-height)',
      backgroundColor: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border-color)',
      padding: '0 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 90
    }}>
      {/* Left: View Title & Active Vehicle Filter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '8px',
          overflow: 'hidden',
          border: '1px solid rgba(0, 229, 255, 0.45)',
          boxShadow: '0 0 10px rgba(0, 229, 255, 0.25)',
          flexShrink: 0,
          backgroundColor: '#050811'
        }}>
          <img src="/logo.jpg" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.18rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {viewTitles[currentView] || 'B&G Multiservicios'}
          </h2>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
            {settings.legalName} • <span style={{ color: 'var(--accent-cyan)' }}>{settings.taxId}</span>
          </div>
        </div>

        {/* Active vehicle badge if any */}
        {activeVehicle && activeVehicle.make && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--primary-light)',
            border: '1px solid var(--border-accent)',
            padding: '4px 12px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.8rem',
            color: 'var(--primary-hover)',
            fontWeight: 600
          }}>
            <Car size={14} />
            <span>
              Vehículo: {activeVehicle.make} {activeVehicle.model} {activeVehicle.year || ''}
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
              <X size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Right: Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

        {/* Stock Alert Bell */}
        <button
          className="btn btn-secondary btn-icon"
          onClick={onOpenAlerts}
          title="Alertas de Stock"
          style={{ position: 'relative' }}
        >
          <Bell size={18} />
          {lowStockCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              width: '18px',
              height: '18px',
              backgroundColor: 'var(--danger)',
              color: '#ffffff',
              borderRadius: '50%',
              fontSize: '0.68rem',
              fontWeight: 700,
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
        >
          {theme === 'dark' ? <Sun size={18} color="var(--warning)" /> : <Moon size={18} color="var(--primary)" />}
        </button>

        {/* User / Cashier Tag */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 12px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--bg-tertiary)',
          border: '1px solid var(--border-color)',
          fontSize: '0.8rem'
        }}>
          <div style={{
            width: '26px',
            height: '26px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <User size={14} />
          </div>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.1 }}>
              Caja 1 • Mostrador
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--success)', fontWeight: 500 }}>
              ● En línea
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
