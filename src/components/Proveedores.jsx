import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Line, LineChart, Cell, ScatterChart, Scatter, ZAxis, Legend
} from 'recharts';
import { 
  Factory, ShieldAlert, Award, TrendingUp, Scale, 
  Truck, DollarSign, Activity, AlertCircle, ChevronRight
} from 'lucide-react';

const fmtUSD = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
const fmtPct = (n) => (n * 100).toFixed(1) + '%';
const fmtNum = (n) => Math.round(n).toLocaleString();

const Proveedores = ({ data }) => {
  // --- LÓGICA DE AGRUPACIÓN POR PROVEEDOR ---
  const supplierStats = useMemo(() => {
    const map = {};
    data.forEach(sku => {
      if (!map[sku.supplier]) {
        map[sku.supplier] = {
          name: sku.supplier,
          items: 0,
          totalSpend: 0,
          avgWape: 0,
          criticalItems: 0,
          avgLeadTime: sku.leadTime,
          reliability: sku.supplierScore
        };
      }
      map[sku.supplier].items += 1;
      map[sku.supplier].totalSpend += sku.annualValue;
      map[sku.supplier].avgWape += sku.wapeML;
      if (sku.status === 'Crítico') map[sku.supplier].criticalItems += 1;
    });

    return Object.values(map).map(s => ({
      ...s,
      avgWape: s.avgWape / s.items,
      precision: 1 - (s.avgWape / s.items),
      riskLevel: s.criticalItems / s.items > 0.2 ? 'Alto' : 'Bajo'
    }));
  }, [data]);

  // Datos para el gráfico de dispersión (Gasto vs Exactitud)
  const scatterData = supplierStats.map(s => ({
    name: s.name,
    x: s.totalSpend,
    y: s.precision * 100,
    z: s.items
  }));

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* 1. ECO-SISTEMA DE PROVEEDORES (Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {supplierStats.map((sup) => (
          <div key={sup.name} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 transition-all hover:shadow-md">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl ${sup.precision > 0.85 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                <Factory size={24} />
              </div>
              <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase ${
                sup.reliability > 0.9 ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'
              }`}>
                Score: {fmtPct(sup.reliability)}
              </span>
            </div>
            <h4 className="font-black text-slate-800 text-lg">{sup.name}</h4>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-400">Gasto Anual</span>
                <span className="text-slate-700">{fmtUSD(sup.totalSpend)}</span>
              </div>
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-400">Exactitud Red</span>
                <span className={sup.precision > 0.85 ? 'text-emerald-600' : 'text-amber-600'}>
                  {fmtPct(sup.precision)}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-50 flex justify-between items-center text-[10px] font-black uppercase">
                <span className="text-slate-400">{sup.items} Materiales</span>
                {sup.criticalItems > 0 && <span className="text-rose-500">{sup.criticalItems} en quiebre</span>}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* 2. MATRIZ DE PERFORMANCE (Scatter Chart) */}
        <div className="lg:col-span-8 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-xl font-black text-slate-800">Matriz de Performance Técnica</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Inversión vs Exactitud de Pronóstico</p>
            </div>
            <div className="bg-slate-50 p-2 rounded-lg"><Scale size={20} className="text-indigo-600"/></div>
          </div>
          
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  type="number" 
                  dataKey="x" 
                  name="Inversión" 
                  axisLine={false} 
                  tickLine={false} 
                  tickFormatter={(v) => `$${v/1000}k`}
                  tick={{fontSize: 10, fontWeight: 700}}
                />
                <YAxis 
                  type="number" 
                  dataKey="y" 
                  name="Precisión" 
                  unit="%" 
                  axisLine={false} 
                  tickLine={false} 
                  domain={[60, 100]}
                  tick={{fontSize: 10, fontWeight: 700}}
                />
                <ZAxis type="number" dataKey="z" range={[100, 1000]} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter name="Proveedores" data={scatterData}>
                  {scatterData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#6366f1', '#10b981', '#f59e0b', '#f43f5e'][index % 4]} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex justify-center gap-6 text-[10px] font-black text-slate-400 uppercase tracking-tighter">
            <span>Eje X: Volumen de Compra</span>
            <span>Eje Y: Calidad del Pronóstico (1-WAPE)</span>
          </div>
        </div>

        {/* 3. INSIGHTS DE NEGOCIACIÓN */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl h-full flex flex-col justify-between">
            <div>
              <h4 className="text-indigo-400 font-black uppercase text-[10px] tracking-widest mb-6 flex items-center gap-2">
                <Award size={16}/> Strategic Insights
              </h4>
              <div className="space-y-6">
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-2">Socio Más Confiable</p>
                  <p className="text-lg font-black">{supplierStats.sort((a,b) => b.precision - a.precision)[0]?.name}</p>
                  <p className="text-xs text-emerald-400 font-bold mt-1">98% OTIF Proyectado</p>
                </div>
                <div className="pt-6 border-t border-slate-800">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-2">Riesgo de Suministro</p>
                  <p className="text-lg font-black text-rose-400">
                    {supplierStats.find(s => s.riskLevel === 'Alto')?.name || 'Bajo Control'}
                  </p>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed italic">
                    "Este proveedor concentra un alto volumen de SKUs en estado Crítico. Se recomienda revisar el contrato de Lead Time."
                  </p>
                </div>
              </div>
            </div>
            
            <button className="mt-8 w-full bg-white text-slate-900 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-50 transition-all">
              Auditoría Completa <ChevronRight size={16}/>
            </button>
          </div>
        </div>
      </div>

      {/* 4. TABLA DETALLADA DE CUMPLIMIENTO */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 bg-slate-50 border-b border-slate-100">
          <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">Ranking de Eficiencia por Proveedor</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
              <tr>
                <th className="px-8 py-4 text-left">Socio Logístico</th>
                <th className="px-8 py-4">Exactitud Media</th>
                <th className="px-8 py-4">Lead Time Promedio</th>
                <th className="px-8 py-4">Variabilidad</th>
                <th className="px-8 py-4 text-right">Gasto Gestionado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-center font-bold">
              {supplierStats.sort((a,b) => b.totalSpend - a.totalSpend).map(sup => (
                <tr key={sup.name} className="hover:bg-slate-50 transition-colors">
                  <td className="px-8 py-5 text-left font-black text-slate-800">{sup.name}</td>
                  <td className="px-8 py-5">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-indigo-600 h-full" style={{ width: `${sup.precision * 100}%` }} />
                      </div>
                      <span className="text-xs">{fmtPct(sup.precision)}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-slate-500">{sup.avgLeadTime} días</td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-lg text-[10px] uppercase ${
                      sup.reliability > 0.9 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {sup.reliability > 0.9 ? 'Estable' : 'Volátil'}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right font-black text-slate-900">{fmtUSD(sup.totalSpend)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Proveedores;