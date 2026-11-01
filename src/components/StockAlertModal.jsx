import React from 'react';
import { AlertTriangle, X, Plus, PackageCheck, MapPin } from 'lucide-react';

export default function StockAlertModal({ parts, onAdjustStock, onClose, settings }) {
  const criticalParts = parts.filter(p => p.stock <= p.minStock);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '640px' }}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--warning-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--warning)'
            }}>
              <AlertTriangle size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                Alertas de Stock Crítico ({criticalParts.length})
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Repuestos por debajo del nivel mínimo o totalmente agotados
              </p>
            </div>
          </div>
          <button className="btn btn-secondary btn-icon btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          {criticalParts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px 20px', color: 'var(--text-muted)' }}>
              <PackageCheck size={48} color="var(--success)" style={{ margin: '0 auto 12px' }} />
              <h4>¡Excelente! Todo el inventario está en niveles óptimos</h4>
              <p style={{ fontSize: '0.85rem' }}>No hay repuestos en nivel crítico en este momento.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {criticalParts.map(part => {
                const isOut = part.stock === 0;

                return (
                  <div
                    key={part.id}
                    style={{
                      padding: '14px 16px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-tertiary)',
                      border: `1px solid ${isOut ? 'rgba(239, 68, 68, 0.4)' : 'rgba(245, 158, 11, 0.4)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '14px'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span className={`badge ${isOut ? 'badge-danger' : 'badge-warning'}`}>
                          {isOut ? 'AGOTADO' : 'STOCK BAJO'}
                        </span>
                        <span className="mono" style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          OEM: {part.oemNumber}
                        </span>
                      </div>
                      <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {part.name}
                      </h4>
                      <div style={{ 
                        fontSize: '0.76rem', 
                        color: 'var(--text-secondary)',
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '12px',
                        marginTop: '4px'
                      }}>
                        <span>Marca: <strong>{part.brand}</strong></span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={12} /> {part.location || 'Sin ubicación'}
                        </span>
                      </div>
                    </div>

                    {/* Stock Levels & Quick Restock */}
                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                      <div style={{ fontSize: '0.82rem' }}>
                        Stock actual: <strong style={{ color: isOut ? 'var(--danger)' : 'var(--warning)', fontSize: '1rem' }}>{part.stock}</strong> / Mínimo: {part.minStock}
                      </div>

                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => onAdjustStock(part.id, 5, 'Reabastecimiento rápido +5')}
                          title="Sumar 5 unidades"
                        >
                          <Plus size={14} /> +5
                        </button>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => onAdjustStock(part.id, 10, 'Reabastecimiento rápido +10')}
                          title="Sumar 10 unidades"
                        >
                          <Plus size={14} /> +10
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
