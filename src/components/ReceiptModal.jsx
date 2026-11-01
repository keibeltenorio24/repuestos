import React from 'react';
import { Printer, X, Share2, CheckCircle2, MessageCircle } from 'lucide-react';

export default function ReceiptModal({ sale, settings, onClose }) {
  if (!sale) return null;

  const isProforma = sale.type === 'proforma';
  const typeLabel = isProforma 
    ? 'COTIZACIÓN / PROFORMA' 
    : (sale.type === 'factura' ? 'FACTURA DE VENTA' : 'TICKET DE CAJA');

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    const phone = sale.customer.phone ? sale.customer.phone.replace(/[^0-9]/g, '') : '';
    let msg = `*${settings.storeName}*\n`;
    msg += `📄 *${typeLabel}*: ${sale.orderNumber}\n`;
    msg += `📅 Fecha: ${new Date(sale.date).toLocaleDateString()} ${new Date(sale.date).toLocaleTimeString()}\n`;
    msg += `👤 Cliente: ${sale.customer.name} (${sale.customer.docId || 'Consumidor Final'})\n\n`;
    msg += `*DETALLE DE REPUESTOS:*\n`;

    sale.items.forEach((item, index) => {
      msg += `${index + 1}. ${item.qty}x ${item.name} (${item.sku}) - ${settings.currencySymbol}${item.price.toFixed(2)} = *${settings.currencySymbol}${item.subtotal.toFixed(2)}*\n`;
    });

    msg += `\n*TOTAL A PAGAR: ${settings.currencySymbol}${sale.total.toFixed(2)}*`;
    if (isProforma) {
      msg += `\n_Cotización válida por 5 días sujeta a disponibilidad de stock._`;
    }

    const encoded = encodeURIComponent(msg);
    if (phone) {
      window.open(`https://wa.me/${phone}?text=${encoded}`, '_blank');
    } else {
      window.open(`https://wa.me/?text=${encoded}`, '_blank');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '480px' }}
      >
        <div className="modal-header no-print">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 color="var(--success)" size={20} />
            <span style={{ fontWeight: 700, fontSize: '1rem' }}>
              {isProforma ? 'Cotización Generada' : 'Venta Registrada Exitosamente'}
            </span>
          </div>
          <button className="btn btn-secondary btn-icon btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Printable Ticket Area */}
        <div className="printable-area" style={{
          padding: '24px',
          backgroundColor: '#ffffff',
          color: '#111827',
          fontFamily: "'JetBrains Mono', 'Courier New', Courier, monospace",
          fontSize: '0.82rem',
          lineHeight: '1.4'
        }}>
          {/* Store Info */}
          <div style={{ textAlign: 'center', marginBottom: '14px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              margin: '0 auto 8px',
              borderRadius: '8px',
              overflow: 'hidden',
              border: '1px solid #cbd5e1'
            }}>
              <img src="/logo.jpg" alt="B&G Multiservicios Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '2px', fontFamily: 'inherit' }}>
              {settings.storeName}
            </h2>
            <div style={{ fontSize: '0.78rem' }}>{settings.legalName}</div>
            <div style={{ fontSize: '0.78rem' }}>RIF / NIT / RUT: {settings.taxId}</div>
            <div style={{ fontSize: '0.75rem' }}>{settings.address}</div>
            <div style={{ fontSize: '0.75rem' }}>Tel / WhatsApp: {settings.phone}</div>
          </div>

          <div style={{ borderBottom: '1px dashed #6b7280', margin: '10px 0' }} />

          {/* Document metadata */}
          <div style={{ textAlign: 'center', fontWeight: 800, fontSize: '0.92rem', marginBottom: '6px' }}>
            {typeLabel}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>N° CONTROL:</span>
            <span style={{ fontWeight: 800 }}>{sale.orderNumber}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>FECHA:</span>
            <span>{new Date(sale.date).toLocaleDateString()} {new Date(sale.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>FORMA DE PAGO:</span>
            <span style={{ textTransform: 'uppercase', fontWeight: 700 }}>
              {sale.paymentMethod === 'cash' ? 'Efectivo' : (sale.paymentMethod === 'card' ? 'Tarjeta' : (sale.paymentMethod === 'transfer' ? 'Transferencia' : (sale.paymentMethod === 'credit' ? 'Crédito' : 'Pendiente')))}
            </span>
          </div>

          <div style={{ borderBottom: '1px dashed #6b7280', margin: '10px 0' }} />

          {/* Customer info */}
          <div>
            <div><strong>CLIENTE:</strong> {sale.customer.name}</div>
            <div><strong>C.I. / RIF:</strong> {sale.customer.docId || 'Sin documento'}</div>
            {sale.customer.phone && <div><strong>TELÉFONO:</strong> {sale.customer.phone}</div>}
            {sale.customer.isWorkshop && <div style={{ fontWeight: 700 }}>[ TALLER MECÁNICO ALIADO ]</div>}
          </div>

          <div style={{ borderBottom: '1px dashed #6b7280', margin: '10px 0' }} />

          {/* Items Header */}
          <div style={{ display: 'grid', gridTemplateColumns: '28px 1fr 50px 65px', fontWeight: 800, marginBottom: '6px', fontSize: '0.78rem' }}>
            <span>CANT</span>
            <span>DESCRIPCIÓN / OEM</span>
            <span style={{ textAlign: 'right' }}>P.U.</span>
            <span style={{ textAlign: 'right' }}>TOTAL</span>
          </div>

          {/* Items List */}
          {sale.items.map((item, idx) => (
            <div key={idx} style={{ display: 'grid', gridTemplateColumns: '28px 1fr 50px 65px', marginBottom: '8px', fontSize: '0.78rem' }}>
              <span>{item.qty}</span>
              <div style={{ paddingRight: '4px' }}>
                <div>{item.name}</div>
                <div style={{ fontSize: '0.7rem', color: '#4b5563' }}>SKU: {item.sku}</div>
              </div>
              <span style={{ textAlign: 'right' }}>{settings.currencySymbol}{item.price.toFixed(2)}</span>
              <span style={{ textAlign: 'right', fontWeight: 700 }}>{settings.currencySymbol}{item.subtotal.toFixed(2)}</span>
            </div>
          ))}

          <div style={{ borderBottom: '1px dashed #6b7280', margin: '10px 0' }} />

          {/* Totals */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '0.82rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>SUBTOTAL:</span>
              <span>{settings.currencySymbol}{sale.subtotal.toFixed(2)}</span>
            </div>
            {sale.discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#b91c1c' }}>
                <span>DESCUENTO APLICADO:</span>
                <span>-{settings.currencySymbol}{sale.discount.toFixed(2)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>IVA ({settings.taxRate}%):</span>
              <span>{settings.currencySymbol}{sale.tax.toFixed(2)}</span>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              fontWeight: 900, 
              fontSize: '1.05rem', 
              borderTop: '1px solid #111827',
              borderBottom: '1px solid #111827',
              padding: '6px 0',
              marginTop: '4px'
            }}>
              <span>TOTAL A PAGAR:</span>
              <span>{settings.currencySymbol}{sale.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Barcode Simulation */}
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <div style={{
              display: 'inline-flex',
              gap: '2px',
              height: '34px',
              alignItems: 'stretch',
              justifyContent: 'center',
              padding: '4px'
            }}>
              {[4,2,3,1,5,2,4,1,3,2,5,1,2,4,3,1,2,4,1,5,2,3,1,4].map((width, i) => (
                <div key={i} style={{ width: `${width}px`, backgroundColor: '#000' }} />
              ))}
            </div>
            <div style={{ fontSize: '0.72rem', letterSpacing: '0.15em', marginTop: '3px' }}>
              *{sale.orderNumber}*
            </div>
          </div>

          {/* Footer Notice & Warranty */}
          <div style={{ textAlign: 'center', fontSize: '0.72rem', marginTop: '16px', color: '#374151' }}>
            <p>{settings.ticketFooter}</p>
            <p style={{ marginTop: '4px', fontWeight: 700 }}>¡Gracias por confiar en su tienda de repuestos!</p>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="modal-footer no-print">
          <button className="btn btn-secondary" onClick={onClose}>
            Cerrar
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={handleWhatsAppShare}
            style={{ color: '#16a34a' }}
          >
            <MessageCircle size={16} />
            <span>Enviar a WhatsApp</span>
          </button>
          <button className="btn btn-primary" onClick={handlePrint}>
            <Printer size={16} />
            <span>Imprimir Ticket</span>
          </button>
        </div>
      </div>
    </div>
  );
}
