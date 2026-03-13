"use client";

import { useState, useEffect } from "react";

export default function CaixaPage() {
  const [produtos, setProdutos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  
  const [carrinho, setCarrinho] = useState([]);
  const [clienteSelecionado, setClienteSelecionado] = useState("");

  const carregarDados = async () => {
    try {
      setCarregando(true);
      // Busca produtos ativos e clientes ativos ao mesmo tempo
      const [resProd, resCli] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/clients")
      ]);
      
      const [dataProd, dataCli] = await Promise.all([
        resProd.json(),
        resCli.json()
      ]);

      setProdutos(dataProd);
      setClientes(dataCli);
    } catch (erro) {
      console.error("Erro ao carregar dados do caixa:", erro);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const adicionarAoCarrinho = (produto) => {
    if (produto.quantity <= 0) {
      alert("Produto sem estoque!");
      return;
    }

    setCarrinho((prev) => {
      const itemExistente = prev.find((item) => item.id === produto.id);
      
      if (itemExistente) {
        if (itemExistente.quantidadeVenda >= produto.quantity) {
          alert("Estoque máximo atingido para este item.");
          return prev;
        }
        return prev.map((item) =>
          item.id === produto.id ? { ...item, quantidadeVenda: item.quantidadeVenda + 1 } : item
        );
      }
      return [...prev, { ...produto, quantidadeVenda: 1 }];
    });
  };

  const alterarQuantidade = (id, delta) => {
    setCarrinho((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const novaQuantidade = item.quantidadeVenda + delta;
          if (novaQuantidade < 1) return item;
          if (novaQuantidade > item.quantity) {
            alert("Estoque insuficiente.");
            return item;
          }
          return { ...item, quantidadeVenda: novaQuantidade };
        }
        return item;
      })
    );
  };

  const removerDoCarrinho = (id) => {
    setCarrinho((prev) => prev.filter((item) => item.id !== id));
  };

  const limparCarrinho = () => {
    if (window.confirm("Tem certeza que deseja cancelar esta venda?")) {
      setCarrinho([]);
      setClienteSelecionado("");
    }
  };

  const totalVenda = carrinho.reduce((acc, item) => acc + (item.price * item.quantidadeVenda), 0);

  // === A MÁGICA ACONTECE AQUI ===
  const finalizarVenda = async () => {
    if (carrinho.length === 0) return;
    setSalvando(true);

    const payload = {
      customerId: clienteSelecionado ? parseInt(clienteSelecionado) : null,
      total: totalVenda,
      items: carrinho
    };

    try {
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Erro ao processar a venda no servidor.");

      alert("Venda finalizada com sucesso!");
      setCarrinho([]);
      setClienteSelecionado("");
      carregarDados(); // Recarrega os produtos para atualizar o estoque na tela
    } catch (erro) {
      alert(erro.message);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-6">
      
      {/* LADO ESQUERDO: Lista de Produtos */}
      <div className="w-2/3 flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h2 className="font-bold text-slate-800 text-lg">Produtos Disponíveis</h2>
        </div>
        
        {/* Grid ajustado para ser responsivo conforme a sidebar abre/fecha */}
        <div className="p-4 overflow-y-auto grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-max flex-1">
          {carregando ? (
            <p className="col-span-full text-center text-slate-500 py-8"><i className="fas fa-spinner fa-spin mr-2"></i>Carregando estoque...</p>
          ) : produtos.map((p) => {
              const semEstoque = p.quantity <= 0;
              return (
                <div 
                  key={p.id} 
                  onClick={() => !semEstoque && adicionarAoCarrinho(p)}
                  className={`border rounded-xl p-4 flex flex-col justify-between transition-all ${semEstoque ? 'border-red-200 bg-red-50 opacity-60 cursor-not-allowed' : 'border-slate-200 hover:border-blue-500 hover:shadow-md cursor-pointer bg-white'}`}
                >
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase">{p.category?.name || 'Geral'}</span>
                    <h3 className="font-bold text-slate-800 mt-1 leading-tight">{p.name}</h3>
                  </div>
                  <div className="mt-4 flex justify-between items-end">
                    <span className="font-black text-blue-600">R$ {p.price.toFixed(2)}</span>
                    <span className={`text-xs font-semibold ${semEstoque ? 'text-red-500' : 'text-slate-500'}`}>
                      {semEstoque ? 'Esgotado' : `${p.quantity} un.`}
                    </span>
                  </div>
                </div>
              );
          })}
        </div>
      </div>

      {/* LADO DIREITO: O Carrinho */}
      <div className="w-1/3 flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-800 text-white flex justify-between items-center">
          <h2 className="font-bold text-lg"><i className="fas fa-shopping-cart mr-2"></i> Caixa</h2>
          <span className="bg-slate-700 px-2 py-1 rounded text-xs font-bold">{carrinho.length} itens</span>
        </div>

        {/* Lista de Itens no Carrinho */}
        <div className="flex-1 overflow-y-auto p-2 bg-slate-50">
          {carrinho.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <i className="fas fa-box-open text-4xl mb-3"></i>
              <p className="text-sm font-medium">Carrinho vazio</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {carrinho.map((item) => (
                <li key={item.id} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-slate-800 text-sm">{item.name}</span>
                    <button onClick={() => removerDoCarrinho(item.id)} className="text-red-400 hover:text-red-600 transition-colors">
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 bg-slate-100 rounded-md border border-slate-200 p-1">
                      <button onClick={() => alterarQuantidade(item.id, -1)} className="w-6 h-6 flex items-center justify-center bg-white rounded text-slate-600 hover:bg-slate-200 shadow-sm"><i className="fas fa-minus text-xs"></i></button>
                      <span className="font-bold text-sm w-4 text-center">{item.quantidadeVenda}</span>
                      <button onClick={() => alterarQuantidade(item.id, 1)} className="w-6 h-6 flex items-center justify-center bg-white rounded text-slate-600 hover:bg-slate-200 shadow-sm"><i className="fas fa-plus text-xs"></i></button>
                    </div>
                    <span className="font-bold text-slate-700">R$ {(item.price * item.quantidadeVenda).toFixed(2)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Rodapé: Cliente, Totais e Finalização */}
        <div className="p-4 border-t border-slate-200 bg-white space-y-4">
          
          {/* Seleção de Cliente */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Vincular Cliente (Opcional)</label>
            <select 
              value={clienteSelecionado} 
              onChange={(e) => setClienteSelecionado(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2 outline-none focus:border-blue-500 text-sm"
            >
              <option value="">Consumidor Final (Sem cadastro)</option>
              {clientes.map(cli => (
                <option key={cli.id} value={cli.id}>{cli.name}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-slate-100">
            <span className="text-slate-500 font-bold uppercase text-sm">Total a Pagar</span>
            <span className="text-3xl font-black text-emerald-600">R$ {totalVenda.toFixed(2)}</span>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={limparCarrinho}
              disabled={carrinho.length === 0 || salvando}
              className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button 
              disabled={carrinho.length === 0 || salvando}
              onClick={finalizarVenda}
              className="w-2/3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50 flex justify-center items-center gap-2 shadow-sm"
            >
              {salvando ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-check-circle"></i>}
              {salvando ? 'Processando...' : 'Finalizar Venda'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}