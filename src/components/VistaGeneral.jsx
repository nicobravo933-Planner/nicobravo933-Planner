import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Line, ComposedChart, PieChart, Pie, Cell 
} from 'recharts';
import { DollarSign, Target, AlertTriangle, BarChart3, Zap, ArrowRight } from 'lucide-react';

const fmtUSD = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
const fmtPct = (n) => (n * 100).toFixed(1) + '%';

const KpiCard = ({ title, value, sub, trend, icon: Icon, colorClass }) => (
  <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex justify-between items-start transition-all hover:shadow-md">
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
      <h3 className="text-3xl font-black text-slate-800 mt-2">{value}</h3>
      <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase">{sub}</p>
    </div>
    <div className={`p-4 rounded-2xl ${colorClass}`}><Icon size={24} /></div>
  </div>
);

const VistaGeneral = ({ data, setTab }) => {
  const stats = useMemo(() => {
    const totalInv = data.reduce((a, b) => a + b.value, 0);
    const avgWape = data.reduce((a, b) => a + b.wapeML, 0) / data.length;
    const stockouts = data.filter(s => s.status === 'Crítico').length;
    
    const catData = ["Alimentos", "Farmacia", "Químicos", "Bebidas", "Industrial"].map(c => ({
      name: c,
      value: data.filter(s => s.category === c).reduce((a, b) => a + b.value, 0),
      accuracy: 1 - (data.filter(s => s.category === c).reduce((a, b) => a + b.wapeML, 0) / data.filter(s => s.category === c).length)
    }));
    return { totalInv, avgWape, stockouts, catData };
  }, [data]);

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <KpiCard title="Inversión en Stock" value={fmtUSD(stats.totalInv)} sub="Capital Inmovilizado" trend={2} icon={DollarSign} colorClass="bg-indigo-50 text-indigo-600" />
        <KpiCard title="Accuracy Global" value={fmtPct(1 - stats.avgWape)} sub="WAPE Medio" trend={-1} icon={Target} colorClass="bg-emerald-50 text-emerald-600" />
        <KpiCard title="SKUs Críticos" value={stats.stockouts} sub="Bajo stock seguridad" trend={5} icon={AlertTriangle} colorClass="bg-rose-50 text-rose-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest mb-10 flex items-center gap-2"><BarChart3 size={16} className="text-indigo-600"/> Inversión vs Accuracy por Categoría</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={stats.catData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700}} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fontSize: 10}} tickFormatter={(v) => `$${v/1000}k`} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fontSize: 10}} domain={[0, 1]} />
                <Tooltip />
                <Bar yAxisId="left" dataKey="value" fill="#6366f1" radius={[8, 8, 0, 0]} barSize={40} />
                <Line yAxisId="right" type="monotone" dataKey="accuracy" stroke="#10b981" strokeWidth={4} dot={{r: 6, fill: '#10b981', stroke: '#fff'}} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="lg:col-span-4 bg-slate-900 text-white p-10 rounded-[2.5rem] shadow-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-indigo-400 font-black uppercase text-xs tracking-widest mb-6 flex items-center gap-3"><Zap size={20} /> Nexus AI</h3>
            <p className="text-2xl font-medium leading-relaxed italic">
              "Planner, detectamos un <span className="text-indigo-400 font-black">sobre-stock</span> valorizado en {fmtUSD(stats.totalInv * 0.15)} en la categoría Farmacia."
            </p>
          </div>
          <button onClick={() => setTab('demand')} className="mt-8 bg-indigo-600 hover:bg-indigo-500 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2">
            Ver Demand Sensing <ArrowRight size={16}/>
          </button>
        </div>
      </div>
    </div>
  );
};

export default VistaGeneral;