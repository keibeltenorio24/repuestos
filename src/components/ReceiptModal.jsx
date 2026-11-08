import React, { useRef, useState, useEffect, useCallback } from 'react';
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
  Share2,
  Phone,
  Copy,
  Check
} from 'lucide-react';

export default function ReceiptModal({ sale, settings, onClose }) {
  const receiptRef = useRef(null);
  const [shareFormat, setShareFormat] = useState('pdf'); // 'pdf' (preferido) | 'image'
  const [customerPhone, setCustomerPhone] = useState(sale?.customer?.phone || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusNotice, setStatusNotice] = useState(null);
  const [copiedImage, setCopiedImage] = useState(false);

  // Archivos pre-generados en memoria para que al hacer clic en Enviar/Compartir sea instantáneo
  const [preparedFiles, setPreparedFiles] = useState({
    pdfBlob: null,
    pdfFile: null,
    pdfName: '',
    imgBlob: null,
    imgFile: null,
    imgName: ''
  });

  const isProforma = sale?.type === 'proforma';
  const typeLabel = isProforma 
    ? 'COTIZACIÓN / PROFORMA' 
    : (sale?.type === 'factura' ? 'FACTURA DE VENTA' : 'TICKET DE CAJA');

  const docPrefix = isProforma ? 'Proforma' : (sale?.type === 'factura' ? 'Factura' : 'Ticket');

  // Cálculo garantizado del desglose con IVA sumado al total
  const taxRate = Number(sale?.taxRate) > 0 
    ? Number(sale.taxRate) 
    : (Number(settings?.taxRate) > 0 ? Number(settings.taxRate) : 16);

  const rawSubtotal = Number(sale?.subtotal) > 0
    ? Number(sale.subtotal)
    : (sale?.items || []).reduce((acc, item) => acc + (Number(item.subtotal) || (item.qty * item.price)), 0);

  const discountAmount = Number(sale?.discount) || 0;
  const taxableBase = Math.max(0, rawSubtotal - discountAmount);
  const taxAmount = Number(sale?.tax) > 0 
    ? Number(sale.tax) 
    : (taxableBase * taxRate) / 100;
  const finalTotal = taxableBase + taxAmount;

  const paymentMethodLabel = sale?.paymentMethod === 'cash' 
    ? 'Efectivo' 
    : (sale?.paymentMethod === 'card' 
      ? 'Tarjeta / Punto' 
      : (sale?.paymentMethod === 'transfer' 
        ? 'Transferencia / Pago Móvil' 
        : (sale?.paymentMethod === 'credit' ? 'Crédito' : 'Pendiente')));

  // Función que captura el comprobante exacto del sistema y genera tanto el PDF como la Foto PNG
  const buildInvoiceFiles = useCallback(async () => {
    if (!receiptRef.current || !sale) return null;

    // Esperar a que las imágenes dentro del comprobante (ej. logo) estén cargadas
    const imgs = Array.from(receiptRef.current.querySelectorAll('img'));
    await Promise.all(
      imgs.map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise(res => {
          img.onload = res;
          img.onerror = res;
        });
      })
    );

    const canvas = await html2canvas(receiptRef.current, {
      scale: 3,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false
    });

    // 1. Generar PDF idéntico a la vista del sistema
    const imgData = canvas.toDataURL('image/png');
    const pdfWidth = 88; // mm
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [pdfWidth, pdfHeight]
    });

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
    const pdfBlob = pdf.output('blob');
    const pdfName = `${docPrefix}_${sale.orderNumber}.pdf`;
    const pdfFile = new File([pdfBlob], pdfName, { type: 'application/pdf' });

    // 2. Generar Foto PNG idéntica a la vista del sistema
    const imgBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png', 1.0));
    const imgName = `${docPrefix}_${sale.orderNumber}.png`;
    const imgFile = new File([imgBlob], imgName, { type: 'image/png' });

    const result = { pdfBlob, pdfFile, pdfName, imgBlob, imgFile, imgName };
    setPreparedFiles(result);
    return result;
  }, [sale, docPrefix]);

  // Pre-generar el PDF y la Foto apenas se abre la factura para poder enviarlos al instante
  useEffect(() => {
    const timer = setTimeout(() => {
      buildInvoiceFiles().catch(() => {});
    }, 200);
    return () => clearTimeout(timer);
  }, [buildInvoiceFiles, customerPhone]);

  if (!sale) return null;

  const handlePrint = () => {
    window.print();
  };

  // Mensaje corto de acompañamiento para cuando se adjunta el PDF o la Foto en WhatsApp
  const buildShortCaption = () => {
    const cur = settings.currencySymbol || '$';
    return (
      `📄 *${settings.storeName}* — Adjunto su *${typeLabel} N° ${sale.orderNumber}* ` +
      `a nombre de *${sale.customer.name}*.\n` +
      `• Base Imponible: ${cur}${taxableBase.toFixed(2)}\n` +
      `• + IVA (${taxRate}%): +${cur}${taxAmount.toFixed(2)}\n` +
      `• *TOTAL A PAGAR: ${cur}${finalTotal.toFixed(2)}*`
    );
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

  // Copiar la foto de la factura al portapapeles para pegarla con Ctrl + V directo en WhatsApp
  const handleCopyInvoiceImage = async () => {
    try {
      setIsGenerating(true);
      const files = preparedFiles.imgBlob ? preparedFiles : await buildInvoiceFiles();
      if (files?.imgBlob && navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new window.ClipboardItem({ 'image/png': files.imgBlob })
        ]);
        setCopiedImage(true);
        setTimeout(() => setCopiedImage(false), 4000);
        setStatusNotice({
          type: 'success',
          text: '✅ ¡Foto de la factura copiada! Ve al chat de WhatsApp y presiona Ctrl + V (Pegar) para enviar la imagen tal cual.'
        });
      } else {
        setStatusNotice({
          type: 'warning',
          text: 'Tu navegador no permite copiar imágenes automáticamente. Usa el botón Descargar Foto.'
        });
      }
    } catch (err) {
      console.error('Error al copiar imagen:', err);
      setStatusNotice({
        type: 'warning',
        text: 'No se pudo copiar al portapapeles. Se descargará el archivo para que lo adjuntes.'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Descarga directa de PDF o Foto
  const handleDirectDownload = async (format = 'pdf') => {
    try {
      setIsGenerating(true);
      setStatusNotice(null);
      const files = (format === 'pdf' ? preparedFiles.pdfBlob : preparedFiles.imgBlob)
        ? preparedFiles
        : await buildInvoiceFiles();

      if (!files) return;

      if (format === 'pdf') {
        triggerDownload(files.pdfBlob, files.pdfName);
        setStatusNotice({
          type: 'success',
          text: `📄 Documento PDF (${files.pdfName}) descargado tal cual como sale en sistema.`
        });
      } else {
        triggerDownload(files.imgBlob, files.imgName);
        setStatusNotice({
          type: 'success',
          text: `🖼️ Foto de la factura (${files.imgName}) descargada tal cual como sale en sistema.`
        });
      }
    } catch (err) {
      console.error('Error al descargar:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Compartir el archivo PDF o Foto directamente con el menú nativo del sistema / móvil hacia la App de WhatsApp
  const handleNativeFileShare = async () => {
    try {
      setIsGenerating(true);
      const files = preparedFiles.pdfFile ? preparedFiles : await buildInvoiceFiles();
      if (!files) return;

      const fileToShare = shareFormat === 'pdf' ? files.pdfFile : files.imgFile;

      if (navigator.canShare && navigator.canShare({ files: [fileToShare] })) {
        await navigator.share({
          files: [fileToShare],
          title: `${typeLabel} ${sale.orderNumber}`,
          text: buildShortCaption()
        });
        setStatusNotice({
          type: 'success',
          text: `✅ Archivo ${fileToShare.name} enviado directamente al selector de aplicaciones.`
        });
      } else {
        triggerDownload(
          shareFormat === 'pdf' ? files.pdfBlob : files.imgBlob,
          shareFormat === 'pdf' ? files.pdfName : files.imgName
        );
        setStatusNotice({
          type: 'warning',
          text: 'Tu navegador no soporta envío directo de archivos sin descarga. Se descargó el archivo para adjuntarlo en WhatsApp.'
        });
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Error al compartir archivo:', err);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Botón principal: Enviar PDF o Foto a WhatsApp tal cual como se descarga
  const handleWhatsAppShare = async () => {
    const cleanPhone = customerPhone ? customerPhone.replace(/[^0-9]/g, '') : '';
    const caption = buildShortCaption();
    const encoded = encodeURIComponent(caption);
    const waUrl = cleanPhone 
      ? `https://wa.me/${cleanPhone}?text=${encoded}` 
      : `https://wa.me/?text=${encoded}`;

    try {
      setIsGenerating(true);
      setStatusNotice(null);

      // Obtener archivos ya pre-generados (sin demora) o generarlos si aún no están listos
      const files = (preparedFiles.pdfFile && preparedFiles.imgFile)
        ? preparedFiles
        : await buildInvoiceFiles();

      if (!files) {
        window.open(waUrl, '_blank');
        return;
      }

      const targetFile = shareFormat === 'pdf' ? files.pdfFile : files.imgFile;
      const targetBlob = shareFormat === 'pdf' ? files.pdfBlob : files.imgBlob;
      const targetName = shareFormat === 'pdf' ? files.pdfName : files.imgName;

      // 1. Si no se especificó teléfono o si estamos en móvil/tablet con soporte de envío directo de archivo a WhatsApp:
      const isMobileOrTablet = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      if (isMobileOrTablet && navigator.canShare && navigator.canShare({ files: [targetFile] })) {
        try {
          await navigator.share({
            files: [targetFile],
            title: `${typeLabel} ${sale.orderNumber}`,
            text: caption
          });
          setStatusNotice({
            type: 'success',
            text: `✅ Factura (${targetName}) adjuntada directamente en WhatsApp.`
          });
          return;
        } catch (shareErr) {
          if (shareErr.name === 'AbortError') return;
        }
      }

      // 2. En PC / WhatsApp Web:
      // Copiamos SIEMPRE la imagen exacta de la factura al portapapeles (para que con solo presionar Ctrl+V en WhatsApp se pegue la factura visual)
      let copiedOk = false;
      if (navigator.clipboard && window.ClipboardItem && files.imgBlob) {
        try {
          await navigator.clipboard.write([
            new window.ClipboardItem({ 'image/png': files.imgBlob })
          ]);
          copiedOk = true;
          setCopiedImage(true);
          setTimeout(() => setCopiedImage(false), 5000);
        } catch {
          copiedOk = false;
        }
      }

      // Descargamos el archivo exacto elegido (PDF o Foto PNG)
      triggerDownload(targetBlob, targetName);

      // Abrimos el chat de WhatsApp del cliente
      window.open(waUrl, '_blank');

      if (shareFormat === 'pdf') {
        setStatusNotice({
          type: 'success',
          text: `✅ ¡Listo! Se descargó tu PDF "${targetName}" y se abrió WhatsApp. Para enviarlo en el chat: arrastra el archivo "${targetName}" desde tus Descargas al chat de WhatsApp (o presiona Ctrl + V en el chat para pegarla al instante como Foto).`
        });
      } else {
        setStatusNotice({
          type: 'success',
          text: copiedOk
            ? `✅ ¡Foto de la factura copiada al portapapeles y descargada (${targetName})! En el chat de WhatsApp que se abrió solo presiona Ctrl + V (Pegar) y envíala.`
            : `✅ Foto "${targetName}" descargada. Arrástrala o adjúntala al chat de WhatsApp que se abrió.`
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
        style={{ maxWidth: '520px', display: 'flex', flexDirection: 'column', maxHeight: '94vh', overflow: 'hidden' }}
      >
        <div className="modal-header no-print" style={{ flexShrink: 0, padding: '10px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 color="var(--success)" size={18} />
            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
              {isProforma ? 'Cotización Generada' : 'Factura / Comprobante Emitido'}
            </span>
          </div>
          <button className="btn btn-secondary btn-icon btn-sm" onClick={onClose} style={{ width: '30px', height: '30px' }}>
            <X size={15} />
          </button>
        </div>

        {/* Scrollable wrapper for the printable receipt on screen so footer buttons are always visible */}
        <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
          {/* Printable Ticket / Invoice Area (Este bloque exacto se convierte en el PDF y la Foto) */}
          <div 
            ref={receiptRef}
            className="printable-area" 
            style={{
              padding: '20px 22px',
              backgroundColor: '#ffffff',
              color: '#111827',
              fontFamily: "'JetBrains Mono', 'Courier New', Courier, monospace",
              fontSize: '0.8rem',
              lineHeight: '1.4'
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
        </div>

        {/* Panel de Envío a WhatsApp (PDF o Foto) - No se imprime */}
        <div className="no-print" style={{
          padding: '10px 16px',
          backgroundColor: 'var(--bg-secondary)',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          flexShrink: 0
        }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
            <span>FORMATO DE FACTURA PARA WHATSAPP:</span>
            <span className="badge badge-success" style={{ fontSize: '0.68rem' }}>IVA ({taxRate}%) Incluido</span>
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
                <span>Documento PDF</span>
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

          {/* Acciones rápidas para enviar/pegar/descargar el archivo exacto */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleCopyInvoiceImage}
              disabled={isGenerating}
              style={{ fontSize: '0.75rem', borderColor: copiedImage ? 'var(--success)' : undefined, color: copiedImage ? 'var(--success)' : undefined }}
              title="Copia la foto exacta de la factura para pegarla con Ctrl + V en WhatsApp"
            >
              {copiedImage ? <Check size={14} /> : <Copy size={14} />}
              <span>{copiedImage ? '¡Foto Copiada! (Ctrl+V)' : 'Copiar Foto (Pegar en WA)'}</span>
            </button>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleNativeFileShare}
              disabled={isGenerating}
              style={{ fontSize: '0.75rem' }}
              title="Abre el menú de compartir del sistema con el archivo PDF o Foto adjunto"
            >
              <Share2 size={14} />
              <span>Compartir Archivo {shareFormat === 'pdf' ? 'PDF' : 'Foto'}</span>
            </button>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleDirectDownload(shareFormat)}
              disabled={isGenerating}
              style={{ fontSize: '0.75rem' }}
            >
              <Download size={14} />
              <span>Descargar {shareFormat === 'pdf' ? 'PDF' : 'Foto'}</span>
            </button>
          </div>

          {statusNotice && (
            <div style={{
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: statusNotice.type === 'success' ? 'var(--success-light)' : 'var(--warning-light)',
              border: `1px solid ${statusNotice.type === 'success' ? 'var(--success)' : 'var(--warning)'}`,
              color: statusNotice.type === 'success' ? 'var(--success)' : 'var(--warning)',
              fontSize: '0.76rem',
              lineHeight: 1.4,
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
                ? 'Preparando Factura...' 
                : `Enviar ${shareFormat === 'pdf' ? 'PDF' : 'Foto'} a WhatsApp`}
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
