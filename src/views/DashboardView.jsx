import React from 'react';
import { 
  DollarSign, 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  ShoppingCart, 
  Plus, 
  Car, 
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
    <div className="view-full-screen animate-fade-in">
      {/* Welcome Banner & Quick Action Buttons */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(14, 22, 40, 0.95) 0%, rgba(19, 28, 49, 0.95) 100%)',
        border: '1px solid rgba(0, 229, 255, 0.3)',
        borderRadius: 'var(--radius-lg)',
        padding: '12px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        flexShrink: 0,
        boxShadow: '0 0 20px rgba(0, 229, 255, 0.08), inset 0 1px 0 rgba(255, 119, 0, 0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0, flex: '1 1 320px' }}>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '12px',
            overflow: 'hidden',
            border: '2px solid rgba(0, 229, 255, 0.6)',
            boxShadow: '0 0 14px rgba(0, 229, 255, 0.3)',
            flexShrink: 0,
            backgroundColor: '#040711',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <img 
              src={settings.logoUrl || "/logo.jpg"} 
              alt="B&G Multiservicios Logo" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '2px', flexWrap: 'wrap' }}>
              <span className="badge badge-primary" style={{ padding: '2px 8px', fontSize: '0.68rem' }}>SISTEMA COMERCIAL</span>
              <span className="badge badge-cyan" style={{ padding: '2px 8px', fontSize: '0.68rem' }}>B&G 2024</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                Sincronizado: Hoy {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <h1 style={{ 
              fontSize: 'clamp(1.1rem, 2.2vw, 1.38rem)', 
              fontWeight: 900, 
              color: '#ffffff', 
              letterSpacing: '-0.02em', 
              textShadow: '0 0 20px rgba(0, 229, 255, 0.4)',
              lineHeight: 1.15
            }}>
              Bienvenido a {settings.storeName}
            </h1>
            <p style={{ fontSize: '0.76rem', color: '#cbd5e1', marginTop: '2px' }}>
              Gestión de repuestos de motos, aceites de carro, mostrador POS y compatibilidad vehicular.
            </p>
          </div>
        </div>

        {/* Action shortcuts */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', flexShrink: 0 }}>
          <button 
            className="btn btn-primary btn-sm"
            onClick={() => onNavigate('pos')}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px 14px' }}
          >
            <ShoppingCart size={16} />
            <span>Nueva Venta (POS)</span>
          </button>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => onNavigate('vehicles')}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px 14px' }}
          >
            <Car size={16} />
            <span>Buscador por Auto</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid (4 on desktop) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(135px, 20vw, 200px), 1fr))',
        gap: '10px',
        flexShrink: 0
      }}>
        {/* KPI 1: Ventas del día */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '12px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
              VENTAS DE HOY
            </span>
            <div style={{
              width: '30px',
              height: '30px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--success-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--success)'
            }}>
              <DollarSign size={17} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.15 }}>
              {settings.currencySymbol}{todaySalesTotal.toFixed(2)}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              {todaySales.length} transacciones completadas hoy
            </div>
          </div>
        </div>

        {/* KPI 2: Repuestos en Catálogo */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '12px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
              REPUESTOS EN CATÁLOGO
            </span>
            <div style={{
              width: '30px',
              height: '30px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--primary-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)'
            }}>
              <Package size={17} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.15 }}>
              {totalParts} SKUs
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              {parts.reduce((a, b) => a + b.stock, 0)} unidades en almacén
            </div>
          </div>
        </div>

        {/* KPI 3: Stock Crítico */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '12px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
              ALERTAS DE STOCK
            </span>
            <div style={{
              width: '30px',
              height: '30px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: criticalParts.length > 0 ? 'var(--warning-light)' : 'var(--success-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: criticalParts.length > 0 ? 'var(--warning)' : 'var(--success)'
            }}>
              <AlertTriangle size={17} />
            </div>
          </div>
          <div>
            <div style={{ 
              fontSize: '1.4rem', 
              fontWeight: 800, 
              lineHeight: 1.15,
              color: criticalParts.length > 0 ? 'var(--warning)' : 'var(--text-primary)' 
            }}>
              {criticalParts.length}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              {outOfStockParts.length} totalmente agotados
            </div>
          </div>
        </div>

        {/* KPI 4: Valorización del Inventario */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '12px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
              VALOR DEL INVENTARIO
            </span>
            <div style={{
              width: '30px',
              height: '30px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--accent-cyan-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-cyan)'
            }}>
              <TrendingUp size={17} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-cyan)', lineHeight: 1.15 }}>
              {settings.currencySymbol}{totalRetailValue.toFixed(2)}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Costo: {settings.currencySymbol}{totalCostValue.toFixed(2)} • Ganancia: +{settings.currencySymbol}{potentialProfit.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Critical Stock & Recent Sales (Fills remaining screen height cleanly) */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', 
        gap: '12px',
        flex: 1,
        minHeight: 0
      }}>
        {/* Left: Repuestos con Stock Crítico */}
        <div className="card" style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginBottom: '10px',
            borderBottom: '1px solid var(--border-color)',
            paddingBottom: '8px',
            flexShrink: 0
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={16} color="var(--warning)" />
              <h3 style={{ fontSize: '0.94rem', fontWeight: 700 }}>
                Repuestos por Reabastecer ({criticalParts.length})
              </h3>
            </div>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => onNavigate('inventory')}
              style={{ padding: '4px 10px', fontSize: '0.74rem' }}
            >
              Ver Inventario Completo
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', minHeight: 0, paddingRight: '2px' }}>
            {criticalParts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 10px', color: 'var(--text-muted)' }}>
                <CheckCircle size={32} color="var(--success)" style={{ margin: '0 auto 6px' }} />
                <p style={{ fontSize: '0.82rem' }}>Sin alertas de stock pendientes (0 repuestos críticos).</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {criticalParts.map(part => {
                  const isOut = part.stock === 0;

                  return (
                    <div 
                      key={part.id}
                      style={{
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--bg-tertiary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        border: `1px solid ${isOut ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245, 158, 11, 0.2)'}`
                      }}
                    >
                      <div style={{ minWidth: 0, paddingRight: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span className={`badge ${isOut ? 'badge-danger' : 'badge-warning'}`} style={{ fontSize: '0.64rem', padding: '1px 5px' }}>
                            {isOut ? 'AGOTADO' : 'BAJO'}
                          </span>
                          <span style={{ fontSize: '0.82rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {part.name}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          OEM: {part.oemNumber} • {part.location || 'Almacén Central'}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                        <div style={{ textAlign: 'right', fontSize: '0.76rem' }}>
                          <div>Stock: <strong style={{ color: isOut ? 'var(--danger)' : 'var(--warning)' }}>{part.stock}</strong> / {part.minStock}</div>
                        </div>
                        <button 
                          className="btn btn-secondary btn-sm"
                          onClick={() => onAdjustStock(part.id, 5, 'Reabastecimiento desde panel')}
                          title="Sumar 5 unidades"
                          style={{ padding: '3px 8px', fontSize: '0.72rem' }}
                        >
                          <Plus size={12} /> +5
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Últimas Ventas y Cotizaciones */}
        <div className="card" style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginBottom: '10px',
            borderBottom: '1px solid var(--border-color)',
            paddingBottom: '8px',
            flexShrink: 0
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={16} color="var(--primary)" />
              <h3 style={{ fontSize: '0.94rem', fontWeight: 700 }}>
                Últimas Transacciones
              </h3>
            </div>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => onNavigate('sales')}
              style={{ padding: '4px 10px', fontSize: '0.74rem' }}
            >
              Ver Todas
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', minHeight: 0, paddingRight: '2px' }}>
            {sales.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '20px 14px',
                backgroundColor: 'var(--bg-tertiary)',
                borderRadius: 'var(--radius-md)',
                border: '1px dashed var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                gap: '8px'
              }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(0, 229, 255, 0.1)',
                  border: '1px solid rgba(0, 229, 255, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-cyan)'
                }}>
                  <CheckCircle size={18} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                    Caja lista: $0.00 en ventas hoy
                  </div>
                  <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px', maxWidth: '300px', lineHeight: 1.35 }}>
                    No hay transacciones registradas todavía. El sistema está listo para registrar tickets y facturas en el mostrador.
                  </p>
                </div>
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={() => onNavigate('pos')}
                  style={{ padding: '5px 12px', fontSize: '0.76rem' }}
                >
                  <ShoppingCart size={13} />
                  <span>Registrar Primera Venta (POS)</span>
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {sales.slice(0, 8).map(sale => {
                  const isProforma = sale.type === 'proforma';

                  return (
                    <div
                      key={sale.id}
                      style={{
                        padding: '8px 12px',
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
                          <span className={`badge ${isProforma ? 'badge-cyan' : 'badge-success'}`} style={{ fontSize: '0.64rem', padding: '1px 5px' }}>
                            {isProforma ? 'PROFORMA' : (sale.type === 'factura' ? 'FACTURA' : 'TICKET')}
                          </span>
                          <span className="mono" style={{ fontSize: '0.8rem', fontWeight: 700 }}>{sale.orderNumber}</span>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          {sale.customer.name} • {sale.items.length} repuesto(s)
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 800, fontSize: '0.88rem' }}>
                            {settings.currencySymbol}{sale.total.toFixed(2)}
                          </div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                            {new Date(sale.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                        <button 
                          className="btn btn-secondary btn-icon btn-sm"
                          onClick={() => onOpenReceipt(sale)}
                          title="Ver / Imprimir Comprobante"
                          style={{ width: '30px', height: '30px' }}
                        >
                          <FileText size={14} />
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
    </div>
  );
}
