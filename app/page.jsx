// app/page.jsx
"use client";

import { useState, useEffect } from "react";

export default function DashboardPage() {
  const [metrics, setMetrics] = useState({
    faturamento: 0, custo: 0, lucro: 0, ticketMedio: 0, qtdVendas: 0, topProducts: []
  });
  const [categorias, setCategorias] = useState([]);
  const [carregando, setCarregando] = useState(true);

  // Estados dos Filtros
  const [filtroDataInicio, setFiltroDataInicio] = useState("");
  const [filtroDataFim, setFiltroDataFim] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");

  const carregarCategorias = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategorias(data);
    } catch (e) { console.error(e); }
  };

  const extrairDados = async () => {
    try {
      setCarregando(true);
      const params = new URLSearchParams();
      if (filtroDataInicio) params.append("startDate", filtroDataInicio);
      if (filtroDataFim) params.append("endDate", filtroDataFim);
      if (filtroCategoria) params.append("categoryId", filtroCategoria);

      // ADICIONE O { cache: 'no-store' } AQUI NESTA LINHA:
      const res = await fetch(`/api/dashboard?${params.toString()}`, { cache: 'no-store' });
      
      const data = await res.json();
      setMetrics(data);
    } catch (erro) {
      console.error("Erro ao puxar métricas:", erro);
    } finally {
      setCarregando(false);
    }
  };

  // Carrega as categorias na primeira vez
  useEffect(() => {
    carregarCategorias();
  }, []);

  // Recalcula o dashboard toda vez que um filtro mudar
  useEffect(() => {
    extrairDados();
  }, [filtroDataInicio, filtroDataFim, filtroCategoria]);

  const margemLucro = metrics.faturamento > 0 
    ? ((metrics.lucro / metrics.faturamento) * 100).toFixed(1) 
    : 0;

  return (
    <div className="h-[calc(100vh-2rem)] overflow-y-auto pb-20 pr-4">
      <header className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Dashboard de Resultados</h1>
          <p className="text-slate-500 text-sm mt-1">Análise de inteligência e performance de vendas.</p>
        </div>
      </header>

      {/* BARRA DE FILTROS ESTRATÉGICOS */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex gap-4 items-end">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Data Início</label>
          <input type="date" value={filtroDataInicio} onChange={(e) => setFiltroDataInicio(e.target.value)} className="border border-slate-300 rounded-lg p-2 text-sm outline-none focus:border-blue-500" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Data Fim</label>
          <input type="date" value={filtroDataFim} onChange={(e) => setFiltroDataFim(e.target.value)} className="border border-slate-300 rounded-lg p-2 text-sm outline-none focus:border-blue-500" />
        </div>
        <div className="flex-1 max-w-xs">
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Filtrar por Categoria</label>
          <select value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 text-sm outline-none focus:border-blue-500 bg-white">
            <option value="">Todas as Categorias</option>
            {categorias.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
          </select>
        </div>
        {(filtroDataInicio || filtroDataFim || filtroCategoria) && (
          <button onClick={() => { setFiltroDataInicio(""); setFiltroDataFim(""); setFiltroCategoria(""); }} className="text-sm font-bold text-slate-400 hover:text-red-500 transition-colors p-2">
            Limpar Filtros
          </button>
        )}
      </div>

      {carregando ? (
        <div className="flex-1 flex justify-center items-center text-slate-400"><i className="fas fa-spinner fa-spin text-3xl"></i></div>
      ) : (
        <>
          {/* CARDS DE INDICADORES (KPIs) */}
          <div className="grid grid-cols-4 gap-6 mb-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-blue-500">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Faturamento Bruto</p>
              <h2 className="text-3xl font-black text-slate-800">R$ {metrics.faturamento.toFixed(2)}</h2>
              <p className="text-xs font-semibold text-slate-400 mt-2">{metrics.qtdVendas} Vendas realizadas</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-red-500">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Custo de Mercadoria</p>
              <h2 className="text-3xl font-black text-slate-800">R$ {metrics.custo.toFixed(2)}</h2>
            </div>

            <div className="bg-emerald-50 p-6 rounded-xl shadow-sm border border-emerald-100 border-l-4 border-l-emerald-500 relative overflow-hidden">
              <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2">Lucro Líquido</p>
              <h2 className="text-3xl font-black text-emerald-700">R$ {metrics.lucro.toFixed(2)}</h2>
              <p className="text-xs font-bold text-emerald-600 mt-2">Margem: {margemLucro}%</p>
              <i className="fas fa-chart-line absolute -right-4 -bottom-4 text-6xl text-emerald-500 opacity-20"></i>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-amber-500">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Ticket Médio</p>
              <h2 className="text-3xl font-black text-slate-800">R$ {metrics.ticketMedio.toFixed(2)}</h2>
              <p className="text-xs font-semibold text-slate-400 mt-2">Valor médio por venda</p>
            </div>
          </div>

          {/* ÁREA DE RANKING */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden w-1/2">
            <div className="p-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-800 uppercase text-xs tracking-wider"><i className="fas fa-trophy text-amber-500 mr-2"></i>Top 5 Produtos Mais Vendidos</h3>
            </div>
            <div className="p-4">
              {metrics.topProducts.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">Nenhuma venda no período.</p>
              ) : (
                <ul className="space-y-4 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                  {metrics.topProducts.map((prod, index) => (
                    <li key={index} className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${index === 0 ? 'bg-amber-100 text-amber-600' : index === 1 ? 'bg-slate-200 text-slate-600' : index === 2 ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-400'}`}>
                          {index + 1}
                        </span>
                        <span className="font-semibold text-slate-700">{prod.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-800 text-sm">{prod.quantity} un.</p>
                        <p className="text-xs text-slate-400 font-semibold">R$ {prod.revenue.toFixed(2)}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}