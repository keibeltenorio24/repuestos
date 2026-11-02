import React, { useState } from 'react';
import { 
  Settings, 
  Store, 
  Save, 
  Download, 
  Upload, 
  RotateCcw, 
  CheckCircle2, 
  ShieldAlert, 
  Server, 
  Database,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { storage } from '../services/storage';

export default function SettingsView({ 
  settings, 
  onUpdateSettings, 
  onReloadAll, 
  onClearSales,
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

  const handleResetDemo = () => {
    if (window.confirm("¿Seguro que deseas restablecer todos los datos a la demostración inicial? Se borrarán las ventas nuevas.")) {
      storage.resetToDemo();
      onReloadAll();
      alert("Datos restablecidos a la demostración inicial.");
    }
  };

  const handleClearSales = () => {
    if (window.confirm("¿Deseas poner las estadísticas y ventas en CERO ($0.00) para presentar al cliente? El catálogo de repuestos se mantendrá.")) {
      if (onClearSales) {
        onClearSales();
      } else {
        storage.clearSales();
        onReloadAll();
      }
      alert("¡Estadísticas y ventas puestas en cero exitosamente!");
    }
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
    <div style={{ padding: 'clamp(12px, 2.5vw, 24px)', maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }} className="animate-fade-in">
      <div>
        <h2 style={{ fontSize: 'clamp(1.15rem, 3.5vw, 1.4rem)', fontWeight: 800 }}>Configuración de la Tienda (Marca Blanca)</h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          Personaliza los datos de tu cliente para comprobantes, moneda local, teléfono de WhatsApp y respaldos de base de datos.
        </p>
      </div>

      {saveSuccess && (
        <div style={{
          backgroundColor: 'var(--success-light)',
          border: '1px solid var(--success)',
          color: 'var(--success)',
          padding: '12px 16px',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.88rem',
          fontWeight: 600
        }}>
          <CheckCircle2 size={18} />
          <span>¡Configuración guardada exitosamente! Los cambios se aplican de inmediato en tickets y pantallas.</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSubmit} style={{
        backgroundColor: 'var(--bg-secondary)',
        padding: 'clamp(14px, 2.5vw, 24px)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
          Datos Comerciales de la Empresa
        </h3>

        <div className="responsive-form-grid-2">
          <div className="input-group">
            <label className="input-label">Nombre Comercial de la Tienda *</label>
            <input
              type="text"
              className="input"
              value={formData.storeName}
              onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
              required
            />
          </div>

          <div className="input-group">
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
          <div className="input-group">
            <label className="input-label">Identificación Fiscal (RIF / NIT / RUT / RFC) *</label>
            <input
              type="text"
              className="input mono"
              value={formData.taxId}
              onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">Teléfono de la Tienda</label>
            <input
              type="text"
              className="input"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div className="input-group">
            <label className="input-label">WhatsApp para Pedidos y Cotizaciones *</label>
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

        <div className="input-group">
          <label className="input-label">Dirección Física del Local</label>
          <input
            type="text"
            className="input"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
        </div>

        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginTop: '10px' }}>
          Identidad Visual y Logotipo
        </h3>

        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div style={{
            width: '84px',
            height: '84px',
            borderRadius: '12px',
            overflow: 'hidden',
            border: '2px solid rgba(0, 229, 255, 0.5)',
            boxShadow: '0 0 16px rgba(0, 229, 255, 0.35)',
            backgroundColor: '#050811',
            flexShrink: 0
          }}>
            <img src={formData.logoUrl || '/logo.jpg'} alt="Logo de la tienda" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ flex: 1 }}>
            <label className="input-label">Ruta o URL del Logotipo Oficial</label>
            <input
              type="text"
              className="input"
              value={formData.logoUrl || '/logo.jpg'}
              onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
            />
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Este logotipo se muestra en la barra lateral, cabecera principal y comprobantes impresos.
            </p>
          </div>
        </div>

        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginTop: '10px' }}>
          Moneda e Impuestos
        </h3>

        <div className="responsive-form-grid-2">
          <div className="input-group">
            <label className="input-label">Símbolo de Moneda ($, S/., COP, MXN, €)</label>
            <input
              type="text"
              className="input mono"
              value={formData.currencySymbol}
              onChange={(e) => setFormData({ ...formData, currencySymbol: e.target.value })}
              style={{ fontWeight: 800, fontSize: '1.1rem' }}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Porcentaje de Impuesto / IVA (%)</label>
            <input
              type="number"
              step="any"
              className="input"
              value={formData.taxRate}
              onChange={(e) => setFormData({ ...formData, taxRate: parseFloat(e.target.value) || 0 })}
            />
          </div>
        </div>

        <div className="input-group">
          <label className="input-label">Términos de Garantía y Pie de Página en Tickets</label>
          <textarea
            className="textarea"
            rows={2}
            value={formData.ticketFooter}
            onChange={(e) => setFormData({ ...formData, ticketFooter: e.target.value })}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '10px' }}>
          <button type="submit" className="btn btn-primary btn-lg" style={{ fontWeight: 800, width: '100%', maxWidth: '380px', justifyContent: 'center' }}>
            <Save size={18} />
            <span>Guardar Configuración de la Tienda</span>
          </button>
        </div>
      </form>

      {/* Backup & Data Administration */}
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        padding: 'clamp(14px, 2.5vw, 24px)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Database size={22} color="var(--primary)" />
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Respaldo y Restauración de Base de Datos</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Exporta la base completa de repuestos, precios y ventas para migración o seguridad.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', paddingTop: '8px' }}>
          <button type="button" className="btn btn-secondary" onClick={handleExportBackup}>
            <Download size={16} />
            <span>Descargar Backup Completo (JSON)</span>
          </button>

          <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
            <Upload size={16} />
            <span>Restaurar desde Archivo Backup</span>
            <input
              type="file"
              accept=".json"
              style={{ display: 'none' }}
              onChange={handleImportBackup}
            />
          </label>

          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={handleClearAllData}
            style={{ 
              borderColor: 'rgba(0, 229, 255, 0.45)', 
              color: 'var(--accent-cyan)',
              backgroundColor: 'rgba(0, 229, 255, 0.08)',
              fontWeight: 700
            }}
          >
            <Sparkles size={16} />
            <span>Poner TODAS las Estadísticas en Cero (Para Clientes)</span>
          </button>

          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={handleLoadDemo}
            style={{ color: 'var(--text-primary)' }}
          >
            <RotateCcw size={16} />
            <span>Cargar Catálogo Demo (17 Repuestos)</span>
          </button>
        </div>
      </div>

      {/* Info Card: Laragon / Laravel API Architecture */}
      <div style={{
        backgroundColor: 'var(--bg-tertiary)',
        padding: '20px 24px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-accent)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '16px'
      }}>
        <Server size={26} color="var(--accent-cyan)" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Arquitectura Desacoplada: Listo para Conectar con Laravel y Laragon
          </h4>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.45 }}>
            Este software cuenta con una capa de servicios aislada en <code className="mono">src/services/api.js</code>. 
            Actualmente guarda todo localmente a máxima velocidad. Si deseas conectar un backend Laravel en Laragon (MySQL / SQLite), solo debes cambiar la constante <code className="mono">USE_LARAVEL_API = true</code> y la aplicación consumirá los endpoints REST sin tener que modificar una sola línea de la interfaz.
          </p>
        </div>
      </div>
    </div>
  );
}
