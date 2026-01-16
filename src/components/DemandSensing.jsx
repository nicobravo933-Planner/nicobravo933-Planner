import React, { useState, useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, ComposedChart, ReferenceLine
} from 'recharts';
import { TrendingUp, Cpu, Scale, Target, Search, Filter } from 'lucide-react';

const fmtPct = (n) => (n * 100).toFixed(1) + '%';

const DemandSensing = ({ data, selectedSku, setSelectedSku }) => {
  const [horizon, setHorizon] = useState(6); // Meses de proyección: 3, 6, 12

  // Filtramos la historia del SKU seleccionado según el horizonte elegido
  const chartData = useMemo(() => {
    if (!selectedSku) return [];
    return selectedSku.history.filter(h => h.month < (24 + horizon));
  }, [selectedSku, horizon]);

  if (!selectedSku) return <div className="p-10 text-slate-400">Selecciona un SKU para analizar...</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-700">
      
      {/* SIDEBAR DE SELECCIÓN (MATRIZ DE PRECISIÓN) */}
      <div className="lg:col-span-4 bg-white rounded-[2rem] shadow-sm border border-slate-100 flex flex-col h-[700px] overflow-hidden">
        <div className="p-6 bg-slate-50/50 border-b border-slate-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-black text-slate-800 uppercase text-[10px] tracking-widest">Matriz de Precisión</h3>
            <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-1 rounded font-black tracking-tighter">FVA ANALYTICS</span>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Buscar material..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-500 outline-none" 
            />
          </div>
        </div>
        
        <div className="overflow-y-auto flex-1 divide-y divide-slate-50">
          {data.map(sku => (
            <div 
              key={sku.id} 
              onClick={() => setSelectedSku(sku)}
              className={`p-5 cursor-pointer transition-all hover:bg-slate-50 group ${selectedSku.id === sku.id ? 'bg-indigo-50 border-l-8 border-indigo-600' : ''}`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-black text-slate-800 text-sm">{sku.id}</span>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{sku.category}</p>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] px-2 py-1 rounded font-black ${sku.fva > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                    FVA: {fmtPct(sku.fva)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ÁREAS DE GRÁFICOS Y MÉTRICAS */}
      <div className="lg:col-span-8 space-y-6">
        
        {/* GRÁFICO DE DEMANDA PROYECTADA */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
            <div>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">Evolución Predictiva</h3>
              <div className="flex gap-2 mt-3">
                {[3, 6, 12].map(m => (
                  <button 
                    key={m} 
                    onClick={() => setHorizon(m)}
                    className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${horizon === m ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                  >
                    +{m} Meses
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-slate-900" /> Real</span>
              <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-indigo-500" /> IA Forecast</span>
              <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-slate-300" /> Naive MA</span>
            </div>
          </div>
          
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700}} />
                <Tooltip contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}} />
                <ReferenceLine x="M-1" stroke="#f43f5e" strokeDasharray="5 5" label={{position: 'top', value: 'HOY', fontSize: 10, fontWeight: 900, fill: '#f43f5e'}} />
                <Area type="monotone" dataKey="real" fill="#4f46e5" fillOpacity={0.05} stroke="#1e293b" strokeWidth={3} name="Real" />
                <Line type="monotone" dataKey="ml_fcst" stroke="#6366f1" strokeWidth={3} dot={{r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff'}} name="ML Forecast" />
                <Line type="monotone" dataKey="naive_fcst" stroke="#cbd5e1" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Naive MA" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* MÉTRICAS DE VALOR AGREGADO Y SESGO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="font-black text-slate-400 uppercase text-[10px] tracking-widest">Accuracy FVA</h4>
                <p className="text-4xl font-black text-slate-800 mt-2">{fmtPct(selectedSku.fva)}</p>
              </div>
              <Cpu size={24} className="text-indigo-500" />
            </div>
            <p className="text-xs text-slate-500 font-medium italic border-t border-slate-50 pt-4">
              {selectedSku.fva > 0 
                ? "La IA está optimizando el pronóstico reduciendo el error significativamente." 
                : "Se requiere revisión: El modelo Naive es más estable actualmente para este SKU."}
            </p>
          </div>

          <div className="bg-slate-900 p-8 rounded-[2rem] text-white shadow-xl">
            <h4 className="font-black text-indigo-400 uppercase text-[10px] tracking-widest mb-6 flex items-center gap-2">
              <Scale size={16} /> Diagnóstico de Sesgo (Bias)
            </h4>
            <div className="h-2 bg-slate-800 rounded-full relative overflow-hidden">
              <div className="absolute left-1/2 w-0.5 h-full bg-slate-600 z-10" />
              <div 
                className={`absolute h-full transition-all duration-1000 ${selectedSku.bias > 0 ? 'bg-indigo-500 left-1/2' : 'bg-orange-500 right-1/2'}`}
                style={{ width: `${Math.min(Math.abs(selectedSku.bias) * 100, 50)}%` }}
              />
            </div>
            <div className="flex justify-between text-[9px] font-black text-slate-500 uppercase mt-2">
              <span>Sub-estimado</span>
              <span>{fmtPct(selectedSku.bias)}</span>
              <span>Sobre-estimado</span>
            </div>
            <p className="text-xs font-medium mt-6 leading-relaxed opacity-80 italic">
              {selectedSku.bias > 0.1 
                ? "Sesgo positivo: Riesgo de sobre-stock y capital inmovilizado." 
                : selectedSku.bias < -0.1 
                  ? "Sesgo negativo: Riesgo alto de quiebre de stock." 
                  : "Modelo equilibrado: Sin desviaciones sistemáticas detectadas."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemandSensing;