import React from 'react';
import { 
  Sun, 
  Moon, 
  Bell, 
  User,
  Menu,
  Printer
} from 'lucide-react';
import { printTestThermalTicket } from '../services/thermalPrinter';

export default function Header({ 
  settings, 
  theme, 
  toggleTheme, 
  parts = [], 
  onOpenAlerts, 
  currentView,
  onOpenMobileMenu
}) {
  const lowStockCount = parts.filter(p => p.stock <= p.minStock).length;

  const viewTitles = {
    dashboard: 'Panel General',
    pos: 'Punto de Venta (POS)',
    inventory: 'Inventario de Repuestos',
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
      gap: '10px',
      flexShrink: 0
    }}>
      {/* Left: Hamburger (mobile) + View Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden', minWidth: 0 }}>
        {/* Mobile Hamburger Button */}
        <button
          className="btn btn-secondary btn-icon mobile-only"
          onClick={onOpenMobileMenu}
          title="Abrir menú"
          style={{ width: '34px', height: '34px', flexShrink: 0 }}
        >
          <Menu size={18} />
        </button>

        {/* Small Logo */}
        <div style={{
          width: '30px',
          height: '30px',
          borderRadius: '8px',
          overflow: 'hidden',
          border: '1px solid rgba(0, 229, 255, 0.45)',
          boxShadow: '0 0 8px rgba(0, 229, 255, 0.25)',
          flexShrink: 0,
          backgroundColor: '#050811'
        }}>
          <img src={settings?.logoUrl || "/logo.jpg"} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>

        <div style={{ minWidth: 0, overflow: 'hidden' }}>
          <h2 style={{ 
            fontSize: 'clamp(0.95rem, 2.5vw, 1.12rem)', 
            fontWeight: 800, 
            color: 'var(--text-primary)',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            lineHeight: 1.15
          }}>
            {viewTitles[currentView] || 'B&G Multiservicios'}
          </h2>
          <div className="desktop-only" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            {settings.legalName} • <span style={{ color: 'var(--accent-cyan)' }}>{settings.taxId}</span>
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        {/* Impresora Térmica NT-5890K Quick Status & Test Button */}
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => printTestThermalTicket(settings)}
          title="Haz clic para imprimir un ticket de prueba en tu Impresora Térmica NT-5890K (58mm)"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 10px',
            fontSize: '0.74rem',
            borderColor: 'rgba(0, 229, 255, 0.45)',
            backgroundColor: 'rgba(0, 229, 255, 0.08)',
            color: 'var(--accent-cyan)',
            fontWeight: 700
          }}
        >
          <Printer size={14} />
          <span>NT-5890K (58mm)</span>
        </button>

        {/* Stock Alert Bell */}
        <button
          className="btn btn-secondary btn-icon"
          onClick={onOpenAlerts}
          title="Alertas de Stock"
          style={{ position: 'relative', width: '34px', height: '34px' }}
        >
          <Bell size={16} />
          {lowStockCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '2px',
              right: '2px',
              width: '15px',
              height: '15px',
              backgroundColor: 'var(--danger)',
              color: '#ffffff',
              borderRadius: '50%',
              fontSize: '0.62rem',
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
          style={{ width: '34px', height: '34px' }}
        >
          {theme === 'dark' ? <Sun size={16} color="var(--warning)" /> : <Moon size={16} color="var(--primary)" />}
        </button>

        {/* User / Cashier Tag (Desktop only) */}
        <div className="desktop-only" style={{
          alignItems: 'center',
          gap: '8px',
          padding: '4px 10px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--bg-tertiary)',
          border: '1px solid var(--border-color)',
          fontSize: '0.76rem'
        }}>
          <div style={{
            width: '22px',
            height: '22px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <User size={12} />
          </div>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.1 }}>
              Caja 1
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--success)', fontWeight: 500 }}>
              ● En línea
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
