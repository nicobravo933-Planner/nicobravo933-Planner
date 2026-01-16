import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Cell, ScatterChart, Scatter, ZAxis, Legend
} from 'recharts';
import { 
  Layers, Target, Activity, DollarSign, Info, ArrowRight,
  ChevronRight, Filter, TrendingUp, Box
} from 'lucide-react';

const fmtUSD = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
const fmtPct = (n) => (n * 100).toFixed(1) + '%';
const fmtNum = (n) => Math.round(n).toLocaleString();

const Segmentacion = ({ data }) => {
  const [filter, setFilter] = useState('A');

  // --- LÓGICA DE LA MATRIZ 9-BOX ---
  const matrix = useMemo(() => {
    const boxes = ['A', 'B', 'C'].map(abc => 
      ['X', 'Y', 'Z'].map(xyz => {
        const items = data.filter(d => d.abc === abc && d.xyz === xyz);
        return {
          id: `${abc}${xyz}`,
          count: items.length,
          value: items.reduce((acc, curr) => acc + curr.annualValue, 0),
          label: `${abc}${xyz}`
        };
      })
    );
    return boxes.flat();
  }, [data]);

  const filteredItems = data.filter(d => d.abc === filter);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* 1. LA MATRIZ ESTRATÉGICA (9-BOX) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        <div className="lg:col-span-7 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-xl font-black text-slate-800">Matriz de Estrategia ABC/XYZ</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Clasificación por Valor y Predictibilidad</p>
            </div>
            <Layers className="text-indigo-600" size={24} />
          </div>

          <div className="grid grid-cols-3 gap-3">
            {matrix.map((cell) => (
              <div 
                key={cell.id} 
                className={`aspect-square rounded-3xl p-6 flex flex-col justify-between transition-all hover:scale-[1.02] border-2 cursor-pointer ${
                  cell.id.startsWith('A') ? 'bg-indigo-50 border-indigo-100' : 
                  cell.id.startsWith('B') ? 'bg-slate-50 border-slate-100' : 'bg-white border-slate-50'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className={`text-2xl font-black ${cell.id.startsWith('A') ? 'text-indigo-600' : 'text-slate-400'}`}>
                    {cell.id}
                  </span>
                  <span className="text-[10px] font-black text-slate-400">{cell.count} SKUs</span>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Valor Anual</p>
                  <p className="font-black text-slate-800 text-sm">{fmtUSD(cell.value)}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] border-t pt-4">
             <span>Eje X: Variabilidad (XYZ)</span>
             <span>Eje Y: Importancia Económica (ABC)</span>
          </div>
        </div>

        {/* 2. DIAGNÓSTICO DE SEGMENTO */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl h-full flex flex-col justify-between">
            <div>
              <h4 className="text-indigo-400 font-black uppercase text-[10px] tracking-widest mb-6 flex items-center gap-2">
                <Target size={16}/> Directriz Estratégica
              </h4>
              <div className="space-y-6">
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-2">Clase AX (Críticos)</p>
                  <p className="text-lg font-medium italic">"Son el corazón de tu negocio. Alta inversión y demanda estable. Mantener niveles de servicio al 99% y revisión de stock semanal."</p>
                </div>
                <div className="pt-6 border-t border-slate-800">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-2">Clase CZ (Baja Rotación)</p>
                  <p className="text-lg font-medium italic">"Riesgo de obsolescencia alto. Considerar modelo bajo pedido (Make-to-Order) para evitar capital atrapado."</p>
                </div>
              </div>
            </div>
            <div className="mt-8 p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
               <p className="text-[10px] font-black text-indigo-400 uppercase mb-2">KPI de Concentración</p>
               <p className="text-sm font-medium">El <span className="text-white font-black">20%</span> de tus SKUs (Clase A) representan el <span className="text-white font-black">80%</span> del valor total.</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. LISTADO DETALLADO POR CLASE */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">Desglose de Materiales por Clase</h3>
          <div className="flex gap-2">
            {['A', 'B', 'C'].map(cls => (
              <button 
                key={cls}
                onClick={() => setFilter(cls)}
                className={`w-10 h-10 rounded-xl font-black text-xs transition-all ${
                  filter === cls ? 'bg-indigo-600 text-white' : 'bg-white text-slate-400 border border-slate-200'
                }`}
              >
                {cls}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
              <tr>
                <th className="px-8 py-5 text-left">Material</th>
                <th className="px-8 py-5">CV (Variabilidad)</th>
                <th className="px-8 py-5">Clasificación</th>
                <th className="px-8 py-5">Venta Anual</th>
                <th className="px-8 py-5 text-right">Costo Unitario</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-center font-bold">
              {filteredItems.slice(0, 15).map(sku => (
                <tr key={sku.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-8 py-5 text-left font-black text-slate-800">{sku.id}</td>
                  <td className="px-8 py-5 text-slate-500">{sku.cv.toFixed(2)}</td>
                  <td className="px-8 py-5">
                    <span className="bg-slate-100 px-3 py-1 rounded-lg text-slate-700">
                      {sku.abc}{sku.xyz}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-indigo-600">{fmtUSD(sku.annualValue)}</td>
                  <td className="px-8 py-5 text-right font-black text-slate-900">{fmtUSD(sku.cost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Segmentacion;