import React, { useState, useMemo } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { 
  LayoutDashboard, TrendingUp, Package, ShoppingCart, 
  Users, Layers, Bell, Menu, X, Sparkles
} from 'lucide-react';

// Importación de componentes
import { generateMasterData } from './data/engine';
import VistaGeneral from './components/VistaGeneral';
import DemandSensing from './components/DemandSensing';
import SaludStock from './components/SaludStock';
import GestionCompras from './components/GestionCompras';
import Proveedores from './components/Proveedores';
import Segmentacion from './components/Segmentacion';
import Novedades from './components/Novedades';

const App = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedSku, setSelectedSku] = useState(null);

  // Generación de datos maestros
  const masterData = useMemo(() => {
    const raw = generateMasterData();
    
    // Enriquecimiento con datos adicionales necesarios
    return raw.map(sku => {
      // Cálculo de FVA y Bias para Demand Sensing
      const lastReal = sku.history.slice(-12);
      const naiveError = lastReal.reduce((acc, h, i) => {
        if (i === 0) return acc;
        return acc + Math.abs(h.real - lastReal[i-1].real);
      }, 0) / 11;
      
      const mlError = lastReal.reduce((acc, h) => acc + Math.abs(h.real - h.forecast), 0) / 12;
      const fva = Math.max(0, (naiveError - mlError) / naiveError);
      const bias = (lastReal.reduce((acc, h) => acc + (h.forecast - h.real), 0) / 12) / sku.meanDemand;

      // Enriquecimiento de historia para gráficos
      const enrichedHistory = sku.history.map((h, i) => ({
        ...h,
        label: i < 24 ? `M-${24-i}` : `F+${i-23}`,
        ml_fcst: i >= 24 ? h.forecast : null,
        naive_fcst: i >= 24 && i > 0 ? sku.history[i-1].real : null
      }));

      // MOQ simulado
      const moq = Math.ceil(sku.meanDemand * 0.5 / 10) * 10;

      // Lotes con fechas de vencimiento
      const lotesConFechas = sku.lotes.map(l => ({
        ...l,
        fechaVencimiento: new Date(Date.now() + l.diasRestantes * 24 * 60 * 60 * 1000)
      }));

      return {
        ...sku,
        fva,
        bias,
        history: enrichedHistory,
        moq,
        lotes: lotesConFechas
      };
    });
  }, []);

  // Selección automática del primer SKU
  React.useEffect(() => {
    if (!selectedSku && masterData.length > 0) {
      setSelectedSku(masterData[0]);
    }
  }, [masterData, selectedSku]);

  const navigation = [
    { id: 'overview', name: 'Vista General', icon: LayoutDashboard },
    { id: 'demand', name: 'Demand Sensing', icon: TrendingUp },
    { id: 'inventory', name: 'Salud de Stock', icon: Package },
    { id: 'purchasing', name: 'Gestión de Compras', icon: ShoppingCart },
    { id: 'suppliers', name: 'Proveedores', icon: Users },
    { id: 'segmentation', name: 'Segmentación', icon: Layers },
    { id: 'news', name: 'Novedades', icon: Bell },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <VistaGeneral data={masterData} setTab={setActiveTab} />;
      case 'demand':
        return <DemandSensing data={masterData} selectedSku={selectedSku} setSelectedSku={setSelectedSku} />;
      case 'inventory':
        return <SaludStock data={masterData} />;
      case 'purchasing':
        return <GestionCompras data={masterData} />;
      case 'suppliers':
        return <Proveedores data={masterData} />;
      case 'segmentation':
        return <Segmentacion data={masterData} />;
      case 'news':
        return <Novedades data={masterData} setTab={setActiveTab} />;
      default:
        return <VistaGeneral data={masterData} setTab={setActiveTab} />;
    }
  };

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
        
        {/* SIDEBAR */}
        <aside className={`fixed top-0 left-0 h-full w-72 bg-slate-900 shadow-2xl z-50 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}>
          
          <div className="p-8 border-b border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-600 rounded-xl">
                  <Sparkles className="text-white" size={24} />
                </div>
                <div>
                  <h1 className="text-white font-black text-xl tracking-tight">NEXUS TOWER</h1>
                  <p className="text-indigo-400 text-[10px] font-bold uppercase tracking-widest">AI Planning Core</p>
                </div>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white">
                <X size={20} />
              </button>
            </div>
          </div>

          <nav className="p-6 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-sm transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon size={20} />
                  <span className="tracking-tight">{item.name}</span>
                </button>
              );
            })}
          </nav>

          <div className="absolute bottom-0 w-full p-6 border-t border-slate-800">
            <div className="bg-slate-800/50 rounded-2xl p-4">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Sistema Activo</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-white text-xs font-bold">80 SKUs Monitoreados</span>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <div className="lg:ml-72 min-h-screen">
          
          {/* HEADER */}
          <header className="bg-white/80 backdrop-blur-sm border-b border-slate-100 sticky top-0 z-40">
            <div className="px-8 py-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button onClick={() => setSidebarOpen(true)} className="lg:hidden">
                  <Menu size={24} />
                </button>
                <div>
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                    {navigation.find(n => n.id === activeTab)?.name}
                  </h2>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
                    Real-time Analytics Dashboard
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-full">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-xs font-bold text-slate-600">Sistema Sincronizado</span>
                </div>
              </div>
            </div>
          </header>

          {/* CONTENT AREA */}
          <main className="p-8 lg:p-12">
            {renderContent()}
          </main>
        </div>

        {/* MOBILE OVERLAY */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>
    </Router>
  );
};

export default App;
