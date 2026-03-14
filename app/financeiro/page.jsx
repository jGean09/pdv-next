"use client";

import { useState, useEffect } from "react";

export default function FinanceiroPage() {
  const [vendas, setVendas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [vendaSelecionada, setVendaSelecionada] = useState(null);
  
  const dataHoje = new Date().toISOString().split('T')[0];
  const [filtroData, setFiltroData] = useState(dataHoje);

  const carregarVendas = async () => {
    try {
      setCarregando(true);
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

  // FUNÇÃO DE ESTORNO (O "BOTÃO DE PÂNICO")
  const handleEstorno = async (id) => {
    const confirmacao = confirm(
      "CUIDADO: Esta ação vai DELETAR permanentemente esta venda e DEVOLVER os produtos ao estoque. Deseja continuar?"
    );
    
    if (!confirmacao) return;

    try {
      const res = await fetch(`/api/sales/${id}`, { method: "DELETE" });
      const data = await res.json();

      if (res.ok) {
        alert("Sucesso: Venda estornada e estoque recomposto.");
        setVendaSelecionada(null);
        carregarVendas(); // Recarrega a lista sem dar refresh na página inteira
      } else {
        alert("Erro ao estornar: " + data.error);
      }
    } catch (error) {
      console.error("Erro ao estornar:", error);
      alert("Erro crítico de conexão.");
    }
  };

  const vendasFiltradas = vendas.filter(venda => {
    if (!filtroData) return true;
    const dataVenda = new Date(venda.createdAt).toISOString().split('T')[0];
    return dataVenda === filtroData;
  });

  const faturamentoDoPeriodo = vendasFiltradas.reduce((acc, venda) => acc + venda.total, 0);

  return (
    <div className="flex flex-col h-full relative">
      <header className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tighter uppercase">Livro-Caixa</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium text-slate-400">Auditoria detalhada de transações e estornos.</p>
        </div>
        
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
                <button onClick={() => setFiltroData("")} className="text-slate-400 hover:text-red-500 transition-colors px-2">
                  <i className="fas fa-times"></i>
                </button>
             )}
          </div>

          <div className="bg-emerald-50 border border-emerald-200 px-6 py-3 rounded-xl shadow-sm text-right">
            <p className="text-xs font-bold text-emerald-600 uppercase mb-1">Faturamento {filtroData ? 'do Dia' : 'Total'}</p>
            <p className="text-2xl font-black text-emerald-700 font-mono">R$ {faturamentoDoPeriodo.toFixed(2)}</p>
          </div>
        </div>
      </header>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-left border-collapse relative">
            <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 shadow-sm z-10">
              <tr className="text-xs uppercase tracking-wider text-slate-500 font-bold">
                <th className="p-4 w-24">Recibo</th>
                <th className="p-4">Hora</th>
                <th className="p-4">Cliente</th>
                <th className="p-4">Valor</th>
                <th className="p-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {carregando ? (
                <tr><td colSpan="5" className="p-12 text-center text-slate-400"><i className="fas fa-spinner fa-spin text-2xl mb-3 block text-blue-500"></i> Carregando registros...</td></tr>
              ) : vendasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-12 text-center text-slate-400 font-medium">
                    <i className="fas fa-receipt text-3xl mb-3 block opacity-50"></i>
                    {filtroData ? `Nenhuma venda em ${filtroData.split('-').reverse().join('/')}.` : 'Nenhuma venda encontrada.'}
                  </td>
                </tr>
              ) : vendasFiltradas.map((venda) => (
                  <tr key={venda.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="p-4 font-mono font-bold text-slate-400">#{venda.id}</td>
                    <td className="p-4 text-slate-700 font-medium italic">
                      {new Date(venda.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-4 font-semibold text-slate-800">
                      {venda.client ? (
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-[10px] uppercase font-black"><i className="fas fa-user mr-1"></i> {venda.client.name}</span>
                      ) : (
                        <span className="text-slate-400 text-sm font-bold opacity-60"><i className="fas fa-walking mr-1"></i> Balcão</span>
                      )}
                    </td>
                    <td className="p-4 font-black text-slate-700">R$ {venda.total.toFixed(2)}</td>
                    <td className="p-4 text-center flex justify-center gap-2">
                      <button 
                        onClick={() => setVendaSelecionada(venda)}
                        className="bg-white hover:bg-slate-100 text-slate-600 w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 transition-all shadow-sm"
                        title="Ver Recibo"
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                      
                      {/* BOTÃO DE ESTORNO NA TABELA */}
                      <button 
                        onClick={() => handleEstorno(venda.id)}
                        className="bg-white hover:bg-red-50 text-slate-400 hover:text-red-600 w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 transition-all shadow-sm opacity-0 group-hover:opacity-100"
                        title="Estornar Venda"
                      >
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </td>
                  </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-slate-50 border-t border-slate-200 p-3 text-center text-[10px] text-slate-400 font-black uppercase tracking-widest">
          {vendasFiltradas.length} transações auditadas
        </div>
      </div>

      {/* Modal do Recibo */}
      {vendaSelecionada && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in duration-200">
            <div className="p-5 border-b border-slate-200 bg-slate-50 rounded-t-2xl flex justify-between items-center">
              <div>
                <h2 className="text-lg font-black text-slate-800 uppercase tracking-tighter italic">RECIBO <span className="text-blue-500 font-mono font-medium">#{vendaSelecionada.id}</span></h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-wider">{new Date(vendaSelecionada.createdAt).toLocaleString('pt-BR')}</p>
              </div>
              <button onClick={() => setVendaSelecionada(null)} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors">
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <div className="mb-6">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Cliente</p>
                <p className="font-bold text-slate-800 text-lg uppercase tracking-tight">
                  {vendaSelecionada.client ? vendaSelecionada.client.name : 'Venda Balcão'}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase mb-3 border-b border-slate-100 pb-2 tracking-widest">Itens Comprados</p>
                <ul className="space-y-3">
                  {vendaSelecionada.items.map(item => (
                    <li key={item.id} className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-3">
                        <span className="bg-slate-900 text-white font-bold px-2 py-1 rounded text-[10px]">{item.quantity}x</span>
                        <span className="font-bold text-slate-700 uppercase text-xs">{item.product.name}</span>
                      </div>
                      <span className="font-mono text-slate-500 text-xs font-bold">
                         R$ {(item.price * item.quantity).toFixed(2)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* BOTÃO DE ESTORNO DENTRO DO MODAL */}
              <div className="mt-8 pt-4 border-t border-dashed border-slate-200">
                  <button 
                    onClick={() => handleEstorno(vendaSelecionada.id)}
                    className="w-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white font-black uppercase text-[10px] tracking-widest py-3 rounded-xl transition-all flex items-center justify-center gap-2 border border-red-100"
                  >
                    <i className="fas fa-trash-alt"></i> Estornar esta Venda
                  </button>
              </div>
            </div>

            <div className="p-6 bg-slate-900 rounded-b-2xl flex justify-between items-center text-white">
              <span className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Total Geral</span>
              <span className="text-3xl font-black italic tracking-tighter">R$ {vendaSelecionada.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}