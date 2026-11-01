import { INITIAL_PARTS, INITIAL_SALES, INITIAL_SETTINGS, VEHICLE_DATABASE } from '../data/mockData';

const STORAGE_KEYS = {
  PARTS: 'bgmultiservicios_parts_v4',
  SALES: 'bgmultiservicios_sales_v3',
  SETTINGS: 'bgmultiservicios_settings_v3',
  VEHICLES: 'bgmultiservicios_vehicles_v3',
  THEME: 'bgmultiservicios_theme_v3'
};

export const storage = {
  // Inicialización de datos
  init() {
    if (!localStorage.getItem(STORAGE_KEYS.PARTS)) {
      localStorage.setItem(STORAGE_KEYS.PARTS, JSON.stringify(INITIAL_PARTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SALES)) {
      localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(INITIAL_SALES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.VEHICLES)) {
      localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(VEHICLE_DATABASE));
    }
  },

  // Repuestos
  getParts() {
    this.init();
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.PARTS);
      const stored = raw ? JSON.parse(raw) : INITIAL_PARTS;
      const updated = (stored && stored.length > 0 ? stored : INITIAL_PARTS).map(p => {
        const match = INITIAL_PARTS.find(ip => ip.id === p.id || ip.sku === p.sku);
        return {
          ...p,
          image: p.image || match?.image || '/products/kit_arrastre.jpg'
        };
      });
      localStorage.setItem(STORAGE_KEYS.PARTS, JSON.stringify(updated));
      return updated;
    } catch {
      return INITIAL_PARTS;
    }
  },

  saveParts(parts) {
    localStorage.setItem(STORAGE_KEYS.PARTS, JSON.stringify(parts));
  },

  // Ventas y Cotizaciones
  getSales() {
    this.init();
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.SALES)) || [];
    } catch {
      return INITIAL_SALES;
    }
  },

  saveSales(sales) {
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
  },

  // Configuración de la tienda (Marca blanca)
  getSettings() {
    this.init();
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS)) || INITIAL_SETTINGS;
      if (!stored.logoUrl) {
        stored.logoUrl = '/logo.jpg';
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(stored));
      }
      return stored;
    } catch {
      return { ...INITIAL_SETTINGS, logoUrl: '/logo.jpg' };
    }
  },

  saveSettings(settings) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },

  // Base de datos de vehículos
  getVehicles() {
    this.init();
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.VEHICLES)) || VEHICLE_DATABASE;
    } catch {
      return VEHICLE_DATABASE;
    }
  },

  saveVehicles(vehicles) {
    localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(vehicles));
  },

  // Tema
  getTheme() {
    return localStorage.getItem(STORAGE_KEYS.THEME) || 'dark';
  },

  setTheme(theme) {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  },

  // Exportar Backup Completo
  exportFullBackup() {
    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      settings: this.getSettings(),
      parts: this.getParts(),
      sales: this.getSales(),
      vehicles: this.getVehicles()
    };
    return JSON.stringify(backup, null, 2);
  },

  // Importar Backup Completo
  importFullBackup(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (data.parts && Array.isArray(data.parts)) {
        localStorage.setItem(STORAGE_KEYS.PARTS, JSON.stringify(data.parts));
      }
      if (data.sales && Array.isArray(data.sales)) {
        localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(data.sales));
      }
      if (data.settings) {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
      }
      if (data.vehicles && Array.isArray(data.vehicles)) {
        localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(data.vehicles));
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  // Restablecer Datos de Demostración
  resetToDemo() {
    localStorage.setItem(STORAGE_KEYS.PARTS, JSON.stringify(INITIAL_PARTS));
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(INITIAL_SALES));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
    localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(VEHICLE_DATABASE));
  }
};
