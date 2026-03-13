"use client";

import { useState, useEffect } from "react";

export default function FinanceiroPage() {
  const [vendas, setVendas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  
  // Modal para ver os itens do recibo
  const [vendaSelecionada, setVendaSelecionada] = useState(null);

  const carregarVendas = async () => {
    try {
      const res = await fetch("/api/sales");
      const data = await res.json();
      setVendas(data);
    } catch (erro) {
      console.error("Erro ao buscar vendas:", erro);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarVendas();
  }, []);

  // Matemática de faturamento total do sistema (pode ser filtrado por data no futuro)
  const faturamentoTotal = vendas.reduce((acc, venda) => acc + venda.total, 0);

  return (
    <div className="flex flex-col h-full relative">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Financeiro</h1>
          <p className="text-slate-500 text-sm mt-1">Histórico de vendas e faturamento.</p>
        </div>
        
        {/* Card de Faturamento Rápido */}
        <div className="bg-emerald-50 border border-emerald-100 px-6 py-3 rounded-xl shadow-sm text-right">
          <p className="text-xs font-bold text-emerald-600 uppercase mb-1">Faturamento Total</p>
          <p className="text-2xl font-black text-emerald-700">R$ {faturamentoTotal.toFixed(2)}</p>
        </div>
      </header>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
              <th className="p-4 w-24">ID</th>
              <th className="p-4">Data e Hora</th>
              <th className="p-4">Cliente</th>
              <th className="p-4">Total</th>
              <th className="p-4 text-center">Recibo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {carregando ? (
              <tr><td colSpan="5" className="p-8 text-center text-slate-500"><i className="fas fa-spinner fa-spin mr-2"></i> Carregando registros...</td></tr>
            ) : vendas.length === 0 ? (
              <tr><td colSpan="5" className="p-8 text-center text-slate-500">Nenhuma venda registrada ainda.</td></tr>
            ) : vendas.map((venda) => (
                <tr key={venda.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-mono font-bold text-slate-500">#{venda.id}</td>
                  <td className="p-4 text-slate-700 font-medium">
                    {new Date(venda.createdAt).toLocaleString('pt-BR')}
                  </td>
                  <td className="p-4 font-semibold text-slate-800">
                    {venda.client ? (
                      <><i className="fas fa-user-circle text-blue-400 mr-2"></i>{venda.client.name}</>
                    ) : (
                      <><i className="fas fa-walking text-slate-400 mr-2"></i>Consumidor Final</>
                    )}
                  </td>
                  <td className="p-4 font-black text-emerald-600">R$ {venda.total.toFixed(2)}</td>
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => setVendaSelecionada(venda)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 rounded-md mx-1 transition-colors text-sm font-bold border border-slate-300 shadow-sm"
                      title="Ver Detalhes"
                    >
                      <i className="fas fa-receipt mr-2"></i> Detalhes
                    </button>
                  </td>
                </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL DO RECIBO */}
      {vendaSelecionada && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl flex flex-col max-h-[90vh]">
            
            <div className="p-5 border-b border-slate-200 bg-slate-50 rounded-t-xl flex justify-between items-center">
              <div>
                <h2 className="text-lg font-black text-slate-800 uppercase tracking-tighter">Detalhes da Venda <span className="text-slate-400 font-mono font-medium">#{vendaSelecionada.id}</span></h2>
                <p className="text-xs text-slate-500 font-medium mt-1">{new Date(vendaSelecionada.createdAt).toLocaleString('pt-BR')}</p>
              </div>
              <button onClick={() => setVendaSelecionada(null)} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <div className="mb-6">
                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Cliente</p>
                <p className="font-semibold text-slate-800 text-lg">
                  {vendaSelecionada.client ? vendaSelecionada.client.name : 'Consumidor Final (Sem Cadastro)'}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-400 uppercase mb-3 border-b border-slate-100 pb-2">Itens Comprados</p>
                <ul className="space-y-3">
                  {vendaSelecionada.items.map(item => (
                    <li key={item.id} className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-3">
                        <span className="bg-slate-100 text-slate-600 font-bold px-2 py-1 rounded text-xs">{item.quantity}x</span>
                        <span className="font-semibold text-slate-700">{item.product.name}</span>
                      </div>
                      <span className="font-mono text-slate-500 text-xs">R$ {(item.price * item.quantity).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="p-5 border-t border-slate-200 bg-slate-800 rounded-b-xl flex justify-between items-center text-white">
              <span className="text-slate-300 font-bold uppercase text-xs">Total Pago</span>
              <span className="text-2xl font-black">R$ {vendaSelecionada.total.toFixed(2)}</span>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}