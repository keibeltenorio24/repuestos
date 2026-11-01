import React, { useState } from 'react';
import { 
  Car, 
  Search, 
  CheckCircle2, 
  ShoppingCart, 
  MapPin, 
  Wrench, 
  ArrowRight, 
  Sparkles, 
  MessageCircle, 
  Tag, 
  Gauge,
  Eye
} from 'lucide-react';
import ImagePreviewModal from '../components/ImagePreviewModal';

export default function VehicleMatchView({ 
  parts, 
  vehicles, 
  settings, 
  onSelectVehicleForPos, 
  onNavigate 
}) {
  // Tipo de vehículo: 'moto' | 'car'
  const [vehicleType, setVehicleType] = useState('moto');
  const [previewPart, setPreviewPart] = useState(null);

  // Filtrar base de vehículos según el tipo seleccionado
  const availableVehicles = vehicles.filter(v => v.type === vehicleType || (!v.type && vehicleType === 'moto'));

  const [selectedMake, setSelectedMake] = useState('Bera');
  const [selectedModel, setSelectedModel] = useState('SBR 150 (Caballito)');
  const [selectedYear, setSelectedYear] = useState(2023);
  const [selectedEngine, setSelectedEngine] = useState('');

  // Modelos de la marca seleccionada
  const currentMakeData = availableVehicles.find(v => v.make === selectedMake) || availableVehicles[0];
  const availableModels = currentMakeData ? currentMakeData.models : [];

  // Datos del modelo seleccionado
  const currentModelData = availableModels.find(m => m.name === selectedModel) || availableModels[0];
  const availableYears = currentModelData ? currentModelData.years : [];
  const availableEngines = currentModelData ? currentModelData.engines : [];

  const handleTypeChange = (newType) => {
    setVehicleType(newType);
    const newVehicles = vehicles.filter(v => v.type === newType);
    if (newVehicles.length > 0) {
      const firstMake = newVehicles[0];
      setSelectedMake(firstMake.make);
      if (firstMake.models.length > 0) {
        setSelectedModel(firstMake.models[0].name);
        setSelectedYear(firstMake.models[0].years[firstMake.models[0].years.length - 1]);
        setSelectedEngine('');
      }
    }
  };

  const handleMakeChange = (make) => {
    setSelectedMake(make);
    const newMakeData = availableVehicles.find(v => v.make === make);
    if (newMakeData && newMakeData.models.length > 0) {
      const firstModel = newMakeData.models[0];
      setSelectedModel(firstModel.name);
      setSelectedYear(firstModel.years[firstModel.years.length - 1] || 2022);
      setSelectedEngine('');
    } else {
      setSelectedModel('');
      setSelectedYear(null);
      setSelectedEngine('');
    }
  };

  const handleModelChange = (modelName) => {
    setSelectedModel(modelName);
    const model = availableModels.find(m => m.name === modelName);
    if (model && model.years.length > 0) {
      setSelectedYear(model.years[model.years.length - 1]);
      setSelectedEngine('');
    }
  };

  // Repuestos que le sirven a este vehículo específico
  const matchedParts = parts.filter(part => {
    if (!part.compatibleVehicles || part.compatibleVehicles.length === 0) return false;
    return part.compatibleVehicles.some(cv => {
      const makeMatch = cv.make.toLowerCase() === selectedMake.toLowerCase();
      const modelMatch = !selectedModel || cv.model.toLowerCase() === selectedModel.toLowerCase();
      const yearMatch = !selectedYear || (selectedYear >= cv.yearStart && selectedYear <= cv.yearEnd);
      const engineMatch = !selectedEngine || !cv.engine || cv.engine.toLowerCase().includes(selectedEngine.toLowerCase());
      return makeMatch && modelMatch && yearMatch && engineMatch;
    });
  });

  const handleSendPosWithVehicle = () => {
    onSelectVehicleForPos({
      type: vehicleType,
      make: selectedMake,
      model: selectedModel,
      year: selectedYear,
      engine: selectedEngine
    });
    onNavigate('pos');
  };

  return (
    <div style={{ padding: 'clamp(12px, 2.5vw, 24px)', display: 'flex', flexDirection: 'column', gap: '16px' }} className="animate-fade-in">
      {/* Header Banner */}
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-xl)',
        padding: 'clamp(14px, 2.5vw, 22px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--primary-light)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.3rem',
            flexShrink: 0
          }}>
            {vehicleType === 'moto' ? '🏍️' : '🚗'}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: 'clamp(1.15rem, 3.5vw, 1.35rem)', fontWeight: 800 }}>
                Buscador de Compatibilidad
              </h2>
              <span className="badge badge-primary">
                {vehicleType === 'moto' ? 'MOTOS' : 'AUTOMOTRIZ'}
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {vehicleType === 'moto' 
                ? 'Kits de arrastre, cilindros, pastillas, CDI y repuestos para motos.'
                : 'Aceites minerales, semi-sintéticos, refrigerantes y repuestos para carros.'}
            </p>
          </div>
        </div>

        <button 
          className="btn btn-primary"
          onClick={handleSendPosWithVehicle}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 700, width: '100%', maxWidth: '380px', minHeight: '42px' }}
        >
          <ShoppingCart size={16} />
          <span>Abrir Mostrador con este {vehicleType === 'moto' ? 'Modelo' : 'Carro'}</span>
        </button>
      </div>

      {/* Switcher: Motos vs Carros */}
      <div style={{
        display: 'flex',
        gap: '8px',
        backgroundColor: 'var(--bg-card)',
        padding: '6px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
        width: '100%',
        flexWrap: 'wrap'
      }}>
        <button
          className={`btn ${vehicleType === 'moto' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => handleTypeChange('moto')}
          style={{ padding: '9px 16px', fontWeight: 700, gap: '6px', flex: '1 1 200px' }}
        >
          <span>🏍️ Repuestos de Motos (Bera, Empire, Toro, MD)</span>
        </button>
        <button
          className={`btn ${vehicleType === 'car' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => handleTypeChange('car')}
          style={{ padding: '9px 16px', fontWeight: 700, gap: '6px', flex: '1 1 200px' }}
        >
          <span>🚗 Aceites y Repuestos Carros (Toyota, Aveo, Ford)</span>
        </button>
      </div>

      {/* 4-Step Cascading Selector */}
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        padding: 'clamp(14px, 2.5vw, 20px)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(135px, 44vw, 200px), 1fr))',
        gap: '12px'
      }}>
        {/* Step 1: Marca */}
        <div className="input-group" style={{ marginBottom: 0 }}>
          <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ 
              width: '18px', 
              height: '18px', 
              borderRadius: '50%', 
              backgroundColor: 'var(--primary)', 
              color: '#fff', 
              fontSize: '0.7rem', 
              display: 'inline-flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>1</span>
            1. Marca {vehicleType === 'moto' ? 'de la Moto' : 'del Carro'}
          </label>
          <select
            className="select"
            value={selectedMake}
            onChange={(e) => handleMakeChange(e.target.value)}
            style={{ fontWeight: 700 }}
          >
            {availableVehicles.map(v => (
              <option key={v.make} value={v.make}>{v.make}</option>
            ))}
          </select>
        </div>

        {/* Step 2: Modelo */}
        <div className="input-group" style={{ marginBottom: 0 }}>
          <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ 
              width: '18px', 
              height: '18px', 
              borderRadius: '50%', 
              backgroundColor: 'var(--primary)', 
              color: '#fff', 
              fontSize: '0.7rem', 
              display: 'inline-flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>2</span>
            2. Modelo
          </label>
          <select
            className="select"
            value={selectedModel}
            onChange={(e) => handleModelChange(e.target.value)}
            style={{ fontWeight: 700 }}
          >
            {availableModels.map(m => (
              <option key={m.name} value={m.name}>{m.name}</option>
            ))}
          </select>
        </div>

        {/* Step 3: Año */}
        <div className="input-group" style={{ marginBottom: 0 }}>
          <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ 
              width: '18px', 
              height: '18px', 
              borderRadius: '50%', 
              backgroundColor: 'var(--primary)', 
              color: '#fff', 
              fontSize: '0.7rem', 
              display: 'inline-flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>3</span>
            3. Año
          </label>
          <select
            className="select"
            value={selectedYear || ''}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            style={{ fontWeight: 700 }}
          >
            {availableYears.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {/* Step 4: Motorización */}
        <div className="input-group" style={{ marginBottom: 0 }}>
          <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ 
              width: '18px', 
              height: '18px', 
              borderRadius: '50%', 
              backgroundColor: 'var(--primary)', 
              color: '#fff', 
              fontSize: '0.7rem', 
              display: 'inline-flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>4</span>
            4. Motor / Versión
          </label>
          <select
            className="select"
            value={selectedEngine}
            onChange={(e) => setSelectedEngine(e.target.value)}
          >
            <option value="">Cualquier Motorización</option>
            {availableEngines.map(eng => (
              <option key={eng} value={eng}>{eng}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Selected Vehicle Badge Summary */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 18px',
        backgroundColor: 'var(--primary-light)',
        border: '1px solid var(--border-accent)',
        borderRadius: 'var(--radius-md)',
        fontSize: '0.88rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-hover)', fontWeight: 700 }}>
          <CheckCircle2 size={18} />
          <span>
            {vehicleType === 'moto' ? '🏍️' : '🚗'} Mostrando artículos que le sirven a: <strong>{selectedMake} {selectedModel} ({selectedYear})</strong> {selectedEngine && `• ${selectedEngine}`}
          </span>
        </div>
        <div className="badge badge-primary mono" style={{ fontSize: '0.8rem' }}>
          {matchedParts.length} artículos disponibles
        </div>
      </div>

      {/* Results Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '16px'
      }}>
        {matchedParts.length === 0 ? (
          <div style={{
            gridColumn: '1 / -1',
            textAlign: 'center',
            padding: '60px 20px',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-muted)'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '8px' }}>
              {vehicleType === 'moto' ? '🏍️' : '🚗'}
            </div>
            <h3>No hay repuestos registrados para esta configuración</h3>
            <p style={{ fontSize: '0.85rem', maxWidth: '400px', margin: '6px auto 0' }}>
              Puedes agregar o editar cualquier repuesto en el inventario para asignarle compatibilidad con este modelo.
            </p>
          </div>
        ) : (
          matchedParts.map(part => {
            const isOut = part.stock === 0;
            const isLow = part.stock <= part.minStock && !isOut;

            return (
              <div 
                key={part.id} 
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '18px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="badge badge-primary mono" style={{ fontSize: '0.72rem' }}>
                        {part.brand}
                      </span>
                      {part.vehicleType === 'moto' ? (
                        <span style={{ fontSize: '0.75rem' }} title="Repuesto para Moto">🏍️ Moto</span>
                      ) : (
                        <span style={{ fontSize: '0.75rem' }} title="Línea Automotriz">🚗 Carro</span>
                      )}
                    </div>
                    <span className={`badge ${isOut ? 'badge-danger' : (isLow ? 'badge-warning' : 'badge-success')}`}>
                      {isOut ? 'AGOTADO' : `${part.stock} en stock`}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', margin: '6px 0 10px' }}>
                    {part.image && (
                      <div 
                        onClick={() => setPreviewPart(part)}
                        style={{
                          width: '54px',
                          height: '54px',
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
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '0.96rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '3px', lineHeight: 1.3 }}>
                        {part.name}
                      </h3>
                      <div className="mono" style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        OEM / Ref: <strong>{part.oemNumber}</strong> • SKU: {part.sku}
                      </div>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '10px', lineHeight: 1.35 }}>
                    {part.description}
                  </p>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.76rem',
                    color: 'var(--text-secondary)',
                    padding: '6px 10px',
                    backgroundColor: 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius-sm)'
                  }}>
                    <MapPin size={13} color="var(--primary)" />
                    <span>Ubicación: <strong>{part.location || 'Almacén Principal'}</strong></span>
                  </div>
                </div>

                {/* Footer with Price and POS action */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: '16px',
                  borderTop: '1px solid var(--border-color)',
                  paddingTop: '12px'
                }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>PRECIO DE VENTA</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                      {settings.currencySymbol}{part.salePrice.toFixed(2)}
                    </div>
                  </div>

                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      onSelectVehicleForPos({
                        type: vehicleType,
                        make: selectedMake,
                        model: selectedModel,
                        year: selectedYear,
                        engine: selectedEngine
                      });
                      onNavigate('pos');
                    }}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <ShoppingCart size={15} />
                    <span>Vender en Mostrador</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal de Previsualización de Foto Ampliada */}
      {previewPart && (
        <ImagePreviewModal
          part={previewPart}
          settings={settings}
          onClose={() => setPreviewPart(null)}
          onAddToCart={() => {
            onSelectVehicleForPos({
              type: vehicleType,
              make: selectedMake,
              model: selectedModel,
              year: selectedYear,
              engine: selectedEngine
            });
            onNavigate('pos');
          }}
        />
      )}
    </div>
  );
}
