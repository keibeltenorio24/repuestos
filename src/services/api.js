import { storage } from './storage';

// Modo actual: Almacenamiento local persistente
// Para conectar con backend Laravel: Configurar USE_LARAVEL_API = true y LARAVEL_API_URL
const USE_LARAVEL_API = false;
const LARAVEL_API_URL = 'http://localhost:8000/api';

export const partsAPI = {
  async getAll() {
    if (USE_LARAVEL_API) {
      const res = await fetch(`${LARAVEL_API_URL}/parts`);
      return res.json();
    }
    return storage.getParts();
  },

  async getById(id) {
    const parts = await this.getAll();
    return parts.find(p => p.id === id) || null;
  },

  async create(partData) {
    const parts = storage.getParts();
    const newPart = {
      ...partData,
      id: `part-${Date.now()}`,
      status: partData.stock === 0 ? 'out' : (partData.stock <= partData.minStock ? 'low' : 'ok')
    };
    parts.unshift(newPart);
    storage.saveParts(parts);
    return newPart;
  },

  async update(id, partData) {
    const parts = storage.getParts();
    const index = parts.findIndex(p => p.id === id);
    if (index === -1) throw new Error("Repuesto no encontrado");
    
    const stock = Number(partData.stock);
    const minStock = Number(partData.minStock);
    const updated = {
      ...parts[index],
      ...partData,
      stock,
      minStock,
      status: stock === 0 ? 'out' : (stock <= minStock ? 'low' : 'ok')
    };
    parts[index] = updated;
    storage.saveParts(parts);
    return updated;
  },

  async delete(id) {
    const parts = storage.getParts();
    const filtered = parts.filter(p => p.id !== id);
    storage.saveParts(filtered);
    return { success: true };
  },

  async adjustStock(id, qtyChange, reason = 'Ajuste manual') {
    const parts = storage.getParts();
    const part = parts.find(p => p.id === id);
    if (!part) throw new Error("Repuesto no encontrado");

    const newStock = Math.max(0, Number(part.stock) + Number(qtyChange));
    part.stock = newStock;
    part.status = newStock === 0 ? 'out' : (newStock <= part.minStock ? 'low' : 'ok');
    storage.saveParts(parts);
    return part;
  },

  async search({ query = '', category = '', vehicle = null, stockFilter = 'all' }) {
    let parts = await this.getAll();
    const q = query.trim().toLowerCase();

    if (q) {
      parts = parts.filter(p => 
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.oemNumber.toLowerCase().includes(q) ||
        p.barcode.includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        (p.location && p.location.toLowerCase().includes(q))
      );
    }

    if (category && category !== 'all') {
      parts = parts.filter(p => p.category === category);
    }

    if (stockFilter === 'low') {
      parts = parts.filter(p => p.status === 'low' || p.status === 'out');
    } else if (stockFilter === 'out') {
      parts = parts.filter(p => p.status === 'out');
    } else if (stockFilter === 'ok') {
      parts = parts.filter(p => p.status === 'ok');
    }

    if (vehicle && vehicle.make) {
      parts = parts.filter(p => {
        if (!p.compatibleVehicles || p.compatibleVehicles.length === 0) return false;
        return p.compatibleVehicles.some(cv => {
          const makeMatch = cv.make.toLowerCase() === vehicle.make.toLowerCase();
          const modelMatch = !vehicle.model || cv.model.toLowerCase() === vehicle.model.toLowerCase();
          const yearMatch = !vehicle.year || (vehicle.year >= cv.yearStart && vehicle.year <= cv.yearEnd);
          const engineMatch = !vehicle.engine || !cv.engine || cv.engine.toLowerCase().includes(vehicle.engine.toLowerCase());
          return makeMatch && modelMatch && yearMatch && engineMatch;
        });
      });
    }

    return parts;
  }
};

export const salesAPI = {
  async getAll() {
    if (USE_LARAVEL_API) {
      const res = await fetch(`${LARAVEL_API_URL}/sales`);
      return res.json();
    }
    return storage.getSales();
  },

  async create(saleData) {
    const sales = storage.getSales();
    const isProforma = saleData.type === 'proforma';
    const orderPrefix = isProforma ? 'PRO' : (saleData.type === 'factura' ? 'FAC' : 'TKT');
    const orderNumber = `${orderPrefix}-${String(sales.length + 1001).padStart(6, '0')}`;
    
    const newSale = {
      ...saleData,
      id: `sale-${Date.now()}`,
      orderNumber,
      date: new Date().toISOString(),
      status: isProforma ? 'quote' : 'completed'
    };

    // Si es venta definitiva (ticket o factura), descontar stock automáticamente
    if (!isProforma) {
      const parts = storage.getParts();
      newSale.items.forEach(item => {
        const part = parts.find(p => p.id === item.partId);
        if (part) {
          part.stock = Math.max(0, part.stock - item.qty);
          part.status = part.stock === 0 ? 'out' : (part.stock <= part.minStock ? 'low' : 'ok');
        }
      });
      storage.saveParts(parts);
    }

    sales.unshift(newSale);
    storage.saveSales(sales);
    return newSale;
  },

  async convertQuoteToSale(quoteId, paymentMethod = 'cash') {
    const sales = storage.getSales();
    const quote = sales.find(s => s.id === quoteId);
    if (!quote) throw new Error("Cotización no encontrada");

    // Descontar inventario
    const parts = storage.getParts();
    quote.items.forEach(item => {
      const part = parts.find(p => p.id === item.partId);
      if (part) {
        part.stock = Math.max(0, part.stock - item.qty);
        part.status = part.stock === 0 ? 'out' : (part.stock <= part.minStock ? 'low' : 'ok');
      }
    });
    storage.saveParts(parts);

    quote.type = 'ticket';
    quote.status = 'completed';
    quote.paymentMethod = paymentMethod;
    quote.orderNumber = `TKT-${quote.orderNumber.replace(/^(PRO|FAC|TKT)-/, '')}`;
    quote.convertedAt = new Date().toISOString();

    storage.saveSales(sales);
    return quote;
  }
};

export const settingsAPI = {
  async get() {
    return storage.getSettings();
  },

  async update(settingsData) {
    storage.saveSettings(settingsData);
    return settingsData;
  }
};

export const vehiclesAPI = {
  async getDatabase() {
    return storage.getVehicles();
  }
};
