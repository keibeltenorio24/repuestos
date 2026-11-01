import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  Search, 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  Car, 
  User, 
  CreditCard, 
  DollarSign, 
  Layers, 
  FileCheck, 
  X,
  AlertCircle,
  Tag,
  MapPin,
  Check,
  Eye
} from 'lucide-react';
import { CATEGORIES } from '../data/mockData';
import ImagePreviewModal from '../components/ImagePreviewModal';

export default function PosView({ 
  parts, 
  settings, 
  vehicles, 
  activeVehicle, 
  setActiveVehicle,
  onCompleteSale 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState([]);
  
  // Datos del cliente y venta
  const [docType, setDocType] = useState('ticket'); // ticket | proforma | factura
  const [customer, setCustomer] = useState({
    name: 'Consumidor Final',
    docId: '',
    phone: '',
    isWorkshop: false
  });
  const [discountPercent, setDiscountPercent] = useState(0);

  // Modal de cobro
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash'); // cash | card | transfer | credit
  const [cashTendered, setCashTendered] = useState('');

  // Modal de foto ampliada
  const [previewPart, setPreviewPart] = useState(null);

  const searchInputRef = useRef(null);

  // Autofocus en el buscador al montar
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  const [vehicleTypeFilter, setVehicleTypeFilter] = useState('all'); // all | moto | car

  // Filtrado de repuestos
  const filteredParts = parts.filter(part => {
    const q = searchQuery.trim().toLowerCase();
    const matchesQuery = !q || (
      part.name.toLowerCase().includes(q) ||
      part.sku.toLowerCase().includes(q) ||
      part.oemNumber.toLowerCase().includes(q) ||
      part.barcode.includes(q) ||
      part.brand.toLowerCase().includes(q)
    );

    const matchesCategory = selectedCategory === 'all' || part.category === selectedCategory;

    const matchesVehicleType = vehicleTypeFilter === 'all' || 
      (vehicleTypeFilter === 'moto' && (part.vehicleType === 'moto' || !part.vehicleType)) ||
      (vehicleTypeFilter === 'car' && part.vehicleType === 'car');

    let matchesVehicle = true;
    if (activeVehicle && activeVehicle.make) {
      if (!part.compatibleVehicles || part.compatibleVehicles.length === 0) {
        matchesVehicle = false;
      } else {
        matchesVehicle = part.compatibleVehicles.some(cv => {
          const makeMatch = cv.make.toLowerCase() === activeVehicle.make.toLowerCase();
          const modelMatch = !activeVehicle.model || cv.model.toLowerCase() === activeVehicle.model.toLowerCase();
          const yearMatch = !activeVehicle.year || (activeVehicle.year >= cv.yearStart && activeVehicle.year <= cv.yearEnd);
          return makeMatch && modelMatch && yearMatch;
        });
      }
    }

    return matchesQuery && matchesCategory && matchesVehicleType && matchesVehicle;
  });

  // Agregar al carrito
  const addToCart = (part) => {
    if (part.stock === 0 && docType !== 'proforma') {
      alert("Este repuesto está agotado. Solo puedes incluirlo en una Cotización / Proforma.");
      return;
    }

    const existingIndex = cart.findIndex(item => item.partId === part.id);
    const unitPrice = customer.isWorkshop ? (part.wholesalePrice || part.salePrice) : part.salePrice;

    if (existingIndex > -1) {
      const existing = cart[existingIndex];
      if (existing.qty + 1 > part.stock && docType !== 'proforma') {
        alert(`No hay más stock disponible (${part.stock} unidades en existencia).`);
        return;
      }
      const updated = [...cart];
      updated[existingIndex].qty += 1;
      updated[existingIndex].subtotal = updated[existingIndex].qty * updated[existingIndex].price;
      setCart(updated);
    } else {
      setCart([
        ...cart,
        {
          partId: part.id,
          sku: part.sku,
          oemNumber: part.oemNumber,
          name: part.name,
          brand: part.brand,
          price: unitPrice,
          regularPrice: part.salePrice,
          wholesalePrice: part.wholesalePrice,
          maxStock: part.stock,
          location: part.location,
          qty: 1,
          subtotal: unitPrice
        }
      ]);
    }
  };

  // Actualizar cantidad
  const updateQty = (index, delta) => {
    const updated = [...cart];
    const item = updated[index];
    const newQty = item.qty + delta;

    if (newQty <= 0) {
      removeFromCart(index);
      return;
    }

    if (newQty > item.maxStock && docType !== 'proforma') {
      alert(`Stock máximo alcanzado (${item.maxStock} unidades).`);
      return;
    }

    item.qty = newQty;
    item.subtotal = item.qty * item.price;
    setCart(updated);
  };

  // Cambiar entre precio normal y mayorista
  const toggleItemPriceType = (index) => {
    const updated = [...cart];
    const item = updated[index];
    const isCurrentlyWholesale = item.price === item.wholesalePrice;
    item.price = isCurrentlyWholesale ? item.regularPrice : item.wholesalePrice;
    item.subtotal = item.qty * item.price;
    setCart(updated);
  };

  const removeFromCart = (index) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const clearCart = () => {
    if (cart.length > 0 && window.confirm("¿Deseas vaciar el pedido actual?")) {
      setCart([]);
    }
  };

  // Cálculos de totales
  const subtotal = cart.reduce((acc, item) => acc + item.subtotal, 0);
  const discountAmount = (subtotal * discountPercent) / 100;
  const taxableBase = Math.max(0, subtotal - discountAmount);
  const taxAmount = (taxableBase * (settings.taxRate || 0)) / 100;
  const grandTotal = taxableBase + taxAmount;

  // Finalizar cobro
  const handleConfirmCheckout = () => {
    if (cart.length === 0) return;

    const salePayload = {
      type: docType,
      customer: {
        name: customer.name || 'Consumidor Final',
        docId: customer.docId || 'Sin documento',
        phone: customer.phone || '',
        isWorkshop: customer.isWorkshop
      },
      items: cart.map(item => ({
        partId: item.partId,
        sku: item.sku,
        oemNumber: item.oemNumber,
        name: item.name,
        price: item.price,
        qty: item.qty,
        subtotal: item.subtotal
      })),
      subtotal,
      discount: discountAmount,
      tax: taxAmount,
      total: grandTotal,
      paymentMethod: docType === 'proforma' ? 'pending' : paymentMethod,
      notes: customer.isWorkshop ? 'Cliente Taller Mecánico' : ''
    };

    // Disparar confeti
    try {
      confetti({
        particleCount: 75,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // Ignorar si no está disponible
    }

    onCompleteSale(salePayload);
    setCart([]);
    setIsCheckoutOpen(false);
    setCashTendered('');
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 430px',
      gap: '20px',
      padding: '20px 24px',
      height: 'calc(100vh - var(--header-height))',
      overflow: 'hidden'
    }} className="animate-fade-in">
      {/* LEFT COLUMN: Catálogo y Búsqueda de Mostrador */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', overflow: 'hidden' }}>
        {/* Search Bar & Fast Vehicle Filter */}
        <div style={{
          display: 'flex',
          gap: '10px',
          alignItems: 'center',
          backgroundColor: 'var(--bg-secondary)',
          padding: '12px 16px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)'
        }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search 
              size={18} 
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} 
            />
            <input
              ref={searchInputRef}
              type="text"
              className="input"
              placeholder="Buscar por Nombre, Código OEM (ej: 04465-02220), Código de Barras o Marca..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '38px', fontSize: '0.92rem' }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer'
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Quick Vehicle Filter Button */}
          <button
            className={`btn btn-sm ${activeVehicle ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => {
              if (activeVehicle) {
                setActiveVehicle(null);
              } else {
                // Selector rápido
                const make = prompt("Ingresa Marca del vehículo del cliente (ej: Toyota, Chevrolet, Ford):", "Toyota");
                if (make) {
                  setActiveVehicle({ make, model: '', year: null });
                }
              }
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            title="Filtrar repuestos para el vehículo del cliente"
          >
            <Car size={16} />
            <span>{activeVehicle ? `${activeVehicle.make}` : 'Filtrar por Auto'}</span>
            {activeVehicle && <X size={14} />}
          </button>
        </div>

        {/* Vehicle Type Switcher & Categories Horizontal Scroll */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            className={`btn btn-sm ${vehicleTypeFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setVehicleTypeFilter('all')}
            style={{ borderRadius: 'var(--radius-full)', padding: '5px 12px', fontSize: '0.78rem' }}
          >
            Todos ({parts.length})
          </button>
          <button
            className={`btn btn-sm ${vehicleTypeFilter === 'moto' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setVehicleTypeFilter('moto')}
            style={{ borderRadius: 'var(--radius-full)', padding: '5px 12px', fontSize: '0.78rem', fontWeight: 700 }}
          >
            🏍️ Motos (Bera, Empire, Toro, MD)
          </button>
          <button
            className={`btn btn-sm ${vehicleTypeFilter === 'car' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setVehicleTypeFilter('car')}
            style={{ borderRadius: 'var(--radius-full)', padding: '5px 12px', fontSize: '0.78rem', fontWeight: 700 }}
          >
            🚗 Aceites & Carros (Shell, Castrol, PDV)
          </button>
        </div>

        {/* Categories Horizontal Scroll */}
        <div style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '4px',
          scrollbarWidth: 'none'
        }}>
          <button
            className={`btn btn-sm ${selectedCategory === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setSelectedCategory('all')}
            style={{ borderRadius: 'var(--radius-full)', padding: '5px 12px', fontSize: '0.76rem' }}
          >
            Todas las categorías
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              className={`btn btn-sm ${selectedCategory === cat.id ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setSelectedCategory(cat.id)}
              style={{ borderRadius: 'var(--radius-full)', padding: '6px 14px', whiteSpace: 'nowrap' }}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Parts Grid */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: '12px',
          paddingRight: '4px'
        }}>
          {filteredParts.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <AlertCircle size={44} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
              <h3>No se encontraron repuestos</h3>
              <p style={{ fontSize: '0.85rem' }}>Intenta con otro código OEM, nombre o elimina el filtro de vehículo.</p>
            </div>
          ) : (
            filteredParts.map(part => {
              const isOut = part.stock === 0;
              const isLow = part.stock <= part.minStock && !isOut;

              return (
                <div
                  key={part.id}
                  onClick={() => addToCart(part)}
                  className="card"
                  style={{
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    cursor: isOut && docType !== 'proforma' ? 'not-allowed' : 'pointer',
                    opacity: isOut && docType !== 'proforma' ? 0.65 : 1,
                    position: 'relative',
                    transition: 'transform 0.15s ease, border-color 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isOut || docType === 'proforma') {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.borderColor = 'var(--primary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                  }}
                >
                  <div>
                    {/* Top: OEM & Disponibilidad */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        OEM: <strong style={{ color: 'var(--accent-cyan)' }}>{part.oemNumber}</strong>
                      </span>
                      <span className={`badge ${isOut ? 'badge-danger' : (isLow ? 'badge-warning' : 'badge-success')}`} style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                        {isOut ? 'AGOTADO' : `${part.stock} disp.`}
                      </span>
                    </div>

                    {/* Middle: Photo Thumbnail + Part Name */}
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', margin: '4px 0 6px' }}>
                      {part.image && (
                        <div 
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewPart(part);
                          }}
                          style={{
                            width: '52px',
                            height: '52px',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            flexShrink: 0,
                            border: '1px solid var(--border-color)',
                            backgroundColor: 'var(--bg-tertiary)',
                            position: 'relative',
                            cursor: 'zoom-in',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
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
                            bottom: '2px',
                            right: '2px',
                            backgroundColor: 'rgba(0,0,0,0.7)',
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

                      <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.35, flex: 1 }}>
                        {part.name}
                      </h4>
                    </div>
                  </div>

                  {/* Bottom: Price & Add Button */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    marginTop: '10px',
                    borderTop: '1px solid var(--border-color)',
                    paddingTop: '8px'
                  }}>
                    <div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--primary-hover)' }}>
                        {settings.currencySymbol}{part.salePrice.toFixed(2)}
                      </div>
                      {customer.isWorkshop && (
                        <div style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                          Taller: {settings.currencySymbol}{part.wholesalePrice.toFixed(2)}
                        </div>
                      )}
                    </div>

                    <button 
                      className="btn btn-primary btn-sm btn-icon"
                      style={{ width: '32px', height: '32px' }}
                      title="Agregar al Carrito"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Ticket de Venta / Mostrador POS */}
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Document Type Selector */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          borderBottom: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-tertiary)'
        }}>
          {[
            { id: 'ticket', label: 'Ticket Caja' },
            { id: 'proforma', label: 'Cotización / Proforma' },
            { id: 'factura', label: 'Factura Fiscal' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setDocType(tab.id)}
              style={{
                padding: '10px 4px',
                border: 'none',
                background: docType === tab.id ? 'var(--bg-secondary)' : 'transparent',
                color: docType === tab.id ? 'var(--primary-hover)' : 'var(--text-muted)',
                fontWeight: docType === tab.id ? 700 : 500,
                fontSize: '0.78rem',
                cursor: 'pointer',
                borderBottom: docType === tab.id ? '2px solid var(--primary)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Customer Information Bar */}
        <div style={{
          padding: '12px 16px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          backgroundColor: 'var(--bg-card)'
        }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              className="input"
              placeholder="Nombre del Cliente / Taller..."
              value={customer.name}
              onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
              style={{ fontSize: '0.82rem', padding: '6px 10px' }}
            />
            <input
              type="text"
              className="input"
              placeholder="Cédula / RIF / NIT"
              value={customer.docId}
              onChange={(e) => setCustomer({ ...customer, docId: e.target.value })}
              style={{ width: '130px', fontSize: '0.82rem', padding: '6px 10px' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>
              <input
                type="checkbox"
                checked={customer.isWorkshop}
                onChange={(e) => setCustomer({ ...customer, isWorkshop: e.target.checked })}
              />
              <span style={{ fontWeight: customer.isWorkshop ? 700 : 400, color: customer.isWorkshop ? 'var(--accent-cyan)' : 'inherit' }}>
                ¿Es Taller Mecánico Aliado? (Precio Mayorista)
              </span>
            </label>

            {cart.length > 0 && (
              <button 
                onClick={clearCart} 
                className="btn btn-secondary btn-sm" 
                style={{ color: 'var(--danger)', padding: '2px 8px', fontSize: '0.72rem' }}
                title="Vaciar ticket"
              >
                Vaciar
              </button>
            )}
          </div>
        </div>

        {/* Cart Items List */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '12px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          {cart.length === 0 ? (
            <div style={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              textAlign: 'center',
              padding: '20px'
            }}>
              <ShoppingCart size={40} style={{ opacity: 0.35, marginBottom: '8px' }} />
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Mostrador listo</div>
              <div style={{ fontSize: '0.78rem', maxWidth: '240px' }}>
                Haz clic en cualquier repuesto o búscalo por código OEM para agregarlo a la venta.
              </div>
            </div>
          ) : (
            cart.map((item, index) => (
              <div
                key={index}
                style={{
                  padding: '10px 12px',
                  backgroundColor: 'var(--bg-tertiary)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1, paddingRight: '8px' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {item.name}
                    </div>
                    <div className="mono" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      OEM: {item.oemNumber} • {item.brand}
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(index)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--danger)',
                      cursor: 'pointer',
                      padding: '2px'
                    }}
                    title="Eliminar de la venta"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
                  {/* Quantity Stepper */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button
                      className="btn btn-secondary btn-icon"
                      style={{ width: '26px', height: '26px' }}
                      onClick={() => updateQty(index, -1)}
                    >
                      <Minus size={12} />
                    </button>
                    <span style={{ fontWeight: 800, minWidth: '22px', textAlign: 'center', fontSize: '0.9rem' }}>
                      {item.qty}
                    </span>
                    <button
                      className="btn btn-secondary btn-icon"
                      style={{ width: '26px', height: '26px' }}
                      onClick={() => updateQty(index, 1)}
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  {/* Price toggle (Detalle vs Mayorista) & Subtotal */}
                  <div style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => toggleItemPriceType(index)}
                      style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '0.72rem',
                        color: 'var(--primary-hover)',
                        cursor: 'pointer',
                        textDecoration: 'underline'
                      }}
                      title="Cambiar tipo de precio"
                    >
                      {settings.currencySymbol}{item.price.toFixed(2)} c/u
                    </button>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>
                      {settings.currencySymbol}{item.subtotal.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Totals & Checkout Button */}
        <div style={{
          padding: '16px',
          borderTop: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-card)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          {/* Subtotal, Descuento, IVA */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.82rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>Subtotal:</span>
              <span>{settings.currencySymbol}{subtotal.toFixed(2)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-secondary)' }}>
              <span>Descuento %:</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                {[0, 5, 10].map(pct => (
                  <button
                    key={pct}
                    className={`btn btn-sm ${discountPercent === pct ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '2px 7px', fontSize: '0.72rem' }}
                    onClick={() => setDiscountPercent(pct)}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>IVA ({settings.taxRate}%):</span>
              <span>{settings.currencySymbol}{taxAmount.toFixed(2)}</span>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              paddingTop: '6px',
              borderTop: '1px dashed var(--border-color)',
              marginTop: '4px'
            }}>
              <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                TOTAL:
              </span>
              <span style={{ fontWeight: 900, fontSize: '1.5rem', color: 'var(--primary-hover)' }}>
                {settings.currencySymbol}{grandTotal.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Action Button: Checkout / Emitir Proforma */}
          <button
            className={`btn ${docType === 'proforma' ? 'btn-secondary' : 'btn-success'} btn-lg`}
            disabled={cart.length === 0}
            onClick={() => {
              if (docType === 'proforma') {
                handleConfirmCheckout();
              } else {
                setIsCheckoutOpen(true);
              }
            }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontWeight: 800
            }}
          >
            {docType === 'proforma' ? (
              <>
                <FileCheck size={18} />
                <span>Generar Cotización / Proforma</span>
              </>
            ) : (
              <>
                <CreditCard size={18} />
                <span>Cobrar {settings.currencySymbol}{grandTotal.toFixed(2)}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* MODAL DE COBRO (MÉTODOS DE PAGO Y VUELTO) */}
      {isCheckoutOpen && (
        <div className="modal-overlay" onClick={() => setIsCheckoutOpen(false)}>
          <div 
            className="modal-content" 
            onClick={(e) => e.stopPropagation()} 
            style={{ maxWidth: '440px' }}
          >
            <div className="modal-header">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Cobrar Venta de Mostrador</h3>
              <button className="btn btn-secondary btn-icon btn-sm" onClick={() => setIsCheckoutOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ textAlign: 'center', padding: '10px 0' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Monto Total a Cobrar</div>
                <div style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--primary-hover)' }}>
                  {settings.currencySymbol}{grandTotal.toFixed(2)}
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="input-group">
                <label className="input-label">Método de Pago</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {[
                    { id: 'cash', label: 'Efectivo', icon: DollarSign },
                    { id: 'card', label: 'Punto / Tarjeta', icon: CreditCard },
                    { id: 'transfer', label: 'Transferencia', icon: Layers },
                    { id: 'credit', label: 'Crédito (Taller)', icon: User }
                  ].map(m => {
                    const Icon = m.icon;
                    const isSel = paymentMethod === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPaymentMethod(m.id)}
                        className="btn"
                        style={{
                          backgroundColor: isSel ? 'var(--primary-light)' : 'var(--bg-tertiary)',
                          color: isSel ? 'var(--primary-hover)' : 'var(--text-primary)',
                          border: isSel ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                          padding: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '0.84rem'
                        }}
                      >
                        <Icon size={16} />
                        <span>{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Si es efectivo: Calculadora de cambio/vuelto */}
              {paymentMethod === 'cash' && (
                <div style={{
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)'
                }}>
                  <div className="input-group" style={{ marginBottom: '8px' }}>
                    <label className="input-label">Monto recibido del cliente:</label>
                    <input
                      type="number"
                      step="any"
                      className="input"
                      placeholder={`Ej: ${Math.ceil(grandTotal)}`}
                      value={cashTendered}
                      onChange={(e) => setCashTendered(e.target.value)}
                      style={{ fontSize: '1.1rem', fontWeight: 700 }}
                      autoFocus
                    />
                  </div>

                  {Number(cashTendered) > 0 && (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingTop: '8px',
                      borderTop: '1px solid var(--border-color)',
                      fontSize: '0.9rem'
                    }}>
                      <span>Cambio / Vuelto a entregar:</span>
                      <strong style={{ 
                        color: Number(cashTendered) >= grandTotal ? 'var(--success)' : 'var(--danger)',
                        fontSize: '1.2rem'
                      }}>
                        {Number(cashTendered) >= grandTotal 
                          ? `${settings.currencySymbol}${(Number(cashTendered) - grandTotal).toFixed(2)}`
                          : 'Monto insuficiente'}
                      </strong>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setIsCheckoutOpen(false)}>
                Cancelar
              </button>
              <button 
                className="btn btn-success btn-lg" 
                onClick={handleConfirmCheckout}
                disabled={paymentMethod === 'cash' && Number(cashTendered) > 0 && Number(cashTendered) < grandTotal}
                style={{ fontWeight: 800 }}
              >
                <Check size={18} />
                <span>Confirmar e Imprimir Ticket</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Previsualización de Foto de Repuesto */}
      {previewPart && (
        <ImagePreviewModal
          part={previewPart}
          settings={settings}
          onClose={() => setPreviewPart(null)}
          onAddToCart={(p) => addToCart(p)}
        />
      )}
    </div>
  );
}
