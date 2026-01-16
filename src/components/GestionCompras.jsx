import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Line, ComposedChart, Cell, ReferenceLine
} from 'recharts';
import { 
  ShoppingCart, Truck, DollarSign, Package, Download, 
  Filter, Search, ArrowRight, CheckCircle, Clock, Zap
} from 'lucide-react';

const fmtUSD = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
const fmtNum = (n) => Math.round(n).toLocaleString();

const GestionCompras = ({ data }) => {
  const [selectedSku, setSelectedSku] = useState(data.find(s => s.status === 'Crítico') || data[0]);
  const [filterSupplier, setFilterSupplier] = useState('Todos');

  // --- LÓGICA DE FILTRADO Y REPOSICIÓN ---
  const purchaseList = useMemo(() => {
    return data
      .filter(s => s.stock <= s.rop) // Solo los que necesitan compra
      .filter(s => filterSupplier === 'Todos' || s.supplier === filterSupplier)
      .map(s => {
        const faltante = s.rop - s.stock;
        // Sugerencia: Cubrir el faltante respetando el MOQ
        const sugerencia = Math.ceil(Math.max(faltante, s.moq) / s.moq) * s.moq;
        return { ...s, sugerencia, totalCost: sugerencia * s.cost };
      });
  }, [data, filterSupplier]);

  const totalInvestment = purchaseList.reduce((acc, s) => acc + s.totalCost, 0);

  // Proyección de recuperación de stock para el gráfico
  const projectionData = useMemo(() => {
    if (!selectedSku) return [];
    const faltante = selectedSku.rop - selectedSku.stock;
    const sugerencia = Math.ceil(Math.max(faltante, selectedSku.moq) / selectedSku.moq) * selectedSku.moq;
    
    return [
      { name: 'Actual', stock: selectedSku.stock, rop: selectedSku.rop, ss: selectedSku.ss },
      { name: 'Lead Time', stock: selectedSku.stock * 0.8, rop: selectedSku.rop, ss: selectedSku.ss }, // Simula consumo en LT
      { name: 'Post-Arribo', stock: (selectedSku.stock * 0.8) + sugerencia, rop: selectedSku.rop, ss: selectedSku.ss }
    ];
  }, [selectedSku]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* 1. HEADER DE COMPRAS (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex justify-between items-start">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inversión Necesaria</p>
            <h3 className="text-3xl font-black text-indigo-600 mt-2">{fmtUSD(totalInvestment)}</h3>
            <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-tighter">Plan de compra vigente</p>
          </div>
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl"><DollarSign size={24}/></div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex justify-between items-start">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Órdenes Sugeridas</p>
            <h3 className="text-3xl font-black text-slate-800 mt-2">{purchaseList.length}</h3>
            <p className="text-[10px] text-emerald-500 font-black mt-2 uppercase tracking-tighter flex items-center gap-1">
              <CheckCircle size={12}/> Basado en ROP/MOQ
            </p>
          </div>
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl"><ShoppingCart size={24}/></div>
        </div>

        <div className="bg-slate-900 p-6 rounded-[2rem] shadow-xl flex flex-col justify-center">
          <button className="bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-lg shadow-indigo-900/40">
            <Download size={18} /> Exportar OC Masiva
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* 2. TABLA DE REQUERIMIENTOS */}
        <div className="lg:col-span-7 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col h-[700px]">
          <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest text-center flex-1">Plan Maestro de Reposición</h3>
            <select 
              className="text-[10px] font-black border-2 border-slate-200 rounded-lg px-2 py-1 outline-none"
              onChange={(e) => setFilterSupplier(e.target.value)}
            >
              <option value="Todos">Todos los Proveedores</option>
              {Array.from(new Set(data.map(s => s.supplier))).map(sup => (
                <option key={sup} value={sup}>{sup}</option>
              ))}
            </select>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                <tr>
                  <th className="px-6 py-4 text-left">SKU</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4">ROP</th>
                  <th className="px-6 py-4">MOQ</th>
                  <th className="px-6 py-4 text-indigo-600">Sugerencia</th>
                  <th className="px-6 py-4 text-right">Costo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-center">
                {purchaseList.map(sku => (
                  <tr 
                    key={sku.id} 
                    onClick={() => setSelectedSku(sku)}
                    className={`cursor-pointer transition-all hover:bg-slate-50 ${selectedSku?.id === sku.id ? 'bg-indigo-50 border-l-4 border-indigo-600' : ''}`}
                  >
                    <td className="px-6 py-4 text-left font-black text-slate-700">{sku.id}</td>
                    <td className="px-6 py-4 font-bold">{fmtNum(sku.stock)}</td>
                    <td className="px-6 py-4 text-slate-400">{fmtNum(sku.rop)}</td>
                    <td className="px-6 py-4 text-slate-400">{sku.moq}</td>
                    <td className="px-6 py-4">
                      <span className="bg-indigo-600 text-white px-3 py-1 rounded-lg font-black text-xs">
                        {fmtNum(sku.sugerencia)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-black text-slate-800">{fmtUSD(sku.totalCost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. DETALLE Y PROYECCIÓN DE RECUPERACIÓN */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
              <Truck className="text-indigo-600" /> Logística de Arribo: {selectedSku?.id}
            </h3>
            
            <div className="space-y-6">
              <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase">Proveedor</p>
                  <p className="font-black text-slate-800">{selectedSku?.supplier}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase">Lead Time</p>
                  <p className="font-black text-slate-800">{selectedSku?.leadTime} días</p>
                </div>
              </div>

              <div className="h-64 mt-8">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-4 text-center">Simulación de Recuperación de Cobertura</p>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={projectionData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                    <Tooltip />
                    <ReferenceLine y={selectedSku?.rop} stroke="#fbbf24" strokeDasharray="3 3" label={{ position: 'right', value: 'ROP', fontSize: 10, fill: '#fbbf24', fontWeight: 900 }} />
                    <ReferenceLine y={selectedSku?.ss} stroke="#f43f5e" strokeDasharray="3 3" label={{ position: 'right', value: 'SS', fontSize: 10, fill: '#f43f5e', fontWeight: 900 }} />
                    <Bar dataKey="stock" fill="#6366f1" radius={[8, 8, 0, 0]} barSize={40} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="bg-indigo-900 p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-10 text-white"><Zap size={80}/></div>
             <h4 className="text-indigo-300 font-black uppercase text-[10px] tracking-widest mb-4 flex items-center gap-2">
               Sugerencia del Motor DRP
             </h4>
             <p className="text-lg font-medium leading-relaxed italic">
               "Basado en un Lead Time de {selectedSku?.leadTime} días y un consumo diario de {fmtNum(selectedSku?.meanDemand)}, 
               deberías emitir la OC por <span className="text-white font-black underline">{fmtNum(selectedSku?.status === 'OK' ? 0 : (Math.ceil(Math.max(selectedSku?.rop - selectedSku?.stock, selectedSku?.moq) / selectedSku?.moq) * selectedSku?.moq))} unidades</span> hoy para evitar el quiebre de stock de seguridad."
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GestionCompras;