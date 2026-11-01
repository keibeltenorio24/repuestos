import React, { useEffect } from 'react';
import { X, ZoomIn, Check, ShieldCheck, Tag, ShoppingCart, Layers, AlertCircle } from 'lucide-react';

export default function ImagePreviewModal({ part, settings, onClose, onAddToCart }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!part) return null;

  const isOut = part.stock === 0;
  const isLow = part.stock <= part.minStock && !isOut;

  return (
    <div 
      className="modal-overlay animate-fade-in" 
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
    >
      <div 
        className="modal-card" 
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-color)',
          maxWidth: '820px',
          width: '100%',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
          maxHeight: '92vh',
          overflowY: 'auto',
          position: 'relative'
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '14px',
            right: '14px',
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            backgroundColor: 'var(--bg-tertiary)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10,
            transition: 'background-color 0.2s, color 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--danger)';
            e.currentTarget.style.color = '#fff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
        >
          <X size={18} />
        </button>

        {/* Left Side: Product Image Display */}
        <div style={{
          backgroundColor: '#0a0f1d',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          borderRight: '1px solid var(--border-color)',
          position: 'relative',
          minHeight: '380px'
        }}>
          <div style={{
            width: '100%',
            height: '100%',
            maxHeight: '340px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            <img 
              src={part.image || '/products/kit_arrastre.jpg'} 
              alt={part.name}
              style={{
                maxWidth: '100%',
                maxHeight: '340px',
                objectFit: 'contain',
                transition: 'transform 0.3s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            />
          </div>

          <div style={{
            marginTop: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.75rem',
            color: 'var(--text-muted)'
          }}>
            <ZoomIn size={14} />
            <span>Pasa el cursor sobre la foto para ver más detalle</span>
          </div>
        </div>

        {/* Right Side: Product Details */}
        <div style={{
          padding: '28px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          maxHeight: '520px',
          overflowY: 'auto'
        }}>
          <div>
            {/* Badges row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
              <span className="badge badge-primary mono" style={{ fontSize: '0.72rem' }}>
                {part.brand}
              </span>
              <span className={`badge ${isOut ? 'badge-danger' : (isLow ? 'badge-warning' : 'badge-success')}`} style={{ fontSize: '0.72rem' }}>
                {isOut ? 'AGOTADO' : `${part.stock} unid. disponibles`}
              </span>
              <span className="badge badge-secondary" style={{ fontSize: '0.72rem', textTransform: 'capitalize' }}>
                {part.category}
              </span>
            </div>

            {/* Title */}
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.3, marginBottom: '10px' }}>
              {part.name}
            </h3>

            {/* Codes */}
            <div style={{
              backgroundColor: 'var(--bg-tertiary)',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              marginBottom: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              <div style={{ fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Código OEM: </span>
                <strong className="mono" style={{ color: 'var(--primary-hover)', fontSize: '0.9rem' }}>{part.oemNumber}</strong>
              </div>
              <div style={{ fontSize: '0.78rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>SKU Sistema: </span>
                <strong className="mono" style={{ color: 'var(--text-secondary)' }}>{part.sku}</strong>
                {part.barcode && (
                  <span style={{ marginLeft: '12px', color: 'var(--text-muted)' }}>
                    Barras: <span className="mono">{part.barcode}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            {part.description && (
              <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: '14px' }}>
                {part.description}
              </p>
            )}

            {/* Compatible Vehicles */}
            {part.compatibleVehicles && part.compatibleVehicles.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Vehículos que Aplica:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {part.compatibleVehicles.map((v, idx) => (
                    <span 
                      key={idx}
                      style={{
                        fontSize: '0.74rem',
                        backgroundColor: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        padding: '3px 8px',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-primary)'
                      }}
                    >
                      {v.make} {v.model} ({v.yearStart}-{v.yearEnd})
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Price & Action */}
          <div style={{
            borderTop: '1px solid var(--border-color)',
            paddingTop: '16px',
            marginTop: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Precio al Público</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--primary-hover)' }}>
                {settings?.currencySymbol || '$'}{part.salePrice.toFixed(2)}
              </div>
              {part.wholesalePrice && (
                <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>
                  Mayor / Taller: {settings?.currencySymbol || '$'}{part.wholesalePrice.toFixed(2)}
                </div>
              )}
            </div>

            {onAddToCart && (
              <button
                className="btn btn-primary"
                disabled={isOut}
                onClick={() => {
                  onAddToCart(part);
                  onClose();
                }}
                style={{ padding: '10px 18px', gap: '8px' }}
              >
                <ShoppingCart size={16} />
                <span>Agregar al POS</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
