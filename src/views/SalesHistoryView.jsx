import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Printer, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  User, 
  Calendar,
  MessageCircle,
  FileCheck,
  ShoppingCart
} from 'lucide-react';

export default function SalesHistoryView({ 
  sales, 
  settings, 
  onOpenReceipt, 
  onConvertQuote,
  onNavigate 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all'); // all | ticket | factura | proforma

  const filteredSales = sales.filter(sale => {
    const q = searchQuery.trim().toLowerCase();
    const matchesQuery = !q || (
      sale.orderNumber.toLowerCase().includes(q) ||
      sale.customer.name.toLowerCase().includes(q) ||
      (sale.customer.docId && sale.customer.docId.toLowerCase().includes(q))
    );

    const matchesType = typeFilter === 'all' || sale.type === typeFilter;

    return matchesQuery && matchesType;
  });

  return (
    <div style={{ padding: 'clamp(12px, 2.5vw, 24px)', display: 'flex', flexDirection: 'column', gap: '16px' }} className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h2 style={{ fontSize: 'clamp(1.15rem, 3.5vw, 1.4rem)', fontWeight: 800 }}>Ventas y Cotizaciones</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Registro histórico de tickets emitidos, facturación y proformas pendientes
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        padding: '12px 14px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
        display: 'flex',
        gap: '10px',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <div style={{ position: 'relative', flex: '1 1 200px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="input"
            placeholder="Buscar por Comprobante, Cliente o Cédula..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '38px' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
          {[
            { id: 'all', label: 'Todos' },
            { id: 'ticket', label: 'Tickets' },
            { id: 'factura', label: 'Facturas' },
            { id: 'proforma', label: 'Cotizaciones' }
          ].map(f => (
            <button
              key={f.id}
              className={`btn btn-sm ${typeFilter === f.id ? 'btn-primary' : 'btn-secondary'}`}
              style={{ whiteSpace: 'nowrap', flexShrink: 0 }}
              onClick={() => setTypeFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Transaction Cards (Visible on mobile <= 768px) */}
      <div className="mobile-only" style={{ flexDirection: 'column', gap: '10px' }}>
        {filteredSales.length === 0 ? (
          <div className="card" style={{ 
            textAlign: 'center', 
            padding: '36px 16px', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            gap: '12px',
            backgroundColor: 'var(--bg-secondary)'
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
              <CheckCircle2 size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                {sales.length === 0 ? 'Historial limpio: 0 ventas registradas' : 'No se encontraron transacciones'}
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px', maxWidth: '300px', lineHeight: 1.4 }}>
                {sales.length === 0 
                  ? 'El sistema está preparado para registrar nuevas ventas. Al cobrar en el Mostrador POS, los comprobantes aparecerán aquí.' 
                  : 'Prueba cambiando los filtros o el término de búsqueda.'}
              </p>
            </div>
            {sales.length === 0 && onNavigate && (
              <button 
                className="btn btn-primary btn-sm" 
                onClick={() => onNavigate('pos')}
                style={{ marginTop: '4px' }}
              >
                <ShoppingCart size={14} />
                <span>Ir al Mostrador POS</span>
              </button>
            )}
          </div>
        ) : (
          filteredSales.map(sale => {
            const isProforma = sale.type === 'proforma';

            return (
              <div key={sale.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className={`badge ${isProforma ? 'badge-cyan' : (sale.type === 'factura' ? 'badge-primary' : 'badge-success')}`}>
                      {isProforma ? 'PROFORMA' : (sale.type === 'factura' ? 'FACTURA' : 'TICKET')}
                    </span>
                    <span className="mono" style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                      {sale.orderNumber}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    {new Date(sale.date).toLocaleDateString()} {new Date(sale.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderTop: '1px solid var(--border-color)', paddingTop: '8px' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                      {sale.customer.name}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      {sale.items.length} repuesto(s) • Método: {sale.paymentMethod === 'cash' ? 'Efectivo' : (sale.paymentMethod === 'card' ? 'Tarjeta' : (sale.paymentMethod === 'transfer' ? 'Transferencia' : (sale.paymentMethod === 'credit' ? 'Crédito' : 'Pendiente')))}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 900, fontSize: '1.15rem', color: 'var(--primary-hover)' }}>
                      {settings.currencySymbol}{sale.total.toFixed(2)}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '8px' }}>
                  {isProforma && (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => {
                        if (window.confirm(`¿Deseas convertir la cotización ${sale.orderNumber} en Venta Final y descontar el inventario?`)) {
                          onConvertQuote(sale.id);
                        }
                      }}
                      style={{ flex: 1, justifyContent: 'center', gap: '6px' }}
                    >
                      <FileCheck size={14} />
                      <span>Convertir a Venta</span>
                    </button>
                  )}
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => onOpenReceipt(sale)}
                    style={{ flex: isProforma ? '0 0 auto' : 1, justifyContent: 'center', gap: '6px' }}
                  >
                    <Printer size={15} />
                    <span>Ver Ticket</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Desktop Sales Table */}
      <div className="desktop-only" style={{
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
        overflow: 'hidden',
        flexDirection: 'column'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '12px 16px' }}>COMPROBANTE</th>
                <th style={{ padding: '12px 16px' }}>FECHA Y HORA</th>
                <th style={{ padding: '12px 16px' }}>CLIENTE</th>
                <th style={{ padding: '12px 16px' }}>REPUESTOS</th>
                <th style={{ padding: '12px 16px' }}>MÉTODO DE PAGO</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>TOTAL</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '50px 20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
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
                        <CheckCircle2 size={22} />
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
                        {sales.length === 0 ? 'Historial limpio: 0 ventas registradas' : 'No se encontraron transacciones'}
                      </div>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', maxWidth: '420px', lineHeight: 1.4 }}>
                        {sales.length === 0 
                          ? 'El historial de ventas está en cero y listo para operar. Cuando emitas tickets, facturas o cotizaciones en el mostrador POS aparecerán registradas aquí con su comprobante.' 
                          : 'No hay transacciones que coincidan con la búsqueda o filtro seleccionado.'}
                      </p>
                      {sales.length === 0 && onNavigate && (
                        <button 
                          className="btn btn-primary btn-sm" 
                          onClick={() => onNavigate('pos')}
                          style={{ marginTop: '4px' }}
                        >
                          <ShoppingCart size={14} />
                          <span>Ir al Mostrador POS</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredSales.map(sale => {
                  const isProforma = sale.type === 'proforma';

                  return (
                    <tr 
                      key={sale.id}
                      style={{ 
                        borderBottom: '1px solid var(--border-color)',
                        transition: 'background-color 0.15s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      {/* Document Number & Badge */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className={`badge ${isProforma ? 'badge-cyan' : 'badge-success'}`}>
                            {isProforma ? 'PROFORMA' : (sale.type === 'factura' ? 'FACTURA' : 'TICKET')}
                          </span>
                          <span className="mono" style={{ fontWeight: 800, color: 'var(--text-primary)' }}>
                            {sale.orderNumber}
                          </span>
                        </div>
                      </td>

                      {/* Date & Time */}
                      <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Calendar size={14} />
                          <span>{new Date(sale.date).toLocaleDateString()}</span>
                          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                            {new Date(sale.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </td>

                      {/* Customer */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {sale.customer.name}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                          {sale.customer.docId || 'Consumidor final'} 
                          {sale.customer.isWorkshop && ' • [Taller]'}
                        </div>
                      </td>

                      {/* Items */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontSize: '0.8rem' }}>
                          {sale.items.length} repuesto(s)
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {sale.items.map(i => `${i.qty}x ${i.name}`).join(', ')}
                        </div>
                      </td>

                      {/* Payment Method */}
                      <td style={{ padding: '12px 16px', textTransform: 'capitalize' }}>
                        {sale.paymentMethod === 'cash' ? 'Efectivo' : (sale.paymentMethod === 'card' ? 'Tarjeta' : (sale.paymentMethod === 'transfer' ? 'Transferencia' : (sale.paymentMethod === 'credit' ? 'Crédito' : 'Pendiente')))}
                      </td>

                      {/* Total */}
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <div style={{ fontWeight: 800, fontSize: '0.98rem', color: 'var(--text-primary)' }}>
                          {settings.currencySymbol}{sale.total.toFixed(2)}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          IVA incl.
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          {isProforma && (
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => {
                                if (window.confirm(`¿Deseas convertir la cotización ${sale.orderNumber} en Venta Final y descontar el inventario?`)) {
                                  onConvertQuote(sale.id);
                                }
                              }}
                              title="Convertir a Venta Definitiva"
                              style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}
                            >
                              <FileCheck size={14} />
                              <span>Vender</span>
                            </button>
                          )}
                          <button
                            className="btn btn-secondary btn-icon btn-sm"
                            onClick={() => onOpenReceipt(sale)}
                            title="Ver / Reimprimir Comprobante"
                          >
                            <Printer size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
