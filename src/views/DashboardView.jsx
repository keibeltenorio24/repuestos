import React from 'react';
import { 
  DollarSign, 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  ShoppingCart, 
  Plus, 
  Car, 
  ArrowUpRight, 
  MapPin,
  Clock,
  CheckCircle,
  FileText
} from 'lucide-react';

export default function DashboardView({ 
  parts, 
  sales, 
  settings, 
  onNavigate, 
  onOpenReceipt,
  onAdjustStock 
}) {
  // Cálculos estadísticos
  const today = new Date().toISOString().split('T')[0];
  const todaySales = sales.filter(s => s.date.startsWith(today) && s.status === 'completed');
  const todaySalesTotal = todaySales.reduce((acc, s) => acc + s.total, 0);

  const totalParts = parts.length;
  const criticalParts = parts.filter(p => p.stock <= p.minStock);
  const outOfStockParts = parts.filter(p => p.stock === 0);

  // Valorización del inventario
  const totalCostValue = parts.reduce((acc, p) => acc + (p.costPrice * p.stock), 0);
  const totalRetailValue = parts.reduce((acc, p) => acc + (p.salePrice * p.stock), 0);
  const potentialProfit = totalRetailValue - totalCostValue;

  return (
    <div style={{ padding: 'clamp(12px, 2.5vw, 24px)', display: 'flex', flexDirection: 'column', gap: 'clamp(14px, 2.5vw, 24px)' }} className="animate-fade-in">
      {/* Welcome Banner & Quick Action Buttons */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(14, 22, 40, 0.95) 0%, rgba(19, 28, 49, 0.95) 100%)',
        border: '1px solid rgba(0, 229, 255, 0.3)',
        borderRadius: 'var(--radius-xl)',
        padding: 'clamp(16px, 3vw, 26px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: '0 0 25px rgba(0, 229, 255, 0.10), inset 0 1px 0 rgba(255, 119, 0, 0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(12px, 2.5vw, 20px)', flexWrap: 'wrap' }}>
          <div style={{
            width: 'clamp(54px, 12vw, 80px)',
            height: 'clamp(54px, 12vw, 80px)',
            borderRadius: '14px',
            overflow: 'hidden',
            border: '2px solid rgba(0, 229, 255, 0.6)',
            boxShadow: '0 0 20px rgba(0, 229, 255, 0.35), 0 0 35px rgba(255, 119, 0, 0.2)',
            flexShrink: 0,
            backgroundColor: '#040711',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <img 
              src="/logo.jpg" 
              alt="B&G Multiservicios Neon Logo" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '4px', flexWrap: 'wrap' }}>
              <span className="badge badge-primary">SISTEMA COMERCIAL</span>
              <span className="badge badge-cyan">B&G 2024</span>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                Sincronizado: Hoy {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <h1 style={{ 
              fontSize: 'clamp(1.2rem, 4vw, 1.75rem)', 
              fontWeight: 900, 
              color: '#ffffff', 
              letterSpacing: '-0.02em', 
              textShadow: '0 0 20px rgba(0, 229, 255, 0.4)',
              lineHeight: 1.2
            }}>
              Bienvenido a {settings.storeName}
            </h1>
            <p style={{ fontSize: '0.82rem', color: '#cbd5e1', marginTop: '4px' }}>
              Gestión de repuestos de motos, aceites de carro, mostrador POS y compatibilidad vehicular.
            </p>
          </div>
        </div>

        {/* Action shortcuts */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', width: '100%' }}>
          <button 
            className="btn btn-primary"
            onClick={() => onNavigate('pos')}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flex: '1 1 180px', minHeight: '44px' }}
          >
            <ShoppingCart size={18} />
            <span>Nueva Venta (POS)</span>
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => onNavigate('vehicles')}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flex: '1 1 180px', minHeight: '44px' }}
          >
            <Car size={18} />
            <span>Buscador por Auto</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid (2 cols on mobile, 4 on desktop) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(140px, 44vw, 220px), 1fr))',
        gap: '12px'
      }}>
        {/* KPI 1: Ventas del día */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              VENTAS DE HOY
            </span>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--success-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--success)'
            }}>
              <DollarSign size={20} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {settings.currencySymbol}{todaySalesTotal.toFixed(2)}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              {todaySales.length} transacciones completadas hoy
            </div>
          </div>
        </div>

        {/* KPI 2: Repuestos en Catálogo */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              REPUESTOS EN CATÁLOGO
            </span>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--primary-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)'
            }}>
              <Package size={20} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {totalParts} SKUs
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              {parts.reduce((a, b) => a + b.stock, 0)} unidades en almacén
            </div>
          </div>
        </div>

        {/* KPI 3: Stock Crítico */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              ALERTAS DE STOCK
            </span>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: criticalParts.length > 0 ? 'var(--warning-light)' : 'var(--success-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: criticalParts.length > 0 ? 'var(--warning)' : 'var(--success)'
            }}>
              <AlertTriangle size={20} />
            </div>
          </div>
          <div>
            <div style={{ 
              fontSize: '1.75rem', 
              fontWeight: 800, 
              color: criticalParts.length > 0 ? 'var(--warning)' : 'var(--text-primary)' 
            }}>
              {criticalParts.length}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              {outOfStockParts.length} totalmente agotados
            </div>
          </div>
        </div>

        {/* KPI 4: Valorización del Inventario */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              VALOR DEL INVENTARIO
            </span>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--accent-cyan-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-cyan)'
            }}>
              <TrendingUp size={20} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
              {settings.currencySymbol}{totalRetailValue.toFixed(2)}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Costo: {settings.currencySymbol}{totalCostValue.toFixed(2)} • Ganancia est.: +{settings.currencySymbol}{potentialProfit.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Critical Stock & Recent Sales */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: '16px' }}>
        {/* Left: Repuestos con Stock Crítico */}
        <div className="card" style={{ padding: 'clamp(14px, 2.5vw, 20px)' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginBottom: '16px',
            borderBottom: '1px solid var(--border-color)',
            paddingBottom: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={18} color="var(--warning)" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>
                Repuestos por Reabastecer ({criticalParts.length})
              </h3>
            </div>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => onNavigate('inventory')}
            >
              Ver Inventario Completo
            </button>
          </div>

          {criticalParts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)' }}>
              <CheckCircle size={36} color="var(--success)" style={{ margin: '0 auto 8px' }} />
              <p>Sin alertas de stock pendientes (0 repuestos críticos).</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {criticalParts.slice(0, 5).map(part => {
                const isOut = part.stock === 0;

                return (
                  <div 
                    key={part.id}
                    style={{
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-tertiary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      border: `1px solid ${isOut ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245, 158, 11, 0.2)'}`
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className={`badge ${isOut ? 'badge-danger' : 'badge-warning'}`} style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                          {isOut ? 'AGOTADO' : 'BAJO'}
                        </span>
                        <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>{part.name}</span>
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        OEM: {part.oemNumber} • Ubicación: {part.location || 'Almacén Central'}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ textAlign: 'right', fontSize: '0.8rem' }}>
                        <div>Stock: <strong style={{ color: isOut ? 'var(--danger)' : 'var(--warning)' }}>{part.stock}</strong> / {part.minStock}</div>
                      </div>
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={() => onAdjustStock(part.id, 5, 'Reabastecimiento desde panel')}
                        title="Sumar 5 unidades"
                      >
                        <Plus size={13} /> +5
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Últimas Ventas y Cotizaciones */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginBottom: '16px',
            borderBottom: '1px solid var(--border-color)',
            paddingBottom: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={18} color="var(--primary)" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>
                Últimas Transacciones
              </h3>
            </div>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => onNavigate('sales')}
            >
              Ver Todas
            </button>
          </div>

          {sales.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '36px 16px',
              backgroundColor: 'var(--bg-tertiary)',
              borderRadius: 'var(--radius-md)',
              border: '1px dashed var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                backgroundColor: 'rgba(0, 229, 255, 0.1)',
                border: '1px solid rgba(0, 229, 255, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-cyan)'
              }}>
                <CheckCircle size={22} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                  Caja lista: $0.00 en ventas hoy
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px', maxWidth: '320px', lineHeight: 1.4 }}>
                  No hay transacciones registradas todavía. El sistema está limpio y preparado para registrar tickets y proformas en el mostrador.
                </p>
              </div>
              <button 
                className="btn btn-primary btn-sm"
                onClick={() => onNavigate('pos')}
                style={{ marginTop: '4px' }}
              >
                <ShoppingCart size={14} />
                <span>Registrar Primera Venta (POS)</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {sales.slice(0, 5).map(sale => {
                const isProforma = sale.type === 'proforma';

                return (
                  <div
                    key={sale.id}
                    style={{
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className={`badge ${isProforma ? 'badge-cyan' : 'badge-success'}`} style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                          {isProforma ? 'PROFORMA' : 'TICKET'}
                        </span>
                        <span className="mono" style={{ fontSize: '0.84rem', fontWeight: 700 }}>{sale.orderNumber}</span>
                      </div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        {sale.customer.name} • {sale.items.length} repuesto(s)
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>
                          {settings.currencySymbol}{sale.total.toFixed(2)}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          {new Date(sale.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      <button 
                        className="btn btn-secondary btn-icon btn-sm"
                        onClick={() => onOpenReceipt(sale)}
                        title="Ver / Imprimir Comprobante"
                      >
                        <FileText size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
