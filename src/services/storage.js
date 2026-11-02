import { INITIAL_PARTS, INITIAL_SALES, INITIAL_SETTINGS, VEHICLE_DATABASE, DEMO_PARTS } from '../data/mockData';

const STORAGE_KEYS = {
  PARTS: 'bgmultiservicios_parts_clean_v1',
  SALES: 'bgmultiservicios_sales_clean_v1',
  SETTINGS: 'bgmultiservicios_settings_v3',
  VEHICLES: 'bgmultiservicios_vehicles_v3',
  THEME: 'bgmultiservicios_theme_v3'
};

export const storage = {
  // Inicialización de datos
  init() {
    // Limpiar claves anteriores para garantizar datos en cero
    localStorage.removeItem('bgmultiservicios_parts_v4');
    localStorage.removeItem('bgmultiservicios_parts_v3');
    localStorage.removeItem('bgmultiservicios_parts_v2');
    localStorage.removeItem('bgmultiservicios_sales_v3');
    localStorage.removeItem('bgmultiservicios_sales_v2');

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
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
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

  // Poner estadísticas y ventas a cero (para presentación a clientes)
  clearSales() {
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify([]));
    localStorage.removeItem('bgmultiservicios_sales_v3');
    localStorage.removeItem('bgmultiservicios_sales_v2');
    return [];
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

  // Cargar Catálogo de Demostración
  loadDemoData() {
    localStorage.setItem(STORAGE_KEYS.PARTS, JSON.stringify(DEMO_PARTS));
    return DEMO_PARTS;
  },

  // Limpiar toda la base de datos a Cero (Para entrega limpia a clientes)
  clearAllData() {
    localStorage.setItem(STORAGE_KEYS.PARTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify([]));
    return { parts: [], sales: [] };
  },

  // Restablecer Datos de Demostración
  resetToDemo() {
    localStorage.setItem(STORAGE_KEYS.PARTS, JSON.stringify(DEMO_PARTS));
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
    localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(VEHICLE_DATABASE));
  }
};
