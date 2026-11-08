/**
 * Servicio de Impresión Térmica Especializado para NT-5890K (58mm ESC/POS) y 80mm
 * - No afecta la vista en pantalla ni el diseño del PDF/Foto para WhatsApp.
 * - Genera un formato de alto contraste 100% negro puro (#000) calibrado a 48mm de área imprimible
 *   (estándar de cabezal térmico para rollo de 58mm en la impresora NT-5890K).
 */

export function printThermalTicket(sale, settings, customPaperWidth) {
  if (!sale) return;

  const paperWidth = customPaperWidth || settings?.printerWidth || '58mm';
  const is58mm = paperWidth === '58mm';
  // La impresora térmica NT-5890K usa papel de 58mm con ancho efectivo de impresión de 48mm
  const printableWidth = is58mm ? '48mm' : '72mm';

  const cur = settings?.currencySymbol || '$';
  const isProforma = sale?.type === 'proforma';
  const typeLabel = isProforma
    ? 'COTIZACION / PROFORMA'
    : (sale?.type === 'factura' ? 'FACTURA DE VENTA' : 'TICKET DE CAJA');

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
    ? 'EFECTIVO'
    : (sale?.paymentMethod === 'card'
      ? 'TARJETA / PUNTO'
      : (sale?.paymentMethod === 'transfer'
        ? 'TRANSFERENCIA / PAGO MOVIL'
        : (sale?.paymentMethod === 'credit' ? 'CREDITO' : 'PENDIENTE')));

  const dateObj = sale?.date ? new Date(sale.date) : new Date();
  const dateStr = dateObj.toLocaleDateString();
  const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const itemsHtml = (sale?.items || []).map((item) => {
    const lineSubtotal = Number(item.subtotal) || (item.qty * item.price);
    return `
      <div class="item-row">
        <div class="item-name">${escapeHtml(item.name)}</div>
        <div class="item-meta">
          <span>${item.qty} x ${cur}${Number(item.price).toFixed(2)} ${item.sku ? `(${escapeHtml(item.sku)})` : ''}</span>
          <span class="item-sub">${cur}${lineSubtotal.toFixed(2)}</span>
        </div>
      </div>
    `;
  }).join('');

  const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>${typeLabel} ${sale.orderNumber}</title>
  <style>
    @page {
      size: ${paperWidth} auto;
      margin: 0mm;
    }
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      color: #000000 !important;
      background: transparent !important;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    html, body {
      width: ${paperWidth};
      background-color: #ffffff !important;
      font-family: 'Courier New', Courier, monospace;
      font-size: ${is58mm ? '11px' : '12px'};
      line-height: 1.28;
      font-weight: 600;
    }
    .ticket-wrapper {
      width: ${printableWidth};
      margin: 0 auto;
      padding: 2mm 0 12mm 0; /* 12mm abajo para avance de corte en NT-5890K */
    }
    .center {
      text-align: center;
    }
    .store-title {
      font-size: ${is58mm ? '14px' : '16px'};
      font-weight: 900;
      text-transform: uppercase;
      margin-bottom: 2px;
    }
    .store-sub {
      font-size: ${is58mm ? '10px' : '11px'};
      font-weight: 700;
    }
    .divider {
      border-top: 1px dashed #000000;
      margin: 5px 0;
    }
    .double-divider {
      border-top: 2px solid #000000;
      margin: 5px 0;
    }
    .doc-badge {
      text-align: center;
      font-weight: 900;
      font-size: ${is58mm ? '12px' : '13px'};
      border: 1px solid #000000;
      padding: 2px 0;
      margin: 4px 0;
    }
    .kv-row {
      display: flex;
      justify-content: space-between;
      font-size: ${is58mm ? '10.5px' : '11.5px'};
      margin: 1.5px 0;
    }
    .kv-row strong {
      font-weight: 900;
    }
    .items-header {
      display: flex;
      justify-content: space-between;
      font-weight: 900;
      font-size: ${is58mm ? '10.5px' : '11.5px'};
      border-bottom: 1px solid #000000;
      padding-bottom: 2px;
      margin-bottom: 4px;
    }
    .item-row {
      margin-bottom: 5px;
    }
    .item-name {
      font-weight: 800;
      font-size: ${is58mm ? '11px' : '12px'};
      word-wrap: break-word;
    }
    .item-meta {
      display: flex;
      justify-content: space-between;
      font-size: ${is58mm ? '10.5px' : '11.5px'};
    }
    .item-sub {
      font-weight: 900;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      font-size: ${is58mm ? '13px' : '14px'};
      font-weight: 900;
      border-top: 2px solid #000000;
      border-bottom: 2px solid #000000;
      padding: 4px 0;
      margin-top: 3px;
    }
    .footer-note {
      text-align: center;
      font-size: ${is58mm ? '9.5px' : '10.5px'};
      margin-top: 6px;
      line-height: 1.25;
    }
  </style>
</head>
<body>
  <div class="ticket-wrapper">
    <div class="center">
      <div class="store-title">${escapeHtml(settings?.storeName || 'TIENDA DE REPUESTOS')}</div>
      <div class="store-sub">${escapeHtml(settings?.legalName || '')}</div>
      <div class="store-sub">RIF: ${escapeHtml(settings?.taxId || '')}</div>
      ${settings?.address ? `<div class="store-sub">${escapeHtml(settings.address)}</div>` : ''}
      ${settings?.phone ? `<div class="store-sub">TEL: ${escapeHtml(settings.phone)}</div>` : ''}
    </div>

    <div class="divider"></div>

    <div class="doc-badge">${typeLabel}</div>

    <div class="kv-row">
      <span>NRO CONTROL:</span>
      <strong>${escapeHtml(sale.orderNumber)}</strong>
    </div>
    <div class="kv-row">
      <span>FECHA:</span>
      <span>${dateStr} ${timeStr}</span>
    </div>
    <div class="kv-row">
      <span>PAGO:</span>
      <strong>${paymentMethodLabel}</strong>
    </div>

    <div class="divider"></div>

    <div style="font-size: ${is58mm ? '10.5px' : '11.5px'};">
      <div><strong>CLIENTE:</strong> ${escapeHtml(sale?.customer?.name || 'Consumidor Final')}</div>
      <div><strong>CI/RIF:</strong> ${escapeHtml(sale?.customer?.docId || 'Sin documento')}</div>
      ${sale?.customer?.phone ? `<div><strong>TEL:</strong> ${escapeHtml(sale.customer.phone)}</div>` : ''}
    </div>

    <div class="divider"></div>

    <div class="items-header">
      <span>DESCRIPCION / CANT x P.UNIT</span>
      <span>SUBT.</span>
    </div>

    ${itemsHtml}

    <div class="divider"></div>

    <div class="kv-row">
      <span>SUBTOTAL (SIN IVA):</span>
      <span>${cur}${rawSubtotal.toFixed(2)}</span>
    </div>
    ${discountAmount > 0 ? `
    <div class="kv-row">
      <span>DESCUENTO:</span>
      <span>-${cur}${discountAmount.toFixed(2)}</span>
    </div>
    ` : ''}
    <div class="kv-row">
      <span>BASE IMPONIBLE:</span>
      <span>${cur}${taxableBase.toFixed(2)}</span>
    </div>
    <div class="kv-row">
      <strong>+ IVA (${taxRate}%):</strong>
      <strong>+${cur}${taxAmount.toFixed(2)}</strong>
    </div>

    <div class="total-row">
      <span>TOTAL CON IVA:</span>
      <span>${cur}${finalTotal.toFixed(2)}</span>
    </div>

    <div class="center" style="margin-top: 6px; font-size: 11px; letter-spacing: 2px;">
      *${escapeHtml(sale.orderNumber)}*
    </div>

    <div class="footer-note">
      <div>${escapeHtml(settings?.ticketFooter || '')}</div>
      <div style="margin-top: 4px; font-weight: 900;">¡GRACIAS POR SU COMPRA!</div>
      <div style="margin-top: 8px;">. . . . . . . . . . . . . . . . .</div>
    </div>
  </div>
</body>
</html>`;

  // Crear iframe oculto aislado para lanzar el diálogo de impresión de Windows directo a la NT-5890K
  const existingIframe = document.getElementById('thermal-print-iframe');
  if (existingIframe) {
    document.body.removeChild(existingIframe);
  }

  const iframe = document.createElement('iframe');
  iframe.id = 'thermal-print-iframe';
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(htmlContent);
  doc.close();

  setTimeout(() => {
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
  }, 180);
}

/**
 * Envío directo por puerto serie / USB (ESC/POS) mediante WebSerial API (Chrome / Edge)
 * Ideal si el usuario desea imprimir al instante en la NT-5890K sin abrir la ventana de Windows.
 */
export async function printEscPosSerial(sale, settings) {
  if (!('serial' in navigator)) {
    throw new Error('Tu navegador no soporta WebSerial directo. Usa el botón "Imprimir en NT-5890K".');
  }

  const port = await navigator.serial.requestPort();
  await port.open({ baudRate: 9600 });

  const encoder = new TextEncoder();
  const writer = port.writable.getWriter();

  const cur = settings?.currencySymbol || '$';
  const taxRate = Number(sale?.taxRate) > 0
    ? Number(sale.taxRate)
    : (Number(settings?.taxRate) > 0 ? Number(settings.taxRate) : 16);
  const rawSubtotal = Number(sale?.subtotal) || 0;
  const discountAmount = Number(sale?.discount) || 0;
  const taxableBase = Math.max(0, rawSubtotal - discountAmount);
  const taxAmount = Number(sale?.tax) > 0 ? Number(sale.tax) : (taxableBase * taxRate) / 100;
  const finalTotal = taxableBase + taxAmount;

  const ESC = '\x1B';
  const GS = '\x1D';
  const INIT = ESC + '@';
  const CENTER = ESC + 'a' + '\x01';
  const LEFT = ESC + 'a' + '\x00';
  const BOLD_ON = ESC + 'E' + '\x01';
  const BOLD_OFF = ESC + 'E' + '\x00';
  const CUT = GS + 'V' + '\x41' + '\x03';

  let receipt = INIT;
  receipt += CENTER + BOLD_ON + cleanAscii(settings?.storeName || 'REPUESTOS') + '\n' + BOLD_OFF;
  receipt += cleanAscii(settings?.legalName || '') + '\n';
  receipt += 'RIF: ' + cleanAscii(settings?.taxId || '') + '\n';
  receipt += '--------------------------------\n';
  receipt += BOLD_ON + 'FACTURA / TICKET: ' + cleanAscii(sale.orderNumber) + '\n' + BOLD_OFF;
  receipt += LEFT;
  receipt += 'Fecha: ' + new Date(sale.date).toLocaleString() + '\n';
  receipt += 'Cliente: ' + cleanAscii(sale?.customer?.name || 'Consumidor Final') + '\n';
  receipt += 'CI/RIF: ' + cleanAscii(sale?.customer?.docId || 'N/A') + '\n';
  receipt += '--------------------------------\n';

  (sale?.items || []).forEach(item => {
    const sub = Number(item.subtotal) || (item.qty * item.price);
    receipt += cleanAscii(item.name).slice(0, 32) + '\n';
    const leftCol = `${item.qty} x ${cur}${Number(item.price).toFixed(2)}`;
    const rightCol = `${cur}${sub.toFixed(2)}`;
    const spaces = Math.max(1, 32 - leftCol.length - rightCol.length);
    receipt += leftCol + ' '.repeat(spaces) + rightCol + '\n';
  });

  receipt += '--------------------------------\n';
  receipt += formatLine32('SUBTOTAL (SIN IVA):', `${cur}${rawSubtotal.toFixed(2)}`);
  if (discountAmount > 0) {
    receipt += formatLine32('DESCUENTO:', `-${cur}${discountAmount.toFixed(2)}`);
  }
  receipt += formatLine32('BASE IMPONIBLE:', `${cur}${taxableBase.toFixed(2)}`);
  receipt += formatLine32(`+ IVA (${taxRate}%):`, `+${cur}${taxAmount.toFixed(2)}`);
  receipt += '================================\n';
  receipt += BOLD_ON + formatLine32('TOTAL CON IVA:', `${cur}${finalTotal.toFixed(2)}`) + BOLD_OFF;
  receipt += '================================\n';
  receipt += CENTER + cleanAscii(settings?.ticketFooter || '') + '\n';
  receipt += 'GRACIAS POR SU COMPRA\n\n\n\n';
  receipt += CUT;

  await writer.write(encoder.encode(receipt));
  writer.releaseLock();
  await port.close();
}

export function printTestThermalTicket(settings) {
  const demoSale = {
    orderNumber: 'TEST-5890K',
    type: 'factura',
    date: new Date().toISOString(),
    paymentMethod: 'cash',
    customer: {
      name: 'PRUEBA IMPRESORA NT-5890K',
      docId: 'V-00000000',
      phone: settings?.phone || ''
    },
    items: [
      {
        sku: 'REP-001',
        name: 'Repuesto de Prueba Calibracion 58mm',
        qty: 1,
        price: 10.00,
        subtotal: 10.00
      }
    ],
    subtotal: 10.00,
    discount: 0,
    taxRate: Number(settings?.taxRate) || 16,
    tax: 1.60,
    total: 11.60
  };
  printThermalTicket(demoSale, settings, settings?.printerWidth || '58mm');
}

function formatLine32(left, right) {
  const l = cleanAscii(left);
  const r = cleanAscii(right);
  const spaces = Math.max(1, 32 - l.length - r.length);
  return l + ' '.repeat(spaces) + r + '\n';
}

function cleanAscii(str) {
  return String(str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x20-\x7E]/g, '');
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

