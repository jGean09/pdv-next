"use client";

import { useState, useEffect } from "react";

export default function FinanceiroPage() {
  const [vendas, setVendas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [vendaSelecionada, setVendaSelecionada] = useState(null);
  
  // Estado para o filtro de data (inicia com a data de hoje no formato YYYY-MM-DD)
  const dataHoje = new Date().toISOString().split('T')[0];
  const [filtroData, setFiltroData] = useState(dataHoje);

  const carregarVendas = async () => {
    try {
      setCarregando(true);
      // Busca todas as vendas (o filtro será feito no lado do cliente para ser instantâneo)
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

  // Lógica de filtragem: Só exibe as vendas que batem com a data escolhida.
  // Se o filtroData estiver vazio, mostra todas.
  const vendasFiltradas = vendas.filter(venda => {
    if (!filtroData) return true;
    const dataVenda = new Date(venda.createdAt).toISOString().split('T')[0];
    return dataVenda === filtroData;
  });

  // Recalcula o faturamento com base APENAS no que está na tela (filtrado)
  const faturamentoDoPeriodo = vendasFiltradas.reduce((acc, venda) => acc + venda.total, 0);

  return (
    <div className="flex flex-col h-full relative">
      <header className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Livro-Caixa</h1>
          <p className="text-slate-500 text-sm mt-1">Histórico detalhado de recibos e transações.</p>
        </div>
        
        {/* Controle Superior: Filtro e Total */}
        <div className="flex items-center gap-6">
          <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm flex items-center gap-3">
             <label className="text-xs font-bold text-slate-500 uppercase">Data:</label>
             <input 
               type="date" 
               value={filtroData} 
               onChange={(e) => setFiltroData(e.target.value)}
               className="text-sm outline-none text-slate-700 font-semibold cursor-pointer"
             />
             {filtroData && (
                <button onClick={() => setFiltroData("")} className="text-slate-400 hover:text-red-500 transition-colors px-2" title="Limpar Filtro">
                  <i className="fas fa-times"></i>
                </button>
             )}
          </div>

          <div className="bg-emerald-50 border border-emerald-200 px-6 py-3 rounded-xl shadow-sm text-right">
            <p className="text-xs font-bold text-emerald-600 uppercase mb-1">Faturamento {filtroData ? 'do Dia' : 'Total'}</p>
            <p className="text-2xl font-black text-emerald-700">R$ {faturamentoDoPeriodo.toFixed(2)}</p>
          </div>
        </div>
      </header>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-left border-collapse relative">
            <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 shadow-sm z-10">
              <tr className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
                <th className="p-4 w-24">Recibo</th>
                <th className="p-4">Hora</th>
                <th className="p-4">Cliente</th>
                <th className="p-4">Valor</th>
                <th className="p-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {carregando ? (
                <tr><td colSpan="5" className="p-12 text-center text-slate-400"><i className="fas fa-spinner fa-spin text-2xl mb-3 block"></i> Carregando registros...</td></tr>
              ) : vendasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-12 text-center text-slate-400">
                    <i className="fas fa-receipt text-3xl mb-3 block opacity-50"></i>
                    {filtroData ? `Nenhuma venda registrada no dia ${filtroData.split('-').reverse().join('/')}.` : 'Nenhuma venda encontrada.'}
                  </td>
                </tr>
              ) : vendasFiltradas.map((venda) => (
                  <tr key={venda.id} className="hover:bg-blue-50/50 transition-colors">
                    <td className="p-4 font-mono font-bold text-slate-400">#{venda.id}</td>
                    <td className="p-4 text-slate-700 font-medium">
                      {new Date(venda.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-4 font-semibold text-slate-800">
                      {venda.client ? (
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs"><i className="fas fa-user mr-1"></i> {venda.client.name}</span>
                      ) : (
                        <span className="text-slate-400 text-sm"><i className="fas fa-walking mr-1"></i> Balcão</span>
                      )}
                    </td>
                    <td className="p-4 font-black text-emerald-600">R$ {venda.total.toFixed(2)}</td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => setVendaSelecionada(venda)}
                        className="bg-white hover:bg-slate-100 text-slate-600 p-2 rounded-md transition-colors text-sm font-bold border border-slate-200 shadow-sm"
                        title="Ver Detalhes"
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                    </td>
                  </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-slate-50 border-t border-slate-200 p-3 text-center text-xs text-slate-500 font-semibold">
          Exibindo {vendasFiltradas.length} transações
        </div>
      </div>

      {/* Modal do Recibo Mantido */}
      {vendaSelecionada && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-200 bg-slate-50 rounded-t-xl flex justify-between items-center">
              <div>
                <h2 className="text-lg font-black text-slate-800 uppercase tracking-tighter">Recibo <span className="text-slate-400 font-mono font-medium">#{vendaSelecionada.id}</span></h2>
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
                  {vendaSelecionada.client ? vendaSelecionada.client.name : 'Venda Balcão (Sem Cadastro)'}
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
                      <span className="font-mono text-slate-500 text-xs text-right">
                         R$ {(item.price * item.quantity).toFixed(2)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="p-5 border-t border-slate-200 bg-slate-800 rounded-b-xl flex justify-between items-center text-white">
              <span className="text-slate-300 font-bold uppercase text-xs">Total</span>
              <span className="text-2xl font-black">R$ {vendaSelecionada.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}