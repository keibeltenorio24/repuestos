import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { 
  Printer, 
  X, 
  CheckCircle2, 
  MessageCircle, 
  FileText, 
  Image as ImageIcon, 
  Download, 
  Phone
} from 'lucide-react';

export default function ReceiptModal({ sale, settings, onClose }) {
  const receiptRef = useRef(null);
  const [shareFormat, setShareFormat] = useState('pdf'); // 'pdf' (preferido) | 'image'
  const [customerPhone, setCustomerPhone] = useState(sale?.customer?.phone || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusNotice, setStatusNotice] = useState(null);

  if (!sale) return null;

  const isProforma = sale.type === 'proforma';
  const typeLabel = isProforma 
    ? 'COTIZACIÓN / PROFORMA' 
    : (sale.type === 'factura' ? 'FACTURA DE VENTA' : 'TICKET DE CAJA');

  const docPrefix = isProforma ? 'Proforma' : (sale.type === 'factura' ? 'Factura' : 'Ticket');

  // Cálculo garantizado del desglose con IVA para que siempre se sume y se muestre desglosado
  const taxRate = Number(sale.taxRate) > 0 
    ? Number(sale.taxRate) 
    : (Number(settings.taxRate) > 0 ? Number(settings.taxRate) : 16);

  const rawSubtotal = Number(sale.subtotal) > 0
    ? Number(sale.subtotal)
    : sale.items.reduce((acc, item) => acc + (Number(item.subtotal) || (item.qty * item.price)), 0);

  const discountAmount = Number(sale.discount) || 0;
  const taxableBase = Math.max(0, rawSubtotal - discountAmount);
  const taxAmount = Number(sale.tax) > 0 
    ? Number(sale.tax) 
    : (taxableBase * taxRate) / 100;
  const finalTotal = taxableBase + taxAmount;

  const paymentMethodLabel = sale.paymentMethod === 'cash' 
    ? 'Efectivo' 
    : (sale.paymentMethod === 'card' 
      ? 'Tarjeta / Punto' 
      : (sale.paymentMethod === 'transfer' 
        ? 'Transferencia / Pago Móvil' 
        : (sale.paymentMethod === 'credit' ? 'Crédito' : 'Pendiente')));

  const handlePrint = () => {
    window.print();
  };

  // Construir mensaje de WhatsApp con todo el desglose completo incluyendo IVA
  const buildWhatsAppMessage = () => {
    const cur = settings.currencySymbol || '$';
    let msg = `*${settings.storeName}*\n`;
    if (settings.legalName) msg += `${settings.legalName}\n`;
    if (settings.taxId) msg += `RIF: ${settings.taxId}\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `📄 *${typeLabel}*\n`;
    msg += `🔢 *N° Control:* ${sale.orderNumber}\n`;
    msg += `📅 *Fecha:* ${new Date(sale.date).toLocaleDateString()} ${new Date(sale.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}\n`;
    msg += `💳 *Forma de Pago:* ${paymentMethodLabel}\n`;
    msg += `👤 *Cliente:* ${sale.customer.name}\n`;
    msg += `🪪 *C.I. / RIF:* ${sale.customer.docId || 'Consumidor Final'}\n`;
    if (customerPhone) msg += `📱 *Tel:* ${customerPhone}\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `*DETALLE DE REPUESTOS:*\n`;

    sale.items.forEach((item, index) => {
      const itemSub = Number(item.subtotal) || (item.qty * item.price);
      msg += `${index + 1}. *${item.qty}x* ${item.name} _(SKU: ${item.sku})_\n`;
      msg += `   P. Unit: ${cur}${Number(item.price).toFixed(2)} ➔ *${cur}${itemSub.toFixed(2)}*\n`;
    });

    msg += `━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `*DESGLOSE DE FACTURACIÓN:*\n`;
    msg += `• Subtotal (Sin IVA): ${cur}${rawSubtotal.toFixed(2)}\n`;
    if (discountAmount > 0) {
      msg += `• Descuento Aplicado: -${cur}${discountAmount.toFixed(2)}\n`;
    }
    msg += `• Base Imponible: ${cur}${taxableBase.toFixed(2)}\n`;
    msg += `• *+ IVA (${taxRate}%):* +${cur}${taxAmount.toFixed(2)}\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `💰 *TOTAL A PAGAR (IVA INCLUIDO): ${cur}${finalTotal.toFixed(2)}*\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━\n`;

    if (isProforma) {
      msg += `_Cotización válida por 5 días sujeta a disponibilidad de stock._\n`;
    } else {
      msg += `_¡Gracias por su compra en ${settings.storeName}!_`;
    }

    return msg;
  };

  // Capturar el comprobante tal cual como se ve en el sistema
  const captureReceiptCanvas = async () => {
    if (!receiptRef.current) throw new Error('No se encontró el comprobante');
    return await html2canvas(receiptRef.current, {
      scale: 3,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false
    });
  };

  // Generar archivo PDF tal cual como sale en sistema
  const generatePdfFile = async () => {
    const canvas = await captureReceiptCanvas();
    const imgData = canvas.toDataURL('image/png');
    const pdfWidth = 88; // Ancho de factura/comprobante en mm con proporción exacta
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [pdfWidth, pdfHeight]
    });

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
    const pdfBlob = pdf.output('blob');
    const fileName = `${docPrefix}_${sale.orderNumber}.pdf`;
    const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' });

    return { pdf, pdfBlob, pdfFile, fileName };
  };

  // Generar archivo Foto PNG tal cual como sale en sistema
  const generateImageFile = async () => {
    const canvas = await captureReceiptCanvas();
    const imgBlob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png', 1.0));
    const fileName = `${docPrefix}_${sale.orderNumber}.png`;
    const imgFile = new File([imgBlob], fileName, { type: 'image/png' });

    return { imgBlob, imgFile, fileName };
  };

  // Descargar un Blob en el dispositivo
  const triggerDownload = (blob, fileName) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  };

  // Descarga directa de PDF o Foto
  const handleDirectDownload = async (format = 'pdf') => {
    try {
      setIsGenerating(true);
      setStatusNotice(null);
      if (format === 'pdf') {
        const { pdfBlob, fileName } = await generatePdfFile();
        triggerDownload(pdfBlob, fileName);
        setStatusNotice({
          type: 'success',
          text: `📄 Documento PDF (${fileName}) descargado tal cual como sale en sistema.`
        });
      } else {
        const { imgBlob, fileName } = await generateImageFile();
        triggerDownload(imgBlob, fileName);
        setStatusNotice({
          type: 'success',
          text: `🖼️ Foto de la factura (${fileName}) descargada en alta resolución.`
        });
      }
    } catch (err) {
      console.error('Error al generar documento:', err);
      setStatusNotice({
        type: 'warning',
        text: 'No se pudo generar el archivo automáticamente. Intenta nuevamente.'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Enviar por WhatsApp en PDF (preferido) o en Foto tal cual como sale en sistema + desglose con IVA
  const handleWhatsAppShare = async () => {
    const cleanPhone = customerPhone ? customerPhone.replace(/[^0-9]/g, '') : '';
    const msg = buildWhatsAppMessage();
    const encoded = encodeURIComponent(msg);
    const waUrl = cleanPhone 
      ? `https://wa.me/${cleanPhone}?text=${encoded}` 
      : `https://wa.me/?text=${encoded}`;

    try {
      setIsGenerating(true);
      setStatusNotice(null);

      if (shareFormat === 'pdf') {
        const { pdfBlob, pdfFile, fileName } = await generatePdfFile();

        // En dispositivos móviles que permiten adjuntar el PDF directo a WhatsApp vía Web Share API
        const isMobileDevice = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
        if (isMobileDevice && navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
          try {
            await navigator.share({
              files: [pdfFile],
              title: `${typeLabel} ${sale.orderNumber}`,
              text: msg
            });
            setStatusNotice({
              type: 'success',
              text: `✅ PDF (${fileName}) compartido directamente a WhatsApp con el desglose de IVA.`
            });
            setIsGenerating(false);
            return;
          } catch (shareErr) {
            if (shareErr.name === 'AbortError') {
              setIsGenerating(false);
              return;
            }
          }
        }

        // Descargar el PDF oficial automáticamente y abrir el chat de WhatsApp con el desglose
        triggerDownload(pdfBlob, fileName);
        window.open(waUrl, '_blank');

        setStatusNotice({
          type: 'success',
          text: `✅ Factura PDF (${fileName}) generada y descargada tal cual como sale en sistema. Se abrió WhatsApp con el desglose de IVA: solo adjunta o arrastra el PDF descargado al chat.`
        });
      } else {
        // Formato Foto (PNG)
        const { imgBlob, imgFile, fileName } = await generateImageFile();

        // Intentar copiar la imagen al portapapeles para pegar con Ctrl+V directo en WhatsApp
        let copiedToClipboard = false;
        if (navigator.clipboard && window.ClipboardItem) {
          try {
            await navigator.clipboard.write([
              new window.ClipboardItem({ 'image/png': imgBlob })
            ]);
            copiedToClipboard = true;
          } catch {
            copiedToClipboard = false;
          }
        }

        const isMobileDevice = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
        if (isMobileDevice && navigator.canShare && navigator.canShare({ files: [imgFile] })) {
          try {
            await navigator.share({
              files: [imgFile],
              title: `${typeLabel} ${sale.orderNumber}`,
              text: msg
            });
            setStatusNotice({
              type: 'success',
              text: `✅ Foto de la factura (${fileName}) enviada a WhatsApp con el desglose de IVA.`
            });
            setIsGenerating(false);
            return;
          } catch (shareErr) {
            if (shareErr.name === 'AbortError') {
              setIsGenerating(false);
              return;
            }
          }
        }

        triggerDownload(imgBlob, fileName);
        window.open(waUrl, '_blank');

        setStatusNotice({
          type: 'success',
          text: copiedToClipboard
            ? `✅ Foto de la factura copiada al portapapeles y descargada (${fileName}). En el chat de WhatsApp solo presiona Ctrl + V (Pegar) para enviar la imagen.`
            : `✅ Foto de la factura (${fileName}) descargada. Adjúntala en la ventana de WhatsApp que se abrió.`
        });
      }
    } catch (err) {
      console.error('Error al preparar factura para WhatsApp:', err);
      window.open(waUrl, '_blank');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '520px' }}
      >
        <div className="modal-header no-print">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 color="var(--success)" size={20} />
            <span style={{ fontWeight: 700, fontSize: '1rem' }}>
              {isProforma ? 'Cotización Generada' : 'Factura / Comprobante Emitido'}
            </span>
          </div>
          <button className="btn btn-secondary btn-icon btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Printable Ticket / Invoice Area (Capturado exactamente para PDF y Foto) */}
        <div 
          ref={receiptRef}
          className="printable-area" 
          style={{
            padding: '24px',
            backgroundColor: '#ffffff',
            color: '#111827',
            fontFamily: "'JetBrains Mono', 'Courier New', Courier, monospace",
            fontSize: '0.82rem',
            lineHeight: '1.45'
          }}
        >
          {/* Store Info */}
          <div style={{ textAlign: 'center', marginBottom: '14px' }}>
            <div style={{
              width: '58px',
              height: '58px',
              margin: '0 auto 8px',
              borderRadius: '8px',
              overflow: 'hidden',
              border: '1px solid #cbd5e1',
              backgroundColor: '#050811'
            }}>
              <img 
                src={settings.logoUrl || "/logo.jpg"} 
                alt={settings.storeName} 
                crossOrigin="anonymous"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            </div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '2px', fontFamily: 'inherit', color: '#0f172a' }}>
              {settings.storeName}
            </h2>
            <div style={{ fontSize: '0.78rem', fontWeight: 600 }}>{settings.legalName}</div>
            <div style={{ fontSize: '0.78rem' }}>RIF / NIT / RUT: <strong>{settings.taxId}</strong></div>
            <div style={{ fontSize: '0.75rem' }}>{settings.address}</div>
            <div style={{ fontSize: '0.75rem' }}>Tel / WhatsApp: {settings.phone}</div>
          </div>

          <div style={{ borderBottom: '1px dashed #6b7280', margin: '10px 0' }} />

          {/* Document metadata */}
          <div style={{ 
            textAlign: 'center', 
            fontWeight: 800, 
            fontSize: '0.94rem', 
            marginBottom: '6px',
            padding: '4px 0',
            backgroundColor: '#f1f5f9',
            borderRadius: '4px',
            border: '1px solid #cbd5e1'
          }}>
            {typeLabel}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>N° CONTROL:</span>
            <span style={{ fontWeight: 800 }}>{sale.orderNumber}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>FECHA Y HORA:</span>
            <span>{new Date(sale.date).toLocaleDateString()} {new Date(sale.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>FORMA DE PAGO:</span>
            <span style={{ textTransform: 'uppercase', fontWeight: 700 }}>
              {paymentMethodLabel}
            </span>
          </div>

          <div style={{ borderBottom: '1px dashed #6b7280', margin: '10px 0' }} />

          {/* Customer info */}
          <div style={{ fontSize: '0.8rem' }}>
            <div><strong>CLIENTE:</strong> {sale.customer.name}</div>
            <div><strong>C.I. / RIF:</strong> {sale.customer.docId || 'Sin documento'}</div>
            {(customerPhone || sale.customer.phone) && (
              <div><strong>TELÉFONO:</strong> {customerPhone || sale.customer.phone}</div>
            )}
            {sale.customer.isWorkshop && <div style={{ fontWeight: 700, marginTop: '2px' }}>[ TALLER MECÁNICO ALIADO ]</div>}
          </div>

          <div style={{ borderBottom: '1px dashed #6b7280', margin: '10px 0' }} />

          {/* Items Header */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '32px 1fr 62px 72px', 
            fontWeight: 800, 
            marginBottom: '6px', 
            fontSize: '0.76rem',
            borderBottom: '1px solid #cbd5e1',
            paddingBottom: '4px'
          }}>
            <span>CANT</span>
            <span>DESCRIPCIÓN / SKU</span>
            <span style={{ textAlign: 'right' }}>P. UNIT</span>
            <span style={{ textAlign: 'right' }}>SUBTOTAL</span>
          </div>

          {/* Items List */}
          {sale.items.map((item, idx) => {
            const lineSubtotal = Number(item.subtotal) || (item.qty * item.price);
            return (
              <div 
                key={idx} 
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '32px 1fr 62px 72px', 
                  marginBottom: '8px', 
                  fontSize: '0.78rem',
                  alignItems: 'start'
                }}
              >
                <span style={{ fontWeight: 700 }}>{item.qty}x</span>
                <div style={{ paddingRight: '4px' }}>
                  <div style={{ fontWeight: 600 }}>{item.name}</div>
                  <div style={{ fontSize: '0.68rem', color: '#4b5563' }}>
                    SKU: {item.sku}{item.oemNumber ? ` | OEM: ${item.oemNumber}` : ''}
                  </div>
                </div>
                <span style={{ textAlign: 'right' }}>{settings.currencySymbol}{Number(item.price).toFixed(2)}</span>
                <span style={{ textAlign: 'right', fontWeight: 700 }}>{settings.currencySymbol}{lineSubtotal.toFixed(2)}</span>
              </div>
            );
          })}

          <div style={{ borderBottom: '1px dashed #6b7280', margin: '10px 0' }} />

          {/* Desglose Fiscal y Totales (Con IVA sumado al Total) */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '4px', 
            fontSize: '0.82rem',
            backgroundColor: '#f8fafc',
            padding: '10px 12px',
            borderRadius: '6px',
            border: '1px solid #cbd5e1'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>SUBTOTAL (SIN IVA):</span>
              <span style={{ fontWeight: 600 }}>{settings.currencySymbol}{rawSubtotal.toFixed(2)}</span>
            </div>

            {discountAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#b91c1c' }}>
                <span>DESCUENTO APLICADO:</span>
                <span>-{settings.currencySymbol}{discountAmount.toFixed(2)}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>BASE IMPONIBLE:</span>
              <span style={{ fontWeight: 600 }}>{settings.currencySymbol}{taxableBase.toFixed(2)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: '#0f172a' }}>
              <span>+ IVA ({taxRate}%):</span>
              <span>+{settings.currencySymbol}{taxAmount.toFixed(2)}</span>
            </div>

            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              fontWeight: 900, 
              fontSize: '1.05rem', 
              borderTop: '2px solid #111827',
              borderBottom: '2px solid #111827',
              padding: '6px 0',
              marginTop: '4px',
              color: '#000000'
            }}>
              <span>TOTAL A PAGAR (CON IVA):</span>
              <span>{settings.currencySymbol}{finalTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Barcode Simulation */}
          <div style={{ textAlign: 'center', marginTop: '18px' }}>
            <div style={{
              display: 'inline-flex',
              gap: '2px',
              height: '32px',
              alignItems: 'stretch',
              justifyContent: 'center',
              padding: '4px'
            }}>
              {[4,2,3,1,5,2,4,1,3,2,5,1,2,4,3,1,2,4,1,5,2,3,1,4].map((width, i) => (
                <div key={i} style={{ width: `${width}px`, backgroundColor: '#000' }} />
              ))}
            </div>
            <div style={{ fontSize: '0.72rem', letterSpacing: '0.15em', marginTop: '2px' }}>
              *{sale.orderNumber}*
            </div>
          </div>

          {/* Footer Notice & Warranty */}
          <div style={{ textAlign: 'center', fontSize: '0.72rem', marginTop: '12px', color: '#374151' }}>
            <p>{settings.ticketFooter}</p>
            <p style={{ marginTop: '4px', fontWeight: 700 }}>¡Gracias por confiar en su tienda de repuestos!</p>
          </div>
        </div>

        {/* Panel de Envío a WhatsApp (PDF o Foto) - No se imprime */}
        <div className="no-print" style={{
          padding: '14px 20px',
          backgroundColor: 'var(--bg-secondary)',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
            <span>ENVIAR FACTURA TAL CUAL SALE EN SISTEMA POR WHATSAPP:</span>
            <span className="badge badge-success" style={{ fontSize: '0.68rem' }}>IVA ({taxRate}%) Desglosado</span>
          </div>

          {/* Selector de Formato (PDF preferido vs Foto) + Teléfono del cliente */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '6px', flex: '1 1 220px' }}>
              <button
                type="button"
                onClick={() => setShareFormat('pdf')}
                className={`btn btn-sm ${shareFormat === 'pdf' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1, gap: '6px', fontWeight: 700 }}
              >
                <FileText size={14} />
                <span>Documento PDF (Recomendado)</span>
              </button>
              <button
                type="button"
                onClick={() => setShareFormat('image')}
                className={`btn btn-sm ${shareFormat === 'image' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1, gap: '6px', fontWeight: 700 }}
              >
                <ImageIcon size={14} />
                <span>Foto (PNG)</span>
              </button>
            </div>

            <div style={{ position: 'relative', flex: '1 1 190px' }}>
              <Phone size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="tel"
                className="input"
                placeholder="WhatsApp cliente (ej: 58412...)"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                style={{ paddingLeft: '30px', paddingTop: '6px', paddingBottom: '6px', fontSize: '0.8rem', height: '34px' }}
              />
            </div>
          </div>

          {/* Botones de descarga directa rápida */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleDirectDownload('pdf')}
              disabled={isGenerating}
              style={{ flex: 1, fontSize: '0.76rem' }}
            >
              <Download size={14} />
              <span>Descargar PDF</span>
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleDirectDownload('image')}
              disabled={isGenerating}
              style={{ flex: 1, fontSize: '0.76rem' }}
            >
              <ImageIcon size={14} />
              <span>Descargar Foto</span>
            </button>
          </div>

          {statusNotice && (
            <div style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: statusNotice.type === 'success' ? 'var(--success-light)' : 'var(--warning-light)',
              border: `1px solid ${statusNotice.type === 'success' ? 'var(--success)' : 'var(--warning)'}`,
              color: statusNotice.type === 'success' ? 'var(--success)' : 'var(--warning)',
              fontSize: '0.76rem',
              lineHeight: 1.35,
              fontWeight: 600
            }}>
              {statusNotice.text}
            </div>
          )}
        </div>

        {/* Modal Action Buttons */}
        <div className="modal-footer no-print" style={{ flexWrap: 'wrap', gap: '8px' }}>
          <button className="btn btn-secondary" onClick={onClose}>
            Cerrar
          </button>
          <button 
            className="btn btn-success" 
            onClick={handleWhatsAppShare}
            disabled={isGenerating}
            style={{ fontWeight: 800, flex: 1 }}
          >
            <MessageCircle size={17} />
            <span>
              {isGenerating 
                ? 'Generando Factura...' 
                : `Enviar ${shareFormat === 'pdf' ? 'PDF' : 'Foto'} por WhatsApp`}
            </span>
          </button>
          <button className="btn btn-primary" onClick={handlePrint}>
            <Printer size={16} />
            <span>Imprimir</span>
          </button>
        </div>
      </div>
    </div>
  );
}
