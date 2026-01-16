// ========================================================================
// TORRE DE CONTROL - CORE ENGINE (V12.5)
// Editado para total compatibilidad con los componentes visuales
// ========================================================================

export const generateMasterData = () => {
  const CATEGORIES = ["Alimentos", "Farmacia", "Químicos", "Bebidas", "Industrial"];
  const SUPPLIERS = [
    { name: "GlobalCorp", lt_avg: 15, reliability: 0.95, quality: 0.98 },
    { name: "EcoSupplies", lt_avg: 30, reliability: 0.82, quality: 0.90 },
    { name: "FastLogistics", lt_avg: 7, reliability: 0.88, quality: 0.94 },
    { name: "EuroTrade", lt_avg: 45, reliability: 0.97, quality: 0.99 }
  ];

  return Array.from({ length: 80 }, (_, i) => {
    const id = `SKU-${3000 + i}`;
    const category = CATEGORIES[i % CATEGORIES.length];
    const supplierInfo = SUPPLIERS[i % SUPPLIERS.length];
    const cost = Math.random() * 350 + 15;
    const stockFisico = Math.floor(Math.random() * 500);
    
    // Historia de demanda
    const history = Array.from({ length: 30 }, (_, m) => {
      const base = 100 + Math.sin(m / 2) * 40;
      const real = Math.max(0, Math.floor(base + (Math.random() * 30)));
      return {
        month: m,
        real,
        forecast: Math.floor(base * 0.95),
        inventory: 200 - (m * 2)
      };
    });

    const totalReal = history.slice(-12).reduce((acc, h) => acc + h.real, 0);
    const wapeML = Math.random() * 0.15 + 0.05;
    const cv = (Math.random() * 0.5) + 0.1;
    const meanDemand = totalReal / 12;

    // --- IMPORTANTE: Nombres de campos que esperan tus componentes ---
    const value = stockFisico * cost; // Lo que espera SaludStock y VistaGeneral
    const accuracy = 1 - wapeML;      // Lo que espera VistaGeneral

    const leadTime = supplierInfo.lt_avg;
    const ss = 1.65 * (meanDemand * cv) * Math.sqrt(leadTime / 30);
    const rop = (meanDemand * (leadTime / 30)) + ss;

    // Simulación de lotes para SaludStock
    const lotes = [
      { id: 'L-001', cantidad: Math.floor(stockFisico * 0.6), diasRestantes: Math.floor(Math.random() * 150) },
      { id: 'L-002', cantidad: Math.floor(stockFisico * 0.4), diasRestantes: Math.floor(Math.random() * 300) }
    ];

    return {
      id, category, supplier: supplierInfo.name, supplierScore: supplierInfo.reliability,
      cost, history, wapeML, accuracy, cv, meanDemand, value,
      annualValue: totalReal * cost, stock: stockFisico, rop, ss, 
      leadTime, lotes,
      sslQty: Math.random() > 0.8 ? Math.floor(Math.random() * 50) : 0,
      sslValue: (Math.random() > 0.8 ? Math.floor(Math.random() * 50) : 0) * cost,
      abc: totalReal * cost > 50000 ? 'A' : (totalReal * cost > 15000 ? 'B' : 'C'),
      xyz: cv < 0.25 ? 'X' : (cv < 0.5 ? 'Y' : 'Z'),
      status: stockFisico <= ss ? 'Crítico' : (stockFisico <= rop ? 'Reorden' : 'OK')
    };
  });
};
