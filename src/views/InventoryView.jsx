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
  Camera
} from 'lucide-react';
import { CATEGORIES } from '../data/mockData';
import ImagePreviewModal from '../components/ImagePreviewModal';

export default function InventoryView({
  parts,
  settings,
  vehicles,
  onCreatePart,
  onUpdatePart,
  onDeletePart,
  onAdjustStock
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
  const [activeTab, setActiveTab] = useState('info'); // info | pricing | vehicles

  // Form State
  const [formData, setFormData] = useState({
    sku: '',
    oemNumber: '',
    barcode: '',
    name: '',
    brand: '',
    image: '/products/kit_arrastre.jpg',
    category: 'frenos',
    description: '',
    costPrice: 0,
    marginPercent: 60,
    salePrice: 0,
    wholesalePrice: 0,
    stock: 0,
    minStock: 3,
    location: '',
    warranty: '6 Meses',
    compatibleVehicles: []
  });

  // Vehículo temporal a agregar en el modal
  const [newVehicle, setNewVehicle] = useState({
    make: 'Toyota',
    model: 'Corolla',
    yearStart: 2015,
    yearEnd: 2022,
    engine: '1.8L Dual VVT-i'
  });

  // Modal para ajuste rápido de stock
  const [stockModalPart, setStockModalPart] = useState(null);
  const [adjustAmount, setAdjustAmount] = useState(5);
  const [adjustType, setAdjustType] = useState('in'); // in | out
  const [adjustReason, setAdjustReason] = useState('Entrada de mercadería / Proveedor');

  // Filtrado de repuestos
  const filteredParts = parts.filter(part => {
    const q = searchQuery.trim().toLowerCase();
    const matchesQuery = !q || (
      part.name.toLowerCase().includes(q) ||
      part.sku.toLowerCase().includes(q) ||
      part.oemNumber.toLowerCase().includes(q) ||
      part.barcode.includes(q) ||
      part.brand.toLowerCase().includes(q) ||
      (part.location && part.location.toLowerCase().includes(q))
    );

    const matchesCategory = categoryFilter === 'all' || part.category === categoryFilter;

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
      category: 'frenos',
      description: '',
      costPrice: 10,
      marginPercent: 60,
      salePrice: 16,
      wholesalePrice: 14,
      stock: 5,
      minStock: 3,
      location: 'Pasillo A - Est. 1 - Gav. 01',
      warranty: '6 Meses',
      compatibleVehicles: [
        { make: 'Toyota', model: 'Corolla', yearStart: 2014, yearEnd: 2022, engine: '1.8L Dual VVT-i' }
      ]
    });
    setActiveTab('info');
    setIsFormOpen(true);
  };

  // Abrir formulario para editar
  const handleOpenEdit = (part) => {
    setEditingPart(part);
    const cost = Number(part.costPrice) || 0;
    const sale = Number(part.salePrice) || 0;
    const margin = cost > 0 ? Math.round(((sale - cost) / cost) * 100) : 50;

    setFormData({
      ...part,
      image: part.image || '/products/kit_arrastre.jpg',
      marginPercent: margin,
      compatibleVehicles: part.compatibleVehicles || []
    });
    setActiveTab('info');
    setIsFormOpen(true);
  };

  // Cambio de costos y recalculo de margen automático
  const handleCostChange = (newCost) => {
    const cost = parseFloat(newCost) || 0;
    const margin = parseFloat(formData.marginPercent) || 0;
    const sale = cost + (cost * (margin / 100));
    const wholesale = cost + (cost * ((margin * 0.7) / 100));

    setFormData({
      ...formData,
      costPrice: cost,
      salePrice: Number(sale.toFixed(2)),
      wholesalePrice: Number(wholesale.toFixed(2))
    });
  };

  const handleMarginChange = (newMargin) => {
    const margin = parseFloat(newMargin) || 0;
    const cost = parseFloat(formData.costPrice) || 0;
    const sale = cost + (cost * (margin / 100));
    const wholesale = cost + (cost * ((margin * 0.7) / 100));

    setFormData({
      ...formData,
      marginPercent: margin,
      salePrice: Number(sale.toFixed(2)),
      wholesalePrice: Number(wholesale.toFixed(2))
    });
  };

  // Guardar formulario
  const handleSubmitForm = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.oemNumber) {
      alert("Por favor ingresa al menos el Nombre y Código OEM del repuesto.");
      return;
    }

    if (editingPart) {
      onUpdatePart(editingPart.id, formData);
    } else {
      onCreatePart(formData);
    }
    setIsFormOpen(false);
  };

  // Agregar vehículo compatible al repuesto en el modal
  const handleAddVehicleToPart = () => {
    if (!newVehicle.make || !newVehicle.model) return;
    setFormData({
      ...formData,
      compatibleVehicles: [...formData.compatibleVehicles, { ...newVehicle }]
    });
  };

  const handleRemoveVehicleFromPart = (index) => {
    setFormData({
      ...formData,
      compatibleVehicles: formData.compatibleVehicles.filter((_, i) => i !== index)
    });
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
    let csv = "SKU,Codigo OEM,Nombre,Marca,Categoria,Ubicacion,Stock,Stock Minimo,Costo,Precio Venta,Precio Mayorista\n";
    parts.forEach(p => {
      csv += `"${p.sku}","${p.oemNumber}","${p.name}","${p.brand}","${p.category}","${p.location || ''}",${p.stock},${p.minStock},${p.costPrice},${p.salePrice},${p.wholesalePrice}\n`;
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
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }} className="animate-fade-in">
      {/* Top Header & Actions */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Inventario de Repuestos</h2>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
            Control de stock, códigos OEM, compatibilidad automotriz y valorización de almacén
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={handleExportCSV}>
            <Download size={16} />
            <span>Exportar CSV</span>
          </button>
          <button className="btn btn-primary" onClick={handleOpenCreate}>
            <Plus size={16} />
            <span>Nuevo Repuesto</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        padding: '16px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="input"
            placeholder="Buscar por Nombre, OEM, Barcode, Marca o Categoría..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            style={{ paddingLeft: '38px' }}
          />
        </div>

        {/* Category Filter */}
        <select
          className="select"
          style={{ width: '200px' }}
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="all">Todas las Categorías</option>
          {CATEGORIES.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        {/* Stock Filter */}
        <select
          className="select"
          style={{ width: '180px' }}
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

      {/* Parts Table */}
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
        overflow: 'hidden'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '12px 16px' }}>CÓDIGO OEM / SKU</th>
                <th style={{ padding: '12px 16px' }}>DESCRIPCIÓN Y MARCA</th>
                <th style={{ padding: '12px 16px' }}>CATEGORÍA</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>STOCK</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>COSTO</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>PRECIO VENTA</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {filteredParts.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    No se encontraron repuestos con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                paginatedParts.map(part => {
                  const isOut = part.stock === 0;
                  const isLow = part.stock <= part.minStock && !isOut;
                  const marginPct = part.costPrice > 0
                    ? Math.round(((part.salePrice - part.costPrice) / part.costPrice) * 100)
                    : 0;

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
                      <td style={{ padding: '12px 16px' }}>
                        <div className="mono" style={{ fontWeight: 800, color: 'var(--accent-cyan)' }}>
                          {part.oemNumber}
                        </div>
                        <div className="mono" style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                          SKU: {part.sku}
                        </div>
                      </td>

                      {/* Name & Brand with Photo Thumbnail */}
                      <td style={{ padding: '10px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {part.image && (
                            <div
                              onClick={() => setPreviewPart(part)}
                              style={{
                                width: '42px',
                                height: '42px',
                                borderRadius: '8px',
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
                                padding: '1px 3px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#fff'
                              }}>
                                <Eye size={10} />
                              </div>
                            </div>
                          )}
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.90rem' }}>
                              {part.name}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px' }}>
                              <span className="badge badge-primary mono" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                                {part.brand}
                              </span>
                              {part.compatibleVehicles && part.compatibleVehicles.length > 0 && (
                                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                  Aplica: {part.compatibleVehicles[0].make} {part.compatibleVehicles[0].model}
                                  {part.compatibleVehicles.length > 1 && ` (+${part.compatibleVehicles.length - 1})`}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td style={{ padding: '12px 16px', textTransform: 'capitalize' }}>
                        {part.category}
                      </td>

                      {/* Stock badge */}
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <span className={`badge ${isOut ? 'badge-danger' : (isLow ? 'badge-warning' : 'badge-success')}`}>
                          {part.stock} unid.
                        </span>
                      </td>

                      {/* Cost */}
                      <td style={{ padding: '12px 16px', textAlign: 'right', color: 'var(--text-muted)' }}>
                        {settings.currencySymbol}{part.costPrice.toFixed(2)}
                      </td>

                      {/* Sale Price */}
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <div style={{ fontWeight: 800, color: 'var(--primary-hover)' }}>
                          {settings.currencySymbol}{part.salePrice.toFixed(2)}
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            className="btn btn-secondary btn-icon btn-sm"
                            title="Ajustar Stock (+/-)"
                            onClick={() => {
                              setStockModalPart(part);
                              setAdjustAmount(5);
                              setAdjustType('in');
                            }}
                          >
                            <RefreshCw size={14} />
                          </button>
                          <button
                            className="btn btn-secondary btn-icon btn-sm"
                            title="Editar Repuesto"
                            onClick={() => handleOpenEdit(part)}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            className="btn btn-secondary btn-icon btn-sm"
                            title="Eliminar Repuesto"
                            style={{ color: 'var(--danger)' }}
                            onClick={() => {
                              if (window.confirm(`¿Seguro que deseas eliminar "${part.name}"?`)) {
                                onDeletePart(part.id);
                              }
                            }}
                          >
                            <Trash2 size={14} />
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

        {/* Pagination Controls */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 20px',
          borderTop: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-tertiary)',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '0.84rem'
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
              backgroundColor: 'var(--bg-tertiary)'
            }}>
              {[
                { id: 'info', label: '1. Información Básica' },
                { id: 'pricing', label: '2. Costos, Precios y Almacén' },
                { id: 'vehicles', label: `3. Compatibilidad Vehicular (${formData.compatibleVehicles.length})` }
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
                    borderBottom: activeTab === tab.id ? '2px solid var(--primary)' : 'none'
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
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
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

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
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
                        <label className="input-label">Categoría *</label>
                        <select
                          className="select"
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        >
                          {CATEGORIES.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
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
                      <label className="input-label">Descripción Técnica / Notas de Compatibilidad</label>
                      <textarea
                        className="textarea"
                        rows={3}
                        placeholder="Detalles técnicos, especificaciones, medidas o recomendaciones de instalación..."
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
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr 1fr',
                      gap: '12px'
                    }}>
                      <div className="input-group">
                        <label className="input-label">Costo de Compra ({settings.currencySymbol})</label>
                        <input
                          type="number"
                          step="any"
                          className="input"
                          value={formData.costPrice}
                          onChange={(e) => handleCostChange(e.target.value)}
                        />
                      </div>

                      <div className="input-group">
                        <label className="input-label">Margen de Ganancia (%)</label>
                        <input
                          type="number"
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
                          className="input"
                          style={{ fontWeight: 800, color: 'var(--primary-hover)' }}
                          value={formData.salePrice}
                          onChange={(e) => setFormData({ ...formData, salePrice: parseFloat(e.target.value) || 0 })}
                        />
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

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
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

                    <div className="input-group">
                      <label className="input-label">Ubicación Física en Almacén (Vital para despachos)</label>
                      <input
                        type="text"
                        className="input"
                        placeholder="Ej: Pasillo B - Estantería 3 - Gaveta 14"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                {/* TAB 3: COMPATIBILIDAD VEHICULAR */}
                {activeTab === 'vehicles' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{
                      padding: '16px',
                      backgroundColor: 'var(--bg-tertiary)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Vincular Nuevo Vehículo Compatible</div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div>
                          <label className="input-label">Marca</label>
                          <select
                            className="select"
                            value={newVehicle.make}
                            onChange={(e) => setNewVehicle({ ...newVehicle, make: e.target.value })}
                          >
                            {vehicles.map(v => (
                              <option key={v.make} value={v.make}>{v.make}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="input-label">Modelo</label>
                          <input
                            type="text"
                            className="input"
                            placeholder="Ej: Corolla, Hilux, Aveo..."
                            value={newVehicle.model}
                            onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                        <div>
                          <label className="input-label">Año Inicio</label>
                          <input
                            type="number"
                            className="input"
                            value={newVehicle.yearStart}
                            onChange={(e) => setNewVehicle({ ...newVehicle, yearStart: parseInt(e.target.value) || 2010 })}
                          />
                        </div>
                        <div>
                          <label className="input-label">Año Fin</label>
                          <input
                            type="number"
                            className="input"
                            value={newVehicle.yearEnd}
                            onChange={(e) => setNewVehicle({ ...newVehicle, yearEnd: parseInt(e.target.value) || 2024 })}
                          />
                        </div>
                        <div>
                          <label className="input-label">Motorización</label>
                          <input
                            type="text"
                            className="input"
                            placeholder="Ej: 1.8L Dual VVT-i"
                            value={newVehicle.engine}
                            onChange={(e) => setNewVehicle({ ...newVehicle, engine: e.target.value })}
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={handleAddVehicleToPart}
                        style={{ alignSelf: 'flex-start' }}
                      >
                        <Plus size={14} />
                        <span>Agregar Compatibilidad</span>
                      </button>
                    </div>

                    {/* Lista de vehículos compatibles asignados */}
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                        Vehículos a los que les sirve este repuesto ({formData.compatibleVehicles.length}):
                      </div>

                      {formData.compatibleVehicles.length === 0 ? (
                        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.84rem' }}>
                          No hay vehículos vinculados aún. Agrega los modelos compatibles arriba.
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {formData.compatibleVehicles.map((cv, idx) => (
                            <div
                              key={idx}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '8px 12px',
                                backgroundColor: 'var(--bg-card)',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--border-color)',
                                fontSize: '0.84rem'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Car size={16} color="var(--primary)" />
                                <strong>{cv.make} {cv.model}</strong>
                                <span style={{ color: 'var(--text-muted)' }}>({cv.yearStart} - {cv.yearEnd})</span>
                                {cv.engine && <span className="badge badge-primary">{cv.engine}</span>}
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveVehicleFromPart(idx)}
                                style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
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
