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
  Eye,
  Package
} from 'lucide-react';
import { CATEGORIES } from '../data/mockData';
import ImagePreviewModal from '../components/ImagePreviewModal';

export default function PosView({ 
  parts, 
  settings, 
  vehicles, 
  activeVehicle, 
  setActiveVehicle,
  onCompleteSale,
  onNavigate,
  onLoadDemoParts
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

  const [mobileTab, setMobileTab] = useState('catalog'); // 'catalog' | 'cart'
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

  // Cálculos de totales con IVA desglosado
  const effectiveTaxRate = Number(settings.taxRate) > 0 ? Number(settings.taxRate) : 16;
  const subtotal = cart.reduce((acc, item) => acc + item.subtotal, 0);
  const discountAmount = (subtotal * discountPercent) / 100;
  const taxableBase = Math.max(0, subtotal - discountAmount);
  const taxAmount = (taxableBase * effectiveTaxRate) / 100;
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
      discountPercent,
      taxableBase,
      taxRate: effectiveTaxRate,
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
    <div className="pos-container animate-fade-in">
      {/* Mobile Tab Switcher (Visible only on mobile <= 900px) */}
      <div className="mobile-only" style={{
        display: 'flex',
        gap: '8px',
        backgroundColor: 'var(--bg-secondary)',
        padding: '6px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
        width: '100%',
        marginBottom: '6px'
      }}>
        <button
          type="button"
          className={`btn btn-sm ${mobileTab === 'catalog' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ flex: 1, padding: '9px 12px', fontWeight: 700, gap: '6px' }}
          onClick={() => setMobileTab('catalog')}
        >
          <Search size={15} />
          <span>Repuestos ({filteredParts.length})</span>
        </button>
        <button
          type="button"
          className={`btn btn-sm ${mobileTab === 'cart' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ flex: 1, padding: '9px 12px', fontWeight: 700, gap: '6px', position: 'relative' }}
          onClick={() => setMobileTab('cart')}
        >
          <ShoppingCart size={15} />
          <span>Carrito ({cart.reduce((a, b) => a + b.qty, 0)})</span>
          {cart.length > 0 && (
            <span style={{
              fontWeight: 800,
              color: mobileTab === 'cart' ? '#fff' : 'var(--primary)',
              marginLeft: '2px'
            }}>
              • {settings.currencySymbol}{grandTotal.toFixed(2)}
            </span>
          )}
        </button>
      </div>

      {/* LEFT COLUMN: Catálogo y Búsqueda de Mostrador */}
      <div className={`pos-catalog-col ${mobileTab !== 'catalog' ? 'pos-tab-hidden' : ''}`}>
        {/* Search Bar & Fast Vehicle Filter */}
        <div style={{
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
          backgroundColor: 'var(--bg-secondary)',
          padding: '8px 12px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
          flexShrink: 0
        }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search 
              size={16} 
              style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} 
            />
            <input
              ref={searchInputRef}
              type="text"
              className="input"
              placeholder="Buscar por Nombre, Código OEM (ej: 04465-02220), Código de Barras o Marca..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '34px', fontSize: '0.84rem', paddingTop: '6px', paddingBottom: '6px' }}
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
                <X size={15} />
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
            style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 10px', fontSize: '0.76rem' }}
            title="Filtrar repuestos para el vehículo del cliente"
          >
            <Car size={15} />
            <span>{activeVehicle ? `${activeVehicle.make}` : 'Filtrar por Auto'}</span>
            {activeVehicle && <X size={13} />}
          </button>
        </div>

        {/* Vehicle Type Switcher & Categories Horizontal Scroll */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', overflowX: 'auto', paddingBottom: '2px', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch', flexShrink: 0 }}>
          <button
            className={`btn btn-sm ${vehicleTypeFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setVehicleTypeFilter('all')}
            style={{ borderRadius: 'var(--radius-full)', padding: '4px 10px', fontSize: '0.74rem', whiteSpace: 'nowrap', flexShrink: 0 }}
          >
            Todos ({parts.length})
          </button>
          <button
            className={`btn btn-sm ${vehicleTypeFilter === 'moto' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setVehicleTypeFilter('moto')}
            style={{ borderRadius: 'var(--radius-full)', padding: '4px 10px', fontSize: '0.74rem', fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0 }}
          >
            🏍️ Motos (Bera, Empire, Toro, MD)
          </button>
          <button
            className={`btn btn-sm ${vehicleTypeFilter === 'car' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setVehicleTypeFilter('car')}
            style={{ borderRadius: 'var(--radius-full)', padding: '4px 10px', fontSize: '0.74rem', fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0 }}
          >
            🚗 Aceites & Carros (Shell, Castrol, PDV)
          </button>
        </div>

        {/* Categories Horizontal Scroll */}
        <div style={{
          display: 'flex',
          gap: '6px',
          overflowX: 'auto',
          paddingBottom: '2px',
          scrollbarWidth: 'none',
          flexShrink: 0
        }}>
          <button
            className={`btn btn-sm ${selectedCategory === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setSelectedCategory('all')}
            style={{ borderRadius: 'var(--radius-full)', padding: '4px 10px', fontSize: '0.73rem', whiteSpace: 'nowrap' }}
          >
            Todas las categorías
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              className={`btn btn-sm ${selectedCategory === cat.id ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setSelectedCategory(cat.id)}
              style={{ borderRadius: 'var(--radius-full)', padding: '4px 12px', fontSize: '0.73rem', whiteSpace: 'nowrap' }}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Parts Grid (2 cols on mobile, auto-fill on desktop) */}
        <div style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(140px, 44vw, 200px), 1fr))',
          alignContent: 'start',
          gap: '10px',
          paddingRight: '4px'
        }}>
          {filteredParts.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <Package size={44} style={{ margin: '0 auto 10px', opacity: 0.5, color: 'var(--accent-cyan)' }} />
              <h3>{parts.length === 0 ? 'Catálogo en Cero' : 'No se encontraron repuestos'}</h3>
              <p style={{ fontSize: '0.85rem', maxWidth: '380px', margin: '6px auto 14px' }}>
                {parts.length === 0 
                  ? 'Aún no hay repuestos cargados en el inventario. Registra repuestos para comenzar a cobrar en mostrador.' 
                  : 'Intenta con otro código OEM, nombre o elimina el filtro de vehículo.'}
              </p>
              {parts.length === 0 && (
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  {onNavigate && (
                    <button className="btn btn-primary btn-sm" onClick={() => onNavigate('inventory')}>
                      <span>Ir a Inventario de Repuestos</span>
                    </button>
                  )}
                  {onLoadDemoParts && (
                    <button 
                      className="btn btn-secondary btn-sm" 
                      onClick={onLoadDemoParts}
                      style={{ color: 'var(--accent-cyan)', borderColor: 'rgba(0, 229, 255, 0.4)' }}
                    >
                      <span>Cargar Demo (17 SKUs)</span>
                    </button>
                  )}
                </div>
              )}
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
      <div className={`pos-cart-col ${mobileTab !== 'cart' ? 'pos-tab-hidden' : ''}`}>
        {/* Mobile back to catalog button */}
        <div className="mobile-only" style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-tertiary)' }}>
          <button 
            type="button" 
            onClick={() => setMobileTab('catalog')} 
            className="btn btn-secondary btn-sm" 
            style={{ width: '100%', justifyContent: 'center', fontWeight: 600 }}
          >
            ← Volver al Catálogo de Repuestos
          </button>
        </div>

        {/* Document Type Selector */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          borderBottom: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-tertiary)',
          flexShrink: 0
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
                padding: '8px 4px',
                border: 'none',
                background: docType === tab.id ? 'var(--bg-secondary)' : 'transparent',
                color: docType === tab.id ? 'var(--primary-hover)' : 'var(--text-muted)',
                fontWeight: docType === tab.id ? 700 : 500,
                fontSize: '0.75rem',
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
          padding: '8px 12px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          backgroundColor: 'var(--bg-card)',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            <input
              type="text"
              className="input"
              placeholder="Nombre del Cliente / Taller..."
              value={customer.name}
              onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
              style={{ fontSize: '0.78rem', padding: '5px 8px', flex: 1 }}
            />
            <input
              type="text"
              className="input"
              placeholder="Cédula / RIF"
              value={customer.docId}
              onChange={(e) => setCustomer({ ...customer, docId: e.target.value })}
              style={{ width: '105px', fontSize: '0.78rem', padding: '5px 8px' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <input
              type="tel"
              className="input"
              placeholder="WhatsApp del Cliente (ej: +58 412 1234567)"
              value={customer.phone}
              onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
              style={{ fontSize: '0.76rem', padding: '4px 8px', flex: 1 }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>
              <input
                type="checkbox"
                checked={customer.isWorkshop}
                onChange={(e) => setCustomer({ ...customer, isWorkshop: e.target.checked })}
              />
              <span style={{ fontWeight: customer.isWorkshop ? 700 : 400, color: customer.isWorkshop ? 'var(--accent-cyan)' : 'inherit' }}>
                ¿Taller Mecánico Aliado? (Mayorista)
              </span>
            </label>

            {cart.length > 0 && (
              <button 
                onClick={clearCart} 
                className="btn btn-secondary btn-sm" 
                style={{ color: 'var(--danger)', padding: '2px 8px', fontSize: '0.7rem' }}
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
          minHeight: 0,
          overflowY: 'auto',
          padding: '8px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
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
          padding: '10px 14px',
          borderTop: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-card)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          flexShrink: 0
        }}>
          {/* Subtotal, Descuento, Base Imponible, IVA */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '0.78rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>Subtotal (Sin IVA):</span>
              <span>{settings.currencySymbol}{subtotal.toFixed(2)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-secondary)' }}>
              <span>Descuento %:</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                {[0, 5, 10].map(pct => (
                  <button
                    key={pct}
                    className={`btn btn-sm ${discountPercent === pct ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '1px 6px', fontSize: '0.7rem', minHeight: '22px' }}
                    onClick={() => setDiscountPercent(pct)}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            {discountAmount > 0 && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--danger)' }}>
                  <span>Descuento aplicado ({discountPercent}%):</span>
                  <span>-{settings.currencySymbol}{discountAmount.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                  <span>Base Imponible:</span>
                  <span>{settings.currencySymbol}{taxableBase.toFixed(2)}</span>
                </div>
              </>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--accent-cyan)', fontWeight: 600 }}>
              <span>+ IVA ({effectiveTaxRate}%):</span>
              <span>+{settings.currencySymbol}{taxAmount.toFixed(2)}</span>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              paddingTop: '4px',
              borderTop: '1px dashed var(--border-color)',
              marginTop: '2px'
            }}>
              <span style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                TOTAL (IVA INCL.):
              </span>
              <span style={{ fontWeight: 900, fontSize: '1.3rem', color: 'var(--primary-hover)' }}>
                {settings.currencySymbol}{grandTotal.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Action Button: Checkout / Emitir Proforma */}
          <button
            className={`btn ${docType === 'proforma' ? 'btn-secondary' : 'btn-success'}`}
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
              fontWeight: 800,
              padding: '10px 16px'
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

      {/* Floating Mobile Cart Action Bar */}
      {mobileTab === 'catalog' && cart.length > 0 && (
        <div 
          className="mobile-only"
          onClick={() => setMobileTab('cart')}
          style={{
            position: 'fixed',
            bottom: 'calc(var(--bottom-nav-height, 62px) + 8px)',
            left: '12px',
            right: '12px',
            backgroundColor: 'var(--primary)',
            color: '#ffffff',
            padding: '12px 18px',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 6px 20px var(--primary-glow)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 180,
            cursor: 'pointer',
            animation: 'fadeIn 0.2s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingCart size={20} />
            <span style={{ fontWeight: 800, fontSize: '0.92rem' }}>
              {cart.reduce((a, b) => a + b.qty, 0)} {cart.reduce((a, b) => a + b.qty, 0) === 1 ? 'repuesto' : 'repuestos'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontWeight: 900, fontSize: '1.1rem' }}>
              {settings.currencySymbol}{grandTotal.toFixed(2)}
            </span>
            <span style={{
              backgroundColor: 'rgba(255,255,255,0.25)',
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.78rem',
              fontWeight: 800
            }}>
              Ver Carrito ❯
            </span>
          </div>
        </div>
      )}

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
              <div style={{
                textAlign: 'center',
                padding: '12px 16px',
                backgroundColor: 'var(--bg-tertiary)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  <span>Base Imponible:</span>
                  <span>{settings.currencySymbol}{taxableBase.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--accent-cyan)', fontWeight: 600, marginBottom: '8px' }}>
                  <span>+ IVA ({effectiveTaxRate}%):</span>
                  <span>+{settings.currencySymbol}{taxAmount.toFixed(2)}</span>
                </div>
                <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '8px' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Monto Total a Cobrar (IVA Incluido)</div>
                  <div style={{ fontSize: '2.1rem', fontWeight: 900, color: 'var(--primary-hover)', lineHeight: 1.15 }}>
                    {settings.currencySymbol}{grandTotal.toFixed(2)}
                  </div>
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
