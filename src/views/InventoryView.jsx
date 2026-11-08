import React, { useState } from 'react';
import {
  Package,
  Search,
  Plus,
  Edit2,
  Trash2,
  SlidersHorizontal,
  Download,
  AlertTriangle,
  Check,
  X,
  MapPin,
  Tag,
  Car,
  ChevronRight,
  TrendingUp,
  RefreshCw,
  Eye,
  Camera,
  Sparkles
} from 'lucide-react';
import { CATEGORIES } from '../data/mockData';
import ImagePreviewModal from '../components/ImagePreviewModal';

export default function InventoryView({
  parts,
  settings,
  onCreatePart,
  onUpdatePart,
  onDeletePart,
  onAdjustStock,
  onLoadDemoParts
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all'); // all | ok | low | out

  // Modal de previsualización ampliada de foto
  const [previewPart, setPreviewPart] = useState(null);

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(7);

  // Modal para Crear / Editar
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPart, setEditingPart] = useState(null);
  const [activeTab, setActiveTab] = useState('info'); // info | pricing

  // Form State
  const [formData, setFormData] = useState({
    sku: '',
    oemNumber: '',
    barcode: '',
    name: '',
    brand: '',
    image: '/products/kit_arrastre.jpg',
    category: '',
    description: '',
    costPrice: 0,
    marginPercent: 60,
    salePrice: 0,
    wholesalePrice: 0,
    stock: 0,
    minStock: 3,
    warranty: '6 Meses'
  });

  // Modal para ajuste rápido de stock
  const [stockModalPart, setStockModalPart] = useState(null);
  const [adjustAmount, setAdjustAmount] = useState(5);
  const [adjustType, setAdjustType] = useState('in'); // in | out
  const [adjustReason, setAdjustReason] = useState('Entrada de mercadería / Proveedor');

  // Formatear etiqueta de categoría (traduce IDs predefinidos o muestra el texto libre escrito por el cliente)
  const getCategoryLabel = (catValue) => {
    if (!catValue) return 'General';
    const found = CATEGORIES.find(c => c.id.toLowerCase() === catValue.toLowerCase());
    return found ? found.name : catValue;
  };

  // Categorías únicas dinámicas presentes en el inventario + sugerencias base
  const uniqueCategories = Array.from(
    new Set(parts.map(p => (p.category || '').trim()).filter(Boolean))
  );

  // Filtrado de repuestos
  const filteredParts = parts.filter(part => {
    const q = searchQuery.trim().toLowerCase();
    const matchesQuery = !q || (
      part.name.toLowerCase().includes(q) ||
      part.sku.toLowerCase().includes(q) ||
      part.oemNumber.toLowerCase().includes(q) ||
      part.barcode.includes(q) ||
      part.brand.toLowerCase().includes(q) ||
      (part.category && part.category.toLowerCase().includes(q))
    );

    const matchesCategory = categoryFilter === 'all' || (part.category || '').toLowerCase() === categoryFilter.toLowerCase();

    let matchesStock = true;
    if (stockFilter === 'low') matchesStock = part.stock <= part.minStock && part.stock > 0;
    else if (stockFilter === 'out') matchesStock = part.stock === 0;
    else if (stockFilter === 'ok') matchesStock = part.stock > part.minStock;

    return matchesQuery && matchesCategory && matchesStock;
  });

  // Cálculo de paginación
  const totalPages = Math.ceil(filteredParts.length / itemsPerPage) || 1;
  const paginatedParts = filteredParts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Abrir formulario para nuevo repuesto
  const handleOpenCreate = () => {
    setEditingPart(null);
    setFormData({
      sku: `REP-${Math.floor(1000 + Math.random() * 9000)}`,
      oemNumber: '',
      barcode: '',
      name: '',
      brand: '',
      image: '/products/kit_arrastre.jpg',
      category: '',
      description: '',
      costPrice: 10,
      marginPercent: 60,
      salePrice: 16,
      wholesalePrice: 14,
      stock: 5,
      minStock: 3,
      warranty: '6 Meses'
    });
    setActiveTab('info');
    setIsFormOpen(true);
  };

  // Abrir formulario para editar
  const handleOpenEdit = (part) => {
    setEditingPart(part);
    const cost = Number(part.costPrice) || 0;
    const sale = Number(part.salePrice) || 0;
    const margin = cost > 0 ? Number((((sale - cost) / cost) * 100).toFixed(2)) : 50;

    setFormData({
      ...part,
      image: part.image || '/products/kit_arrastre.jpg',
      category: getCategoryLabel(part.category),
      marginPercent: margin
    });
    setActiveTab('info');
    setIsFormOpen(true);
  };

  // Vinculación automática entre Costo de Compra, Margen de Ganancia (%) y Precio de Venta Detalle
  const handleCostChange = (rawVal) => {
    if (rawVal === '') {
      setFormData({ ...formData, costPrice: '', salePrice: 0, wholesalePrice: 0 });
      return;
    }
    const cost = parseFloat(rawVal);
    if (isNaN(cost)) return;
    const margin = parseFloat(formData.marginPercent) || 0;
    const sale = cost * (1 + margin / 100);
    const wholesale = cost * (1 + (margin * 0.7) / 100);

    setFormData({
      ...formData,
      costPrice: rawVal,
      salePrice: Number(sale.toFixed(2)),
      wholesalePrice: Number(wholesale.toFixed(2))
    });
  };

  const handleMarginChange = (rawVal) => {
    if (rawVal === '') {
      const cost = parseFloat(formData.costPrice) || 0;
      setFormData({ ...formData, marginPercent: '', salePrice: Number(cost.toFixed(2)), wholesalePrice: Number(cost.toFixed(2)) });
      return;
    }
    const margin = parseFloat(rawVal);
    if (isNaN(margin)) return;
    const cost = parseFloat(formData.costPrice) || 0;
    const sale = cost * (1 + margin / 100);
    const wholesale = cost * (1 + (margin * 0.7) / 100);

    setFormData({
      ...formData,
      marginPercent: rawVal,
      salePrice: Number(sale.toFixed(2)),
      wholesalePrice: Number(wholesale.toFixed(2))
    });
  };

  const handleSalePriceChange = (rawVal) => {
    if (rawVal === '') {
      setFormData({ ...formData, salePrice: '', marginPercent: 0 });
      return;
    }
    const sale = parseFloat(rawVal);
    if (isNaN(sale)) return;
    const cost = parseFloat(formData.costPrice) || 0;

    if (cost > 0) {
      const calculatedMargin = ((sale - cost) / cost) * 100;
      const wholesale = cost + (sale - cost) * 0.7;
      setFormData({
        ...formData,
        salePrice: rawVal,
        marginPercent: Number(calculatedMargin.toFixed(2)),
        wholesalePrice: Number(Math.max(0, wholesale).toFixed(2))
      });
    } else {
      const margin = parseFloat(formData.marginPercent) || 0;
      const calculatedCost = margin > -100 ? sale / (1 + margin / 100) : 0;
      setFormData({
        ...formData,
        salePrice: rawVal,
        costPrice: Number(calculatedCost.toFixed(2)),
        wholesalePrice: Number((sale * 0.9).toFixed(2))
      });
    }
  };

  // Guardar formulario
  const handleSubmitForm = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.oemNumber) {
      alert("Por favor ingresa al menos el Nombre y Código OEM del repuesto.");
      return;
    }

    const normalizedPayload = {
      ...formData,
      category: (formData.category || 'General').trim(),
      costPrice: Number(formData.costPrice) || 0,
      marginPercent: Number(formData.marginPercent) || 0,
      salePrice: Number(formData.salePrice) || 0,
      wholesalePrice: Number(formData.wholesalePrice) || 0
    };

    if (editingPart) {
      onUpdatePart(editingPart.id, normalizedPayload);
    } else {
      onCreatePart(normalizedPayload);
    }
    setIsFormOpen(false);
  };

  // Ejecutar ajuste de stock
  const handleExecuteStockAdjust = () => {
    if (!stockModalPart) return;
    const qty = adjustType === 'in' ? Number(adjustAmount) : -Number(adjustAmount);
    onAdjustStock(stockModalPart.id, qty, adjustReason);
    setStockModalPart(null);
  };

  // Exportar a CSV
  const handleExportCSV = () => {
    let csv = "SKU,Codigo OEM,Nombre,Marca,Categoria,Stock,Stock Minimo,Costo,Precio Venta,Precio Mayorista\n";
    parts.forEach(p => {
      csv += `"${p.sku}","${p.oemNumber}","${p.name}","${p.brand}","${getCategoryLabel(p.category)}",${p.stock},${p.minStock},${p.costPrice},${p.salePrice},${p.wholesalePrice}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `inventario_repuestos_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="view-full-screen animate-fade-in">
      {/* Top Header & Actions */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px',
        flexShrink: 0
      }}>
        <div>
          <h2 style={{ fontSize: 'clamp(1.05rem, 2.5vw, 1.25rem)', fontWeight: 800, lineHeight: 1.2 }}>Inventario de Repuestos</h2>
          <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
            Control de stock, códigos OEM, costos, márgenes y precios de venta
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary btn-sm" onClick={handleExportCSV} style={{ padding: '7px 14px' }}>
            <Download size={15} />
            <span>Exportar CSV</span>
          </button>
          <button className="btn btn-primary btn-sm" onClick={handleOpenCreate} style={{ padding: '7px 14px' }}>
            <Plus size={15} />
            <span>Nuevo Repuesto</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        padding: '8px 12px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-color)',
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap',
        alignItems: 'center',
        flexShrink: 0
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 200px' }}>
          <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="input"
            placeholder="Buscar por Nombre, OEM, Barcode, Marca..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            style={{ paddingLeft: '34px', paddingTop: '6px', paddingBottom: '6px', fontSize: '0.82rem' }}
          />
        </div>

        {/* Category Filter */}
        <select
          className="select"
          style={{ flex: '0 1 190px', paddingTop: '6px', paddingBottom: '6px', fontSize: '0.82rem' }}
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="all">Todas las Categorías</option>
          {uniqueCategories.map(cat => (
            <option key={cat} value={cat}>{getCategoryLabel(cat)}</option>
          ))}
        </select>

        {/* Stock Filter */}
        <select
          className="select"
          style={{ flex: '0 1 170px', paddingTop: '6px', paddingBottom: '6px', fontSize: '0.82rem' }}
          value={stockFilter}
          onChange={(e) => {
            setStockFilter(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="all">Todo el Stock</option>
          <option value="ok">Stock Normal</option>
          <option value="low">Stock Crítico / Bajo</option>
          <option value="out">Totalmente Agotado</option>
        </select>
      </div>

      {/* MOBILE CARDS VIEW (Visible only on mobile <= 768px) */}
      <div className="mobile-only" style={{ flexDirection: 'column', gap: '10px' }}>
        {filteredParts.length === 0 ? (
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
              <Package size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                {parts.length === 0 ? 'Catálogo en Cero: 0 repuestos registrados' : 'No se encontraron repuestos'}
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px', maxWidth: '300px', lineHeight: 1.4 }}>
                {parts.length === 0 
                  ? 'El inventario está limpio para registrar los repuestos de tu cliente o cargar la muestra de prueba.' 
                  : 'Prueba cambiando los filtros de búsqueda o categoría.'}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', width: '100%', marginTop: '4px' }}>
              <button 
                className="btn btn-primary btn-sm" 
                onClick={handleOpenCreate}
                style={{ flex: '1 1 140px', justifyContent: 'center' }}
              >
                <Plus size={14} />
                <span>+ Nuevo Repuesto</span>
              </button>
              {parts.length === 0 && onLoadDemoParts && (
                <button 
                  className="btn btn-secondary btn-sm" 
                  onClick={onLoadDemoParts}
                  style={{ flex: '1 1 140px', justifyContent: 'center', color: 'var(--accent-cyan)', borderColor: 'rgba(0, 229, 255, 0.4)' }}
                >
                  <Sparkles size={14} />
                  <span>Cargar Demo (17 SKUs)</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          paginatedParts.map(part => {
            const isOut = part.stock === 0;
            const isLow = part.stock <= part.minStock && !isOut;

            return (
              <div key={part.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  {part.image && (
                    <div 
                      onClick={() => setPreviewPart(part)}
                      style={{
                        width: '54px',
                        height: '54px',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        flexShrink: 0,
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--bg-tertiary)',
                        cursor: 'zoom-in',
                        position: 'relative'
                      }}
                      title="Ver foto"
                    >
                      <img src={part.image} alt={part.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', bottom: '2px', right: '2px', background: 'rgba(0,0,0,0.6)', borderRadius: '3px', padding: '1px' }}>
                        <Eye size={10} color="#fff" />
                      </div>
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                      <span className="mono" style={{ fontSize: '0.74rem', color: 'var(--accent-cyan)', fontWeight: 700 }}>
                        OEM: {part.oemNumber}
                      </span>
                      <span className={`badge ${isOut ? 'badge-danger' : (isLow ? 'badge-warning' : 'badge-success')}`} style={{ fontSize: '0.66rem', padding: '1px 6px' }}>
                        {isOut ? 'AGOTADO' : `${part.stock} disp.`}
                      </span>
                    </div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.25 }}>
                      {part.name}
                    </h4>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {part.brand} • SKU: {part.sku} • {getCategoryLabel(part.category)}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '8px' }}>
                  <div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--primary-hover)' }}>
                      {settings.currencySymbol}{part.salePrice.toFixed(2)}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                      Costo: {settings.currencySymbol}{part.costPrice.toFixed(2)} • Taller: {settings.currencySymbol}{part.wholesalePrice.toFixed(2)}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleOpenStockModal(part)}
                      title="Ajustar Stock"
                      style={{ padding: '5px 8px', fontSize: '0.74rem', gap: '4px' }}
                    >
                      <RefreshCw size={12} /> Stock
                    </button>
                    <button 
                      className="btn btn-secondary btn-icon btn-sm"
                      onClick={() => handleOpenEdit(part)}
                      title="Editar repuesto"
                      style={{ width: '32px', height: '32px' }}
                    >
                      <Edit2 size={13} />
                    </button>
                    <button 
                      className="btn btn-secondary btn-icon btn-sm"
                      onClick={() => handleDelete(part.id, part.name)}
                      title="Eliminar repuesto"
                      style={{ width: '32px', height: '32px', color: 'var(--danger)' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Parts Table (Desktop view / fits viewport cleanly) */}
      <div className="desktop-only" style={{
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
        overflow: 'hidden',
        flexDirection: 'column',
        flex: 1,
        minHeight: 0
      }}>
        <div style={{ overflowX: 'auto', overflowY: 'auto', flex: 1, minHeight: 0 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
            <thead style={{ position: 'sticky', top: 0, zIndex: 5 }}>
              <tr style={{ backgroundColor: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '9px 14px' }}>CÓDIGO OEM / SKU</th>
                <th style={{ padding: '9px 14px' }}>DESCRIPCIÓN Y MARCA</th>
                <th style={{ padding: '9px 14px' }}>CATEGORÍA</th>
                <th style={{ padding: '9px 14px', textAlign: 'center' }}>STOCK</th>
                <th style={{ padding: '9px 14px', textAlign: 'right' }}>COSTO</th>
                <th style={{ padding: '9px 14px', textAlign: 'right' }}>PRECIO VENTA</th>
                <th style={{ padding: '9px 14px', textAlign: 'center' }}>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {filteredParts.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px 20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(0, 229, 255, 0.1)',
                        border: '1px solid rgba(0, 229, 255, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--accent-cyan)'
                      }}>
                        <Package size={22} />
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
                        {parts.length === 0 ? 'Catálogo en Cero: 0 repuestos registrados' : 'No se encontraron repuestos con los filtros aplicados'}
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '420px', lineHeight: 1.4 }}>
                        {parts.length === 0 
                          ? 'El inventario está completamente limpio. Puedes comenzar a registrar los repuestos de tu cliente o cargar la muestra de demostración.' 
                          : 'Prueba buscando con otro término, marca o código OEM.'}
                      </p>
                      <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                        <button className="btn btn-primary btn-sm" onClick={handleOpenCreate}>
                          <Plus size={14} />
                          <span>+ Registrar Primer Repuesto</span>
                        </button>
                        {parts.length === 0 && onLoadDemoParts && (
                          <button 
                            className="btn btn-secondary btn-sm" 
                            onClick={onLoadDemoParts}
                            style={{ color: 'var(--accent-cyan)', borderColor: 'rgba(0, 229, 255, 0.4)' }}
                          >
                            <Sparkles size={14} />
                            <span>Cargar Muestra de Demostración</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedParts.map(part => {
                  const isOut = part.stock === 0;
                  const isLow = part.stock <= part.minStock && !isOut;

                  return (
                    <tr
                      key={part.id}
                      style={{
                        borderBottom: '1px solid var(--border-color)',
                        transition: 'background-color 0.15s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      {/* OEM & SKU */}
                      <td style={{ padding: '7px 14px' }}>
                        <div className="mono" style={{ fontWeight: 800, color: 'var(--accent-cyan)', fontSize: '0.8rem' }}>
                          {part.oemNumber}
                        </div>
                        <div className="mono" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          SKU: {part.sku}
                        </div>
                      </td>

                      {/* Name & Brand with Photo Thumbnail */}
                      <td style={{ padding: '7px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {part.image && (
                            <div
                              onClick={() => setPreviewPart(part)}
                              style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '6px',
                                overflow: 'hidden',
                                flexShrink: 0,
                                border: '1px solid var(--border-color)',
                                backgroundColor: 'var(--bg-tertiary)',
                                cursor: 'zoom-in',
                                position: 'relative'
                              }}
                              title="Clic para ampliar foto"
                            >
                              <img
                                src={part.image}
                                alt={part.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                              <div style={{
                                position: 'absolute',
                                bottom: '1px',
                                right: '1px',
                                backgroundColor: 'rgba(0,0,0,0.65)',
                                borderRadius: '3px',
                                padding: '1px 2px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#fff'
                              }}>
                                <Eye size={9} />
                              </div>
                            </div>
                          )}
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.84rem', lineHeight: 1.2 }}>
                              {part.name}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                              <span className="badge badge-primary mono" style={{ fontSize: '0.64rem', padding: '1px 5px' }}>
                                {part.brand}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td style={{ padding: '7px 14px', fontSize: '0.8rem' }}>
                        {getCategoryLabel(part.category)}
                      </td>

                      {/* Stock badge */}
                      <td style={{ padding: '7px 14px', textAlign: 'center' }}>
                        <span className={`badge ${isOut ? 'badge-danger' : (isLow ? 'badge-warning' : 'badge-success')}`} style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                          {part.stock} unid.
                        </span>
                      </td>

                      {/* Cost */}
                      <td style={{ padding: '7px 14px', textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        {settings.currencySymbol}{part.costPrice.toFixed(2)}
                      </td>

                      {/* Sale Price */}
                      <td style={{ padding: '7px 14px', textAlign: 'right' }}>
                        <div style={{ fontWeight: 800, color: 'var(--primary-hover)', fontSize: '0.88rem' }}>
                          {settings.currencySymbol}{part.salePrice.toFixed(2)}
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '7px 14px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: '5px' }}>
                          <button
                            className="btn btn-secondary btn-icon btn-sm"
                            style={{ width: '28px', height: '28px' }}
                            title="Ajustar Stock (+/-)"
                            onClick={() => {
                              setStockModalPart(part);
                              setAdjustAmount(5);
                              setAdjustType('in');
                            }}
                          >
                            <RefreshCw size={13} />
                          </button>
                          <button
                            className="btn btn-secondary btn-icon btn-sm"
                            style={{ width: '28px', height: '28px' }}
                            title="Editar Repuesto"
                            onClick={() => handleOpenEdit(part)}
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            className="btn btn-secondary btn-icon btn-sm"
                            title="Eliminar Repuesto"
                            style={{ color: 'var(--danger)', width: '28px', height: '28px' }}
                            onClick={() => {
                              if (window.confirm(`¿Seguro que deseas eliminar "${part.name}"?`)) {
                                onDeletePart(part.id);
                              }
                            }}
                          >
                            <Trash2 size={13} />
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

        {/* Pagination Controls (Always visible at bottom) */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 16px',
          borderTop: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-tertiary)',
          flexWrap: 'wrap',
          gap: '10px',
          fontSize: '0.78rem',
          flexShrink: 0
        }}>
          <div style={{ color: 'var(--text-secondary)' }}>
            Mostrando <strong style={{ color: 'var(--text-primary)' }}>
              {filteredParts.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}
            </strong> a <strong style={{ color: 'var(--text-primary)' }}>
              {Math.min(currentPage * itemsPerPage, filteredParts.length)}
            </strong> de <strong style={{ color: 'var(--text-primary)' }}>{filteredParts.length}</strong> repuestos
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* Items per page selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Por página:</span>
              <select
                className="select"
                style={{ width: '70px', padding: '4px 8px', fontSize: '0.78rem' }}
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value={5}>5</option>
                <option value={7}>7</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
              </select>
            </div>

            {/* Pagination buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button
                className="btn btn-secondary btn-sm"
                style={{ padding: '5px 10px', fontSize: '0.78rem' }}
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              >
                ◀ Anterior
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                <button
                  key={pageNum}
                  className={`btn btn-sm ${currentPage === pageNum ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ width: '30px', height: '30px', padding: 0, fontSize: '0.78rem' }}
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </button>
              ))}

              <button
                className="btn btn-secondary btn-sm"
                style={{ padding: '5px 10px', fontSize: '0.78rem' }}
                disabled={currentPage === totalPages || filteredParts.length === 0}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              >
                Siguiente ▶
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: CREAR / EDITAR REPUESTO */}
      {isFormOpen && (
        <div className="modal-overlay" onClick={() => setIsFormOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '720px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                {editingPart ? 'Editar Repuesto' : 'Registrar Nuevo Repuesto'}
              </h3>
              <button className="btn btn-secondary btn-icon btn-sm" onClick={() => setIsFormOpen(false)}>
                <X size={16} />
              </button>
            </div>

            {/* Modal Tabs */}
            <div style={{
              display: 'flex',
              borderBottom: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-tertiary)',
              overflowX: 'auto',
              scrollbarWidth: 'none',
              WebkitOverflowScrolling: 'touch'
            }}>
              {[
                { id: 'info', label: '1. Información Básica' },
                { id: 'pricing', label: '2. Costos, Precios y Almacén' }
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: '12px 18px',
                    border: 'none',
                    background: activeTab === tab.id ? 'var(--bg-modal)' : 'transparent',
                    color: activeTab === tab.id ? 'var(--primary-hover)' : 'var(--text-secondary)',
                    fontWeight: activeTab === tab.id ? 700 : 500,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    borderBottom: activeTab === tab.id ? '2px solid var(--primary)' : 'none',
                    whiteSpace: 'nowrap',
                    flexShrink: 0
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmitForm}>
              <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                {/* TAB 1: DATOS BÁSICOS */}
                {activeTab === 'info' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div className="responsive-form-grid-2">
                      <div className="input-group">
                        <label className="input-label">Código OEM / Fabricante Original *</label>
                        <input
                          type="text"
                          className="input mono"
                          placeholder="Ej: 04465-02220"
                          value={formData.oemNumber}
                          onChange={(e) => setFormData({ ...formData, oemNumber: e.target.value })}
                          required
                        />
                      </div>
                      <div className="input-group">
                        <label className="input-label">Código SKU Interno</label>
                        <input
                          type="text"
                          className="input mono"
                          value={formData.sku}
                          onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="input-group">
                      <label className="input-label">Nombre del Repuesto *</label>
                      <input
                        type="text"
                        className="input"
                        placeholder="Ej: Pastillas de Freno Delanteras Cerámicas"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="responsive-form-grid-2">
                      <div className="input-group">
                        <label className="input-label">Marca del Repuesto *</label>
                        <input
                          type="text"
                          className="input"
                          placeholder="Ej: Brembo, Bosch, Mann-Filter..."
                          value={formData.brand}
                          onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                          required
                        />
                      </div>
                      <div className="input-group">
                        <label className="input-label">Categoría (Escribe cualquier categoría) *</label>
                        <input
                          type="text"
                          list="custom-categories-list"
                          className="input"
                          placeholder="Ej: Frenos, Motor, Rodamientos, Empacaduras..."
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          required
                        />
                        <datalist id="custom-categories-list">
                          {Array.from(new Set([
                            ...CATEGORIES.map(c => c.name),
                            ...uniqueCategories.map(c => getCategoryLabel(c))
                          ])).map(catName => (
                            <option key={catName} value={catName} />
                          ))}
                        </datalist>
                      </div>
                    </div>

                    <div className="responsive-form-grid-2">
                      <div className="input-group">
                        <label className="input-label">Código de Barras</label>
                        <input
                          type="text"
                          className="input mono"
                          placeholder="EAN-13 o escaneo directo"
                          value={formData.barcode}
                          onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                        />
                      </div>
                      <div className="input-group">
                        <label className="input-label">Garantía Otorgada</label>
                        <input
                          type="text"
                          className="input"
                          placeholder="Ej: 6 Meses / 20.000 Km"
                          value={formData.warranty}
                          onChange={(e) => setFormData({ ...formData, warranty: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="input-group">
                      <label className="input-label">Descripción Técnica del Repuesto</label>
                      <textarea
                        className="textarea"
                        rows={3}
                        placeholder="Detalles técnicos, especificaciones o medidas del repuesto..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                    </div>

                    {/* Foto del Repuesto */}
                    <div className="input-group">
                      <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Camera size={15} color="var(--primary)" />
                        <span>Foto del Producto</span>
                      </label>
                      <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                        <div style={{
                          width: '64px',
                          height: '64px',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-color)',
                          backgroundColor: 'var(--bg-tertiary)',
                          overflow: 'hidden',
                          flexShrink: 0
                        }}>
                          <img
                            src={formData.image || '/products/kit_arrastre.jpg'}
                            alt="Vista previa"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <input
                            type="text"
                            className="input"
                            placeholder="Ruta o URL de la foto (ej: /products/kit_arrastre.jpg)"
                            value={formData.image || ''}
                            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                          />
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {[
                              { label: 'Arrastre', file: '/products/kit_arrastre.jpg' },
                              { label: 'Cilindro', file: '/products/cilindro_150.jpg' },
                              { label: 'Pastillas', file: '/products/pastillas_freno.jpg' },
                              { label: 'Bandas', file: '/products/bandas_tambor.jpg' },
                              { label: 'Batería', file: '/products/bateria_gel.jpg' },
                              { label: 'Carburador', file: '/products/carburador_pz27.jpg' },
                              { label: 'CDI Racing', file: '/products/cdi_racing.jpg' },
                              { label: 'Amortiguador', file: '/products/amortiguadores_moto.jpg' },
                              { label: 'Bujía', file: '/products/bujia_ngk.jpg' },
                              { label: 'Aceite', file: '/products/aceite_galon.jpg' },
                              { label: 'Coolant', file: '/products/refrigerante_galon.jpg' }
                            ].map(preset => (
                              <button
                                key={preset.file}
                                type="button"
                                className="btn btn-secondary btn-sm"
                                style={{
                                  padding: '2px 8px',
                                  fontSize: '0.7rem',
                                  borderColor: formData.image === preset.file ? 'var(--primary)' : 'var(--border-color)'
                                }}
                                onClick={() => setFormData({ ...formData, image: preset.file })}
                              >
                                {preset.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: COSTOS, PRECIOS Y ALMACÉN */}
                {activeTab === 'pricing' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{
                      padding: '16px',
                      backgroundColor: 'var(--bg-tertiary)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                          ⚡ Cálculo Automático Vinculado (Costo ↔ Margen % ↔ Precio Venta)
                        </span>
                        <span className="badge badge-success" style={{ fontSize: '0.74rem' }}>
                          Ganancia unitaria: +{settings.currencySymbol}{Math.max(0, (Number(formData.salePrice) || 0) - (Number(formData.costPrice) || 0)).toFixed(2)}
                        </span>
                      </div>

                      <div className="responsive-form-grid-3">
                        <div className="input-group">
                          <label className="input-label">Costo de Compra ({settings.currencySymbol})</label>
                          <input
                            type="number"
                            step="any"
                            min="0"
                            className="input"
                            value={formData.costPrice}
                            onChange={(e) => handleCostChange(e.target.value)}
                          />
                        </div>

                        <div className="input-group">
                          <label className="input-label">Margen de Ganancia (%)</label>
                          <input
                            type="number"
                            step="any"
                            className="input"
                            value={formData.marginPercent}
                            onChange={(e) => handleMarginChange(e.target.value)}
                          />
                        </div>

                        <div className="input-group">
                          <label className="input-label">Precio Venta Detalle ({settings.currencySymbol})</label>
                          <input
                            type="number"
                            step="any"
                            min="0"
                            className="input"
                            style={{ fontWeight: 800, color: 'var(--primary-hover)' }}
                            value={formData.salePrice}
                            onChange={(e) => handleSalePriceChange(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="input-group">
                      <label className="input-label">Precio Mayorista / Talleres Mecánicos ({settings.currencySymbol})</label>
                      <input
                        type="number"
                        step="any"
                        className="input"
                        value={formData.wholesalePrice}
                        onChange={(e) => setFormData({ ...formData, wholesalePrice: parseFloat(e.target.value) || 0 })}
                      />
                    </div>

                    <div className="responsive-form-grid-2">
                      <div className="input-group">
                        <label className="input-label">Stock Actual en Existencia</label>
                        <input
                          type="number"
                          className="input"
                          value={formData.stock}
                          onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                        />
                      </div>

                      <div className="input-group">
                        <label className="input-label">Stock Mínimo (Dispara Alertas)</label>
                        <input
                          type="number"
                          className="input"
                          value={formData.minStock}
                          onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsFormOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" style={{ fontWeight: 800 }}>
                  <Check size={18} />
                  <span>{editingPart ? 'Actualizar Repuesto' : 'Guardar Repuesto'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: AJUSTE RÁPIDO DE STOCK */}
      {stockModalPart && (
        <div className="modal-overlay" onClick={() => setStockModalPart(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Ajuste de Stock en Almacén</h3>
              <button className="btn btn-secondary btn-icon btn-sm" onClick={() => setStockModalPart(null)}>
                <X size={16} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{stockModalPart.name}</h4>
                <div className="mono" style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  OEM: {stockModalPart.oemNumber} • Stock actual: <strong>{stockModalPart.stock}</strong> unid.
                </div>
              </div>

              {/* In / Out Selector */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button
                  type="button"
                  className={`btn ${adjustType === 'in' ? 'btn-success' : 'btn-secondary'}`}
                  onClick={() => setAdjustType('in')}
                >
                  <Plus size={16} /> Entrada (+)
                </button>
                <button
                  type="button"
                  className={`btn ${adjustType === 'out' ? 'btn-danger' : 'btn-secondary'}`}
                  onClick={() => setAdjustType('out')}
                >
                  <Trash2 size={16} /> Salida / Merma (-)
                </button>
              </div>

              <div className="input-group">
                <label className="input-label">Cantidad de Unidades</label>
                <input
                  type="number"
                  min="1"
                  className="input"
                  style={{ fontSize: '1.2rem', fontWeight: 700 }}
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(Math.max(1, parseInt(e.target.value) || 1))}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Motivo del Ajuste</label>
                <input
                  type="text"
                  className="input"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="Ej: Factura de proveedor, devolución, conteo físico..."
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setStockModalPart(null)}>
                Cancelar
              </button>
              <button className="btn btn-primary" onClick={handleExecuteStockAdjust} style={{ fontWeight: 800 }}>
                Aplicar Ajuste de Stock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PREVISUALIZACIÓN DE FOTO AMPLIADA */}
      {previewPart && (
        <ImagePreviewModal
          part={previewPart}
          settings={settings}
          onClose={() => setPreviewPart(null)}
        />
      )}
    </div>
  );
}
