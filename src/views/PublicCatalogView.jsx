import React, { useState } from 'react';
import { 
  Search, 
  ShoppingCart, 
  Car, 
  MapPin, 
  MessageCircle, 
  Check, 
  Plus, 
  Minus, 
  Trash2, 
  ShieldCheck, 
  Wrench,
  X,
  Phone,
  Layers
} from 'lucide-react';
import { CATEGORIES } from '../data/mockData';

export default function PublicCatalogView({ 
  parts, 
  settings, 
  onBackToAdmin 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const getCategoryLabel = (catValue) => {
    if (!catValue) return 'General';
    const found = CATEGORIES.find(c => c.id.toLowerCase() === catValue.toLowerCase());
    return found ? found.name : catValue;
  };

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
      part.brand.toLowerCase().includes(q) ||
      (part.category && part.category.toLowerCase().includes(q))
    );

    const matchesCategory = selectedCategory === 'all' || (part.category || '').toLowerCase() === selectedCategory.toLowerCase();

    return matchesQuery && matchesCategory;
  });

  const addToCart = (part) => {
    const existingIndex = cart.findIndex(i => i.id === part.id);
    if (existingIndex > -1) {
      const updated = [...cart];
      updated[existingIndex].qty += 1;
      setCart(updated);
    } else {
      setCart([...cart, { ...part, qty: 1 }]);
    }
    setIsCartOpen(true);
  };

  const updateQty = (id, delta) => {
    const updated = cart.map(item => {
      if (item.id === id) {
        const newQty = item.qty + delta;
        return newQty > 0 ? { ...item, qty: newQty } : null;
      }
      return item;
    }).filter(Boolean);
    setCart(updated);
  };

  const taxRate = Number(settings.taxRate) > 0 ? Number(settings.taxRate) : 16;
  const subtotalCart = cart.reduce((acc, item) => acc + (item.salePrice * item.qty), 0);
  const taxCart = (subtotalCart * taxRate) / 100;
  const totalCart = subtotalCart + taxCart;

  // Generar y enviar pedido por WhatsApp
  const handleSendWhatsAppOrder = () => {
    if (cart.length === 0) return;

    const rawPhone = settings.whatsapp ? settings.whatsapp.replace(/[^0-9]/g, '') : '';
    let msg = `*¡Hola ${settings.storeName}!* 👋\n`;
    msg += `Quisiera consultar disponibilidad y cotizar estos repuestos:\n\n`;

    msg += `📋 *LISTA DE REPUESTOS:* \n`;
    cart.forEach((item, idx) => {
      msg += `${idx + 1}. *${item.qty}x* ${item.name}\n`;
      msg += `   • Marca: ${item.brand} | OEM: ${item.oemNumber}\n`;
      msg += `   • Subtotal: ${settings.currencySymbol}${(item.salePrice * item.qty).toFixed(2)}\n`;
    });

    msg += `\n• *Subtotal (Sin IVA):* ${settings.currencySymbol}${subtotalCart.toFixed(2)}`;
    msg += `\n• *+ IVA (${taxRate}%):* +${settings.currencySymbol}${taxCart.toFixed(2)}`;
    msg += `\n💰 *TOTAL CON IVA:* ${settings.currencySymbol}${totalCart.toFixed(2)}\n`;
    msg += `\n¿Tienen entrega inmediata en tienda o envíos? ¡Muchas gracias!`;

    const encoded = encodeURIComponent(msg);
    if (rawPhone) {
      window.open(`https://wa.me/${rawPhone}?text=${encoded}`, '_blank');
    } else {
      window.open(`https://wa.me/?text=${encoded}`, '_blank');
    }
  };

  return (
    <div style={{
      backgroundColor: 'var(--bg-primary)',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }} className="animate-fade-in">
      {/* Top Public Bar */}
      <nav style={{
        backgroundColor: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-color)',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, var(--primary) 0%, #1e40af 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff'
          }}>
            <Wrench size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>
              {settings.storeName}
            </h1>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Catálogo Digital de Repuestos & Consulta Inmediata
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Back to Internal POS */}
          <button className="btn btn-secondary btn-sm" onClick={onBackToAdmin}>
            <Layers size={15} />
            <span>Panel de Tienda</span>
          </button>

          {/* Cart Trigger */}
          <button
            className="btn btn-primary"
            onClick={() => setIsCartOpen(!isCartOpen)}
            style={{ position: 'relative' }}
          >
            <ShoppingCart size={18} />
            <span>Mi Cotización ({cart.length})</span>
            {cart.length > 0 && (
              <span className="mono" style={{ fontWeight: 800 }}>
                • {settings.currencySymbol}{totalCart.toFixed(2)}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* Hero Search Banner */}
      <div style={{
        background: 'linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-primary) 100%)',
        padding: '32px 24px 24px',
        borderBottom: '1px solid var(--border-color)',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
            Catálogo de Repuestos y Lubricantes
          </h2>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', marginBottom: '18px' }}>
            Busca por nombre, marca, categoría o código OEM. Cotiza y pide directo a WhatsApp con atención inmediata.
          </p>

          <div style={{
            backgroundColor: 'var(--bg-card)',
            padding: '12px',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-md)',
            position: 'relative'
          }}>
            <Search size={18} style={{ position: 'absolute', left: '24px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="input"
              placeholder="Escribe el nombre del repuesto, marca o código OEM..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '38px' }}
            />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px', width: '100%', flex: 1 }}>
        {/* Categories Pills */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '16px' }}>
          <button
            className={`btn btn-sm ${selectedCategory === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setSelectedCategory('all')}
            style={{ borderRadius: 'var(--radius-full)', padding: '6px 16px' }}
          >
            Todos los Repuestos ({parts.length})
          </button>
          {uniqueCategories.map(cat => (
            <button
              key={cat}
              className={`btn btn-sm ${selectedCategory.toLowerCase() === cat.toLowerCase() ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setSelectedCategory(cat)}
              style={{ borderRadius: 'var(--radius-full)', padding: '6px 16px', whiteSpace: 'nowrap' }}
            >
              {getCategoryLabel(cat)}
            </button>
          ))}
        </div>

        {/* Parts Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '18px',
          marginTop: '8px'
        }}>
          {filteredParts.map(part => {
            const isOut = part.stock === 0;

            return (
              <div
                key={part.id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '18px',
                  borderRadius: 'var(--radius-lg)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span className="badge badge-primary mono" style={{ fontSize: '0.72rem' }}>
                      {part.brand}
                    </span>
                    <span className={`badge ${isOut ? 'badge-danger' : 'badge-success'}`}>
                      {isOut ? 'Agotado' : 'Disponible en Tienda'}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    {part.name}
                  </h3>

                  <div className="mono" style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                    Código OEM: <strong>{part.oemNumber}</strong>
                  </div>

                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.35, marginBottom: '10px' }}>
                    {part.description}
                  </p>
                </div>

                {/* Card Bottom */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: '16px',
                  borderTop: '1px solid var(--border-color)',
                  paddingTop: '12px'
                }}>
                  <div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>PRECIO</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--primary-hover)' }}>
                      {settings.currencySymbol}{part.salePrice.toFixed(2)}
                    </div>
                  </div>

                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => addToCart(part)}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Plus size={16} />
                    <span>Agregar</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SLIDE-OVER / MODAL CART (COTIZACIÓN POR WHATSAPP) */}
      {isCartOpen && (
        <div className="modal-overlay" onClick={() => setIsCartOpen(false)}>
          <div 
            className="modal-content" 
            onClick={(e) => e.stopPropagation()} 
            style={{ maxWidth: '440px' }}
          >
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShoppingCart size={20} color="var(--primary)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Tu Cotización de Repuestos</h3>
              </div>
              <button className="btn btn-secondary btn-icon btn-sm" onClick={() => setIsCartOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '55vh', overflowY: 'auto' }}>
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)' }}>
                  <ShoppingCart size={40} style={{ margin: '0 auto 10px', opacity: 0.3 }} />
                  <p>Aún no has agregado repuestos a tu cotización.</p>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {cart.map(item => (
                      <div
                        key={item.id}
                        style={{
                          padding: '10px 12px',
                          backgroundColor: 'var(--bg-tertiary)',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-color)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <div style={{ flex: 1, paddingRight: '8px' }}>
                          <div style={{ fontSize: '0.86rem', fontWeight: 700 }}>{item.name}</div>
                          <div className="mono" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            OEM: {item.oemNumber} • {item.brand}
                          </div>
                          <div style={{ fontSize: '0.84rem', fontWeight: 800, marginTop: '2px' }}>
                            {settings.currencySymbol}{(item.salePrice * item.qty).toFixed(2)}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            className="btn btn-secondary btn-icon"
                            style={{ width: '26px', height: '26px' }}
                            onClick={() => updateQty(item.id, -1)}
                          >
                            <Minus size={12} />
                          </button>
                          <span style={{ fontWeight: 800, minWidth: '20px', textAlign: 'center' }}>
                            {item.qty}
                          </span>
                          <button
                            className="btn btn-secondary btn-icon"
                            style={{ width: '26px', height: '26px' }}
                            onClick={() => updateQty(item.id, 1)}
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="modal-footer" style={{ flexDirection: 'column', gap: '8px' }}>
              <div style={{ width: '100%', fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Subtotal (Sin IVA):</span>
                  <span>{settings.currencySymbol}{subtotalCart.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                  <span>+ IVA ({taxRate}%):</span>
                  <span>+{settings.currencySymbol}{taxCart.toFixed(2)}</span>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '1.1rem', fontWeight: 800, borderTop: '1px dashed var(--border-color)', paddingTop: '6px' }}>
                <span>Total (IVA Incluido):</span>
                <span style={{ color: 'var(--primary-hover)' }}>{settings.currencySymbol}{totalCart.toFixed(2)}</span>
              </div>

              <button
                className="btn btn-success btn-lg"
                disabled={cart.length === 0}
                onClick={handleSendWhatsAppOrder}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 800 }}
              >
                <MessageCircle size={20} />
                <span>Pedir Cotización por WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
