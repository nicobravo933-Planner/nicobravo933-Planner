import React, { useMemo } from 'react';
import { 
  Bell, AlertTriangle, XCircle, Clock, TrendingDown, 
  ChevronRight, DollarSign, Package, Calendar
} from 'lucide-react';

const fmtUSD = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
const fmtNum = (n) => Math.round(n).toLocaleString();

const Novedades = ({ data, setTab }) => {
  // --- LÓGICA DE FILTRADO DE ALERTAS ---
  const alertas = useMemo(() => {
    const res = [];

    // 1. Alertas de Quiebre (Stock < Seguridad)
    const quiebres = data.filter(s => s.status === 'Crítico');
    quiebres.slice(0, 5).forEach(s => {
      res.push({
        id: `Q-${s.id}`,
        prioridad: 'alta',
        icon: XCircle,
        color: 'text-rose-600',
        bg: 'bg-rose-50',
        border: 'border-rose-200',
        titulo: `Quiebre Inminente: ${s.id}`,
        desc: `Stock actual (${fmtNum(s.stock)}) está por debajo del nivel de seguridad (${fmtNum(s.ss)}). Riesgo de pérdida de ventas.`,
        sku: s.id,
        impacto: s.annualValue / 365 * s.leadTime // Impacto estimado de venta perdida
      });
    });

    // 2. Alertas FEFO (Vencimientos próximos)
    const vencimientos = data.filter(s => s.sslQty > 0);
    vencimientos.slice(0, 3).forEach(s => {
      res.push({
        id: `V-${s.id}`,
        prioridad: 'media',
        icon: Clock,
        color: 'text-amber-600',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        titulo: `Riesgo de Merma FEFO: ${s.id}`,
        desc: `Hay ${fmtNum(s.sslQty)} unidades que vencerán antes de ser consumidas según el ritmo de venta actual.`,
        sku: s.id,
        impacto: s.sslValue
      });
    });

    // 3. Alertas de Proveedores (Simuladas basadas en el Score)
    const provRiesgo = data.filter(s => s.supplierScore < 0.85);
    if (provRiesgo.length > 0) {
      res.push({
        id: 'P-SUPP',
        prioridad: 'baja',
        icon: AlertTriangle,
        color: 'text-indigo-600',
        bg: 'bg-indigo-50',
        border: 'border-indigo-200',
        titulo: 'Inestabilidad de Suministro',
        desc: `El proveedor ${provRiesgo[0].supplier} muestra una variabilidad de Lead Time del 15% en las últimas entregas.`,
        sku: 'Logística',
        impacto: null
      });
    }

    return res;
  }, [data]);

  // Resumen de impacto
  const impactoTotal = alertas.reduce((acc, a) => acc + (a.impacto || 0), 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-in fade-in duration-700">
      
      {/* COLUMNA IZQUIERDA: FEED DE NOVEDADES */}
      <div className="lg:col-span-8 space-y-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
            <Bell className="text-indigo-600" /> Centro de Acción
          </h3>
          <span className="text-[10px] font-black bg-slate-200 px-3 py-1 rounded-full uppercase tracking-widest text-slate-600">
            {alertas.length} Tareas Pendientes
          </span>
        </div>

        {alertas.length > 0 ? (
          alertas.map((alerta) => (
            <div 
              key={alerta.id} 
              className={`group p-6 rounded-[2rem] border-2 ${alerta.bg} ${alerta.border} transition-all hover:shadow-lg hover:-translate-y-1 flex gap-6`}
            >
              <div className={`p-4 rounded-2xl bg-white shadow-sm h-fit ${alerta.color}`}>
                <alerta.icon size={24} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-black text-slate-800 text-lg leading-tight">{alerta.titulo}</h4>
                    <p className="text-sm text-slate-600 mt-2 font-medium leading-relaxed">{alerta.desc}</p>
                  </div>
                  {alerta.impacto > 0 && (
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Impacto Est.</p>
                      <p className={`font-black ${alerta.prioridad === 'alta' ? 'text-rose-600' : 'text-amber-600'}`}>
                        {fmtUSD(alerta.impacto)}
                      </p>
                    </div>
                  )}
                </div>
                <div className="mt-6 flex items-center justify-between border-t border-slate-200/50 pt-4">
                  <div className="flex gap-4">
                    <span className="text-[10px] font-black text-slate-400 uppercase">Ref: {alerta.sku}</span>
                    <span className="text-[10px] font-black text-slate-400 uppercase">Prioridad: {alerta.prioridad}</span>
                  </div>
                  <button 
                    onClick={() => setTab(alerta.id.startsWith('Q') ? 'purchasing' : 'inventory')}
                    className="flex items-center gap-1 text-xs font-black text-indigo-600 uppercase tracking-widest group-hover:gap-3 transition-all"
                  >
                    Solucionar <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
            <p className="font-bold text-slate-400">No hay alertas críticas para el ciclo actual.</p>
          </div>
        )}
      </div>

      {/* COLUMNA DERECHA: RESUMEN FINANCIERO DE RIESGO */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
          <div className="absolute -right-10 -top-10 opacity-10">
            <TrendingDown size={200} />
          </div>
          <h4 className="text-indigo-400 font-black uppercase text-[10px] tracking-[0.3em] mb-8">Pérdida Potencial</h4>
          <p className="text-5xl font-black tracking-tighter">{fmtUSD(impactoTotal)}</p>
          <p className="text-xs font-bold text-slate-400 mt-4 leading-relaxed italic">
            "Este es el costo acumulado de las ventas que no podrás realizar por falta de stock y el valor de los productos que vencerán en bodega."
          </p>
          <div className="mt-10 space-y-4">
            <div className="flex justify-between items-center text-sm border-b border-slate-800 pb-3">
              <span className="font-bold text-slate-500">Mermas FEFO</span>
              <span className="font-black text-amber-400">{fmtUSD(alertas.filter(a => a.id.startsWith('V')).reduce((acc, a) => acc + a.impacto, 0))}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="font-bold text-slate-500">Ventas Perdidas</span>
              <span className="font-black text-rose-500">{fmtUSD(alertas.filter(a => a.id.startsWith('Q')).reduce((acc, a) => acc + a.impacto, 0))}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Estado del Equipo</h4>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-black text-indigo-600 text-xs">AI</div>
              <div>
                <p className="text-xs font-black text-slate-800 tracking-tight">Análisis Predictivo</p>
                <p className="text-[10px] font-bold text-emerald-500">Completado hoy 08:30</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-400 text-xs">CN</div>
              <div>
                <p className="text-xs font-black text-slate-800 tracking-tight">Consolidación ERP</p>
                <p className="text-[10px] font-bold text-emerald-500">Sincronizado</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Novedades;