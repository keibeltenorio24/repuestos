import React, { useState, useEffect } from 'react';
import { storage } from './services/storage';
import { partsAPI, salesAPI, settingsAPI } from './services/api';

import Sidebar from './components/Sidebar';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import ReceiptModal from './components/ReceiptModal';
import StockAlertModal from './components/StockAlertModal';

import DashboardView from './views/DashboardView';
import PosView from './views/PosView';
import InventoryView from './views/InventoryView';
import SalesHistoryView from './views/SalesHistoryView';
import SettingsView from './views/SettingsView';

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [parts, setParts] = useState([]);
  const [sales, setSales] = useState([]);
  const [settings, setSettings] = useState(storage.getSettings());
  const [theme, setTheme] = useState(storage.getTheme());
  const [collapsedSidebar, setCollapsedSidebar] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Modales globales
  const [activeReceiptSale, setActiveReceiptSale] = useState(null);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);

  // Carga inicial de datos
  const loadData = () => {
    storage.init();
    setParts(storage.getParts());
    setSales(storage.getSales());
    setSettings(storage.getSettings());
  };

  useEffect(() => {
    loadData();
  }, []);

  // Aplicar tema en el elemento HTML
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    storage.setTheme(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Acciones de Repuestos
  const handleCreatePart = async (partData) => {
    const created = await partsAPI.create(partData);
    setParts(storage.getParts());
    return created;
  };

  const handleUpdatePart = async (id, partData) => {
    const updated = await partsAPI.update(id, partData);
    setParts(storage.getParts());
    return updated;
  };

  const handleDeletePart = async (id) => {
    await partsAPI.delete(id);
    setParts(storage.getParts());
  };

  const handleAdjustStock = async (id, qty, reason) => {
    await partsAPI.adjustStock(id, qty, reason);
    setParts(storage.getParts());
  };

  // Acciones de Ventas
  const handleCompleteSale = async (saleData) => {
    const newSale = await salesAPI.create(saleData);
    setParts(storage.getParts());
    setSales(storage.getSales());
    setActiveReceiptSale(newSale); // Abre comprobante imprimible inmediatamente
  };

  const handleConvertQuote = async (quoteId) => {
    const converted = await salesAPI.convertQuoteToSale(quoteId);
    setParts(storage.getParts());
    setSales(storage.getSales());
    setActiveReceiptSale(converted);
  };

  const handleClearSales = async () => {
    await salesAPI.clearAll();
    setSales([]);
  };

  const handleLoadDemoParts = () => {
    storage.loadDemoData();
    setParts(storage.getParts());
  };

  const handleClearAllData = () => {
    storage.clearAllData();
    setParts([]);
    setSales([]);
  };

  // Acciones de Configuración
  const handleUpdateSettings = async (newSettings) => {
    await settingsAPI.update(newSettings);
    setSettings(newSettings);
  };

  const lowStockCount = parts.filter(p => p.stock <= p.minStock).length;

  return (
    <div className="app-shell">
      {/* Sidebar de navegación (Desktop + Mobile Drawer) */}
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        settings={settings}
        parts={parts}
        collapsed={collapsedSidebar}
        setCollapsed={setCollapsedSidebar}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Container */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0, overflow: 'hidden' }}>
        {/* Header superior */}
        <Header
          settings={settings}
          theme={theme}
          toggleTheme={toggleTheme}
          parts={parts}
          onOpenAlerts={() => setIsAlertModalOpen(true)}
          currentView={currentView}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />

        {/* Dynamic Views */}
        <main className="app-main-content">
          {currentView === 'dashboard' && (
            <DashboardView
              parts={parts}
              sales={sales}
              settings={settings}
              onNavigate={(view) => setCurrentView(view)}
              onOpenReceipt={(sale) => setActiveReceiptSale(sale)}
              onAdjustStock={handleAdjustStock}
            />
          )}

          {currentView === 'pos' && (
            <PosView
              parts={parts}
              settings={settings}
              onCompleteSale={handleCompleteSale}
              onNavigate={(view) => setCurrentView(view)}
              onLoadDemoParts={handleLoadDemoParts}
            />
          )}

          {currentView === 'inventory' && (
            <InventoryView
              parts={parts}
              settings={settings}
              onCreatePart={handleCreatePart}
              onUpdatePart={handleUpdatePart}
              onDeletePart={handleDeletePart}
              onAdjustStock={handleAdjustStock}
              onLoadDemoParts={handleLoadDemoParts}
            />
          )}

          {currentView === 'sales' && (
            <SalesHistoryView
              sales={sales}
              settings={settings}
              onOpenReceipt={(sale) => setActiveReceiptSale(sale)}
              onConvertQuote={handleConvertQuote}
              onNavigate={(view) => setCurrentView(view)}
            />
          )}

          {currentView === 'settings' && (
            <SettingsView
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              onReloadAll={loadData}
              onClearSales={handleClearSales}
              onClearAllData={handleClearAllData}
              onLoadDemoParts={handleLoadDemoParts}
            />
          )}
        </main>

        {/* Mobile Bottom Navigation Bar */}
        <BottomNav
          currentView={currentView}
          setCurrentView={setCurrentView}
          onOpenMenu={() => setIsMobileMenuOpen(true)}
          lowStockCount={lowStockCount}
        />
      </div>

      {/* Modal de Comprobante / Ticket / Proforma Imprimible */}
      {activeReceiptSale && (
        <ReceiptModal
          sale={activeReceiptSale}
          settings={settings}
          onClose={() => setActiveReceiptSale(null)}
        />
      )}

      {/* Modal de Alertas de Stock Crítico */}
      {isAlertModalOpen && (
        <StockAlertModal
          parts={parts}
          settings={settings}
          onAdjustStock={handleAdjustStock}
          onClose={() => setIsAlertModalOpen(false)}
        />
      )}
    </div>
  );
}
