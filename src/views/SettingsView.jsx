import React, { useState } from 'react';
import { 
  Save, 
  Download, 
  Upload, 
  RotateCcw, 
  CheckCircle2, 
  Server, 
  Database,
  Sparkles,
  Printer
} from 'lucide-react';
import { storage } from '../services/storage';
import { printTestThermalTicket } from '../services/thermalPrinter';

export default function SettingsView({ 
  settings, 
  onUpdateSettings, 
  onReloadAll, 
  onClearAllData,
  onLoadDemoParts
}) {
  const [formData, setFormData] = useState({ ...settings });
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdateSettings(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleExportBackup = () => {
    const backupJson = storage.exportFullBackup();
    const blob = new Blob([backupJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `backup_autopartes_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportBackup = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const res = storage.importFullBackup(event.target.result);
      if (res.success) {
        alert("¡Copia de seguridad restaurada exitosamente!");
        onReloadAll();
      } else {
        alert("Error al importar copia de seguridad: " + res.error);
      }
    };
    reader.readAsText(file);
  };

  const handleClearAllData = () => {
    if (window.confirm("¿Deseas poner TODAS las estadísticas en cero (Alertas de stock = 0, Valor de inventario = $0.00, Catálogo = 0 SKUs, Ventas = $0.00)? El sistema quedará 100% limpio para tu cliente.")) {
      if (onClearAllData) {
        onClearAllData();
      } else {
        storage.clearAllData();
        onReloadAll();
      }
      alert("¡Todas las estadísticas y datos se han puesto en cero exitosamente!");
    }
  };

  const handleLoadDemo = () => {
    if (window.confirm("¿Deseas cargar los 17 repuestos de demostración (motos y aceites de carro)?")) {
      if (onLoadDemoParts) {
        onLoadDemoParts();
      } else {
        storage.loadDemoData();
        onReloadAll();
      }
      alert("¡Catálogo de demostración cargado con éxito!");
    }
  };

  return (
    <div className="view-full-screen animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', flexShrink: 0 }}>
        <div>
          <h2 style={{ fontSize: 'clamp(1.05rem, 2.5vw, 1.25rem)', fontWeight: 800, lineHeight: 1.2 }}>
            Configuración de la Tienda (Marca Blanca)
          </h2>
          <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
            Personaliza los datos para comprobantes, moneda, IVA, WhatsApp y respaldos de base de datos.
          </p>
        </div>

        {saveSuccess && (
          <div style={{
            backgroundColor: 'var(--success-light)',
            border: '1px solid var(--success)',
            color: 'var(--success)',
            padding: '6px 12px',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.78rem',
            fontWeight: 600
          }}>
            <CheckCircle2 size={15} />
            <span>¡Configuración guardada exitosamente!</span>
          </div>
        )}
      </div>

      {/* Two-Column Desktop Layout (Fits 100% inside computer screen) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))',
        gap: '12px',
        flex: 1,
        minHeight: 0,
        overflowY: 'auto'
      }}>
        {/* LEFT COLUMN: Datos Comerciales, Logo, Moneda e Impuestos */}
        <form onSubmit={handleSubmit} style={{
          backgroundColor: 'var(--bg-secondary)',
          padding: '14px 18px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <h3 style={{ fontSize: '0.92rem', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', color: 'var(--accent-cyan)' }}>
              1. Datos Comerciales y Fiscales
            </h3>

            <div className="responsive-form-grid-2">
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Nombre Comercial de la Tienda *</label>
                <input
                  type="text"
                  className="input"
                  value={formData.storeName}
                  onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                  required
                />
              </div>

              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Razón Social Legal *</label>
                <input
                  type="text"
                  className="input"
                  value={formData.legalName}
                  onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="responsive-form-grid-3">
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">RIF / NIT / RUT *</label>
                <input
                  type="text"
                  className="input mono"
                  value={formData.taxId}
                  onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                  required
                />
              </div>

              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Teléfono Tienda</label>
                <input
                  type="text"
                  className="input"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">WhatsApp Pedidos *</label>
                <input
                  type="text"
                  className="input"
                  placeholder="+58 414 1234567"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Dirección Física del Local</label>
              <input
                type="text"
                className="input"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <h3 style={{ fontSize: '0.92rem', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', marginTop: '4px', color: 'var(--accent-cyan)' }}>
              2. Logotipo, Moneda, IVA y Garantía
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr 90px 100px', gap: '10px', alignItems: 'center' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '10px',
                overflow: 'hidden',
                border: '1.5px solid rgba(0, 229, 255, 0.5)',
                backgroundColor: '#050811',
                flexShrink: 0
              }}>
                <img src={formData.logoUrl || '/logo.jpg'} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>

              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Ruta / URL del Logotipo</label>
                <input
                  type="text"
                  className="input"
                  value={formData.logoUrl || '/logo.jpg'}
                  onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                />
              </div>

              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Moneda</label>
                <input
                  type="text"
                  className="input mono"
                  value={formData.currencySymbol}
                  onChange={(e) => setFormData({ ...formData, currencySymbol: e.target.value })}
                  style={{ fontWeight: 800, textAlign: 'center' }}
                />
              </div>

              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">IVA (%)</label>
                <input
                  type="number"
                  step="any"
                  className="input"
                  value={formData.taxRate}
                  onChange={(e) => setFormData({ ...formData, taxRate: parseFloat(e.target.value) || 0 })}
                  style={{ fontWeight: 700 }}
                />
              </div>
            </div>

            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Términos de Garantía y Pie de Página en Facturas / Tickets</label>
              <textarea
                className="textarea"
                rows={2}
                value={formData.ticketFooter}
                onChange={(e) => setFormData({ ...formData, ticketFooter: e.target.value })}
                style={{ padding: '6px 10px', fontSize: '0.8rem' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '6px', borderTop: '1px solid var(--border-color)' }}>
            <button type="submit" className="btn btn-primary" style={{ fontWeight: 800, width: '100%', justifyContent: 'center', padding: '9px 18px' }}>
              <Save size={16} />
              <span>Guardar Configuración de la Tienda</span>
            </button>
          </div>
        </form>

        {/* RIGHT COLUMN: Impresora Térmica NT-5890K & Respaldo de Base de Datos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Thermal Printer NT-5890K Card (AT THE TOP OF RIGHT COLUMN) */}
          <div style={{
            backgroundColor: 'var(--bg-secondary)',
            padding: '14px 18px',
            borderRadius: 'var(--radius-lg)',
            border: '1.5px solid var(--accent-cyan)',
            boxShadow: '0 0 16px rgba(0, 229, 255, 0.12)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Printer size={20} color="var(--accent-cyan)" />
                <div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                    🖨️ Impresora de Tickets: NT-5890K (58mm)
                  </h3>
                  <p style={{ fontSize: '0.73rem', color: 'var(--text-secondary)' }}>
                    Vinculada para imprimir facturas y tickets en rollo térmico de 58mm sin afectar WhatsApp.
                  </p>
                </div>
              </div>
              <span className="badge badge-success" style={{ fontSize: '0.68rem' }}>Vinculada</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '10px', alignItems: 'end' }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Modelo y Ancho de Papel Térmico</label>
                <select
                  className="select"
                  value={formData.printerWidth || '58mm'}
                  onChange={(e) => {
                    const updated = { ...formData, printerWidth: e.target.value };
                    setFormData(updated);
                    onUpdateSettings(updated);
                  }}
                >
                  <option value="58mm">🖨️ Impresora Térmica NT-5890K (Rollo 58mm)</option>
                  <option value="80mm">🖨️ Impresora Térmica Estándar (Rollo 80mm)</option>
                </select>
              </div>

              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => printTestThermalTicket(formData)}
                style={{ height: '36px', fontWeight: 800 }}
              >
                <Printer size={15} />
                <span>Probar Impresora NT-5890K</span>
              </button>
            </div>
          </div>

          {/* Backup & Data Administration */}
          <div style={{
            backgroundColor: 'var(--bg-secondary)',
            padding: '14px 18px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
              <Database size={20} color="var(--primary)" />
              <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Respaldo y Administración de Base de Datos</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Exporta o restaura la base completa de repuestos, precios y ventas.
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button type="button" className="btn btn-secondary btn-sm" onClick={handleExportBackup} style={{ padding: '10px 12px', justifyContent: 'center' }}>
                <Download size={15} />
                <span>Descargar Backup (JSON)</span>
              </button>

              <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', padding: '10px 12px', justifyContent: 'center' }}>
                <Upload size={15} />
                <span>Restaurar desde Backup</span>
                <input
                  type="file"
                  accept=".json"
                  style={{ display: 'none' }}
                  onChange={handleImportBackup}
                />
              </label>

              <button 
                type="button" 
                className="btn btn-secondary btn-sm" 
                onClick={handleClearAllData}
                style={{ 
                  borderColor: 'rgba(0, 229, 255, 0.45)', 
                  color: 'var(--accent-cyan)',
                  backgroundColor: 'rgba(0, 229, 255, 0.08)',
                  fontWeight: 700,
                  padding: '10px 12px',
                  gridColumn: '1 / -1',
                  justifyContent: 'center'
                }}
              >
                <Sparkles size={15} />
                <span>Poner TODAS las Estadísticas en Cero (Para Clientes)</span>
              </button>

              <button 
                type="button" 
                className="btn btn-secondary btn-sm" 
                onClick={handleLoadDemo}
                style={{ color: 'var(--text-primary)', padding: '10px 12px', gridColumn: '1 / -1', justifyContent: 'center' }}
              >
                <RotateCcw size={15} />
                <span>Cargar Catálogo Demo (17 Repuestos)</span>
              </button>
            </div>
          </div>

          {/* Info Card: Laragon / Laravel API Architecture */}
          <div style={{
            backgroundColor: 'var(--bg-tertiary)',
            padding: '14px 18px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-accent)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
          }}>
            <Server size={22} color="var(--accent-cyan)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Arquitectura Desacoplada: Listo para Laravel y Laragon
              </h4>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '3px', lineHeight: 1.4 }}>
                Capa de servicios aislada en <code className="mono">src/services/api.js</code>. 
                Para conectar con un backend Laravel en Laragon (MySQL / SQLite), cambia <code className="mono">USE_LARAVEL_API = true</code> y consumirá los endpoints REST automáticamente.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
