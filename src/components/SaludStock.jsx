import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Cell, PieChart, Pie
} from 'recharts';
import { 
  ShieldCheck, AlertTriangle, Hourglass, Package, 
  Search, Filter, ChevronRight, Info, Activity, Calendar
} from 'lucide-react';

const fmtUSD = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
const fmtNum = (n) => Math.round(n).toLocaleString();

const SaludStock = ({ data }) => {
  const [selectedSku, setSelectedSku] = useState(data[0]);
  const [filter, setFilter] = useState('Todos');

  // --- LÓGICA DE CÁLCULO ---
  const stats = useMemo(() => {
    const totalVal = data.reduce((acc, s) => acc + s.value, 0);
    const riskVal = data.reduce((acc, s) => acc + s.sslValue, 0);
    const skusConRiesgo = data.filter(s => s.sslQty > 0).length;
    
    const chartData = [
      { name: 'Saludable', valor: totalVal - riskVal, color: '#10b981' },
      { name: 'Riesgo Merma', valor: riskVal, color: '#f43f5e' }
    ];

    return { totalVal, riskVal, skusConRiesgo, chartData };
  }, [data]);

  const filteredData = data.filter(s => filter === 'Todos' || s.status === filter);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* 1. RESUMEN DE SALUD (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex justify-between items-start">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor Total Inventario</p>
            <h3 className="text-3xl font-black text-slate-800 mt-2">{fmtUSD(stats.totalVal)}</h3>
            <p className="text-[10px] text-emerald-500 font-black mt-2 uppercase tracking-tighter flex items-center gap-1">
              <ShieldCheck size={12}/> Activos Protegidos
            </p>
          </div>
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl"><Package size={24}/></div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex justify-between items-start">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inversión en Riesgo (SSL)</p>
            <h3 className="text-3xl font-black text-rose-600 mt-2">{fmtUSD(stats.riskVal)}</h3>
            <p className="text-[10px] text-rose-400 font-black mt-2 uppercase tracking-tighter italic">
              Riesgo por vencimiento próximo
            </p>
          </div>
          <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl"><Hourglass size={24}/></div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex justify-between items-start">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SKUs con Alerta FEFO</p>
            <h3 className="text-3xl font-black text-amber-500 mt-2">{stats.skusConRiesgo}</h3>
            <p className="text-[10px] text-slate-400 font-black mt-2 uppercase tracking-tighter">
              Requieren rotación prioritaria
            </p>
          </div>
          <div className="p-4 bg-amber-50 text-amber-500 rounded-2xl"><AlertTriangle size={24}/></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* 2. LISTADO DE SKUs Y ESTADO */}
        <div className="lg:col-span-5 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col h-[750px] overflow-hidden">
          <div className="p-6 bg-slate-50/50 border-b border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">Estado de Vida Útil</h3>
              <select 
                className="text-[10px] font-black border-2 border-slate-200 rounded-lg px-2 py-1 outline-none focus:border-indigo-500"
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="Todos">Todos</option>
                <option value="OK">Saludables</option>
                <option value="Crítico">Críticos</option>
                <option value="Exceso">Exceso</option>
              </select>
            </div>
          </div>
          <div className="overflow-y-auto flex-1 divide-y divide-slate-50">
            {filteredData.map(sku => (
              <div 
                key={sku.id} 
                onClick={() => setSelectedSku(sku)}
                className={`p-5 cursor-pointer transition-all hover:bg-slate-50 ${selectedSku.id === sku.id ? 'bg-indigo-50 border-l-8 border-indigo-600' : ''}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-black text-slate-800 text-sm">{sku.id}</span>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{sku.category}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-[10px] font-black px-2 py-1 rounded ${
                      sku.sslQty > 0 ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'
                    }`}>
                      {sku.sslQty > 0 ? `RIESGO: ${fmtNum(sku.sslQty)}` : 'STOCK SEGURO'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. DETALLE DE LOTES (TRAZABILIDAD) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-2">
              <Activity className="text-indigo-600" /> Trazabilidad de Lotes: {selectedSku.id}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Útil', value: selectedSku.stock - selectedSku.sslQty },
                        { name: 'Riesgo', value: selectedSku.sslQty }
                      ]}
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      <Cell fill="#10b981" />
                      <Cell fill="#f43f5e" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col justify-center space-y-4">
                <div className="p-4 bg-slate-50 rounded-2xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Costo en Riesgo</p>
                  <p className="text-2xl font-black text-rose-600">{fmtUSD(selectedSku.sslValue)}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Promedio Días Vida</p>
                  <p className="text-2xl font-black text-slate-800">
                    {Math.round(selectedSku.lotes.reduce((acc, l) => acc + l.diasRestantes, 0) / selectedSku.lotes.length)} días
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Desglose de Lotes (FEFO)</h4>
              {selectedSku.lotes.map((lote, i) => (
                <div key={i} className={`p-4 rounded-2xl border flex justify-between items-center ${
                  lote.diasRestantes < 60 ? 'bg-rose-50 border-rose-100' : 'bg-white border-slate-100 shadow-sm'
                }`}>
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${lote.diasRestantes < 60 ? 'bg-rose-200 text-rose-700' : 'bg-slate-100 text-slate-400'}`}>
                      <Calendar size={18} />
                    </div>
                    <div>
                      <p className="font-black text-slate-800 text-sm">{lote.id}</p>
                      <p className="text-[10px] font-bold text-slate-400">Vence: {lote.fechaVencimiento.toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-slate-800 text-sm">{fmtNum(lote.cantidad)} unid.</p>
                    <p className={`text-[10px] font-black uppercase ${lote.diasRestantes < 60 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {lote.diasRestantes} días restantes
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-10 text-indigo-400"><Info size={80}/></div>
             <h4 className="text-indigo-400 font-black uppercase text-[10px] tracking-widest mb-4 flex items-center gap-2">
               <Zap size={16}/> Estrategia FEFO Nexus
             </h4>
             <p className="text-lg font-medium leading-relaxed italic relative z-10">
               {selectedSku.sslQty > 0 
                 ? `Planner, el lote con mayor riesgo vence en ${selectedSku.lotes[0].diasRestantes} días. Se recomienda forzar la salida de ${fmtNum(selectedSku.sslQty)} unidades mediante promoción o canal institucional.` 
                 : "El inventario de este SKU es joven y saludable. Se puede mantener la política de despacho estándar."}
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaludStock;