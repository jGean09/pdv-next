"use client";

import { useState, useEffect } from "react";

export default function EstoquePage() {
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  
  // === NOVO ESTADO: Controle do botão "Mostrar Inativos" ===
  const [mostrarInativos, setMostrarInativos] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [produtoEditandoId, setProdutoEditandoId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: "", price: "", cost: "", quantity: "", categoryId: ""
  });

  // === FETCH ATUALIZADO: Lê o estado do Checkbox ===
  const carregarProdutos = async () => {
    try {
      setCarregando(true);
      // Se mostrarInativos for true, adiciona o parâmetro na URL
      const url = mostrarInativos ? "/api/products?includeInactive=true" : "/api/products";
      const res = await fetch(url);
      const data = await res.json();
      setProdutos(data);
    } catch (erro) {
      console.error("Erro ao buscar produtos:", erro);
    } finally {
      setCarregando(false);
    }
  };

  const carregarCategorias = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategorias(data);
    } catch (erro) {
      console.error("Erro categorias:", erro);
    }
  };

  // Toda vez que você clicar no Checkbox, ele refaz a busca sozinho
  useEffect(() => {
    carregarProdutos();
  }, [mostrarInativos]);

  useEffect(() => {
    carregarCategorias();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const abrirModal = (produto = null) => {
    if (produto) {
      setProdutoEditandoId(produto.id);
      setFormData({
        name: produto.name,
        price: produto.price,
        cost: produto.cost,
        quantity: produto.quantity,
        categoryId: produto.categoryId || ""
      });
    } else {
      setProdutoEditandoId(null);
      setFormData({ name: "", price: "", cost: "", quantity: "", categoryId: "" });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSalvando(true);

    const url = produtoEditandoId ? `/api/products/${produtoEditandoId}` : "/api/products";
    const method = produtoEditandoId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error("Erro na operação");

      setIsModalOpen(false);
      carregarProdutos();
    } catch (erro) {
      alert("Erro ao salvar. Verifique os dados.");
    } finally {
      setSalvando(false);
    }
  };

  const excluirProduto = async (id, nome) => {
    const confirmacao = window.confirm(`Tem certeza que deseja inativar "${nome}"?`);
    if (!confirmacao) return;

    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Falha ao excluir");
      
      carregarProdutos(); // Atualiza a lista inteira após inativar
    } catch (erro) {
      alert("Erro ao excluir o produto.");
    }
  };

  // === NOVA LÓGICA: Reativar Produto ===
  const reativarProduto = async (id, nome) => {
    const confirmacao = window.confirm(`Deseja reativar o produto "${nome}" para voltar a vendê-lo?`);
    if (!confirmacao) return;

    try {
      const res = await fetch(`/api/products/${id}`, { 
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: true })
      });
      
      if (!res.ok) throw new Error("Falha ao reativar");
      
      carregarProdutos(); // Atualiza a lista
    } catch (erro) {
      alert("Erro ao reativar o produto.");
    }
  };

  return (
    <div className="flex flex-col h-full relative">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Gestão de Estoque</h1>
          <p className="text-slate-500 text-sm mt-1">Controle de mercadorias e disponibilidade.</p>
        </div>
        
        <div className="flex items-center gap-6">
          {/* === CHECKBOX PARA INATIVOS === */}
          <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-600 font-semibold select-none hover:text-slate-900 transition-colors">
            <input 
              type="checkbox" 
              checked={mostrarInativos} 
              onChange={(e) => setMostrarInativos(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
            />
            Mostrar Inativos
          </label>

          <button 
            onClick={() => abrirModal()} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors shadow-sm"
          >
            <i className="fas fa-plus mr-2"></i> Novo Produto
          </button>
        </div>
      </header>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
              <th className="p-4">Nome</th>
              <th className="p-4">Venda</th>
              <th className="p-4">Custo</th>
              <th className="p-4">Estoque</th>
              <th className="p-4">Categoria</th>
              <th className="p-4 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {carregando ? (
              <tr><td colSpan="6" className="p-8 text-center text-slate-500">
                <i className="fas fa-spinner fa-spin mr-2"></i> Atualizando...
              </td></tr>
            ) : produtos.map((p) => {
                const estoqueBaixo = p.quantity < 5;
                const isAtivo = p.active;

                return (
                  <tr key={p.id} className={`hover:bg-slate-50 transition-all ${!isAtivo ? 'opacity-50 bg-slate-50' : ''}`}>
                    <td className="p-4 font-semibold text-slate-800">
                      {p.name}
                      {!isAtivo && (
                        <span className="ml-3 bg-red-100 text-red-600 text-[10px] px-2 py-0.5 rounded-md uppercase font-bold tracking-wider border border-red-200">
                          Inativo
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-slate-600">R$ {p.price.toFixed(2)}</td>
                    <td className="p-4 text-slate-600">R$ {p.cost.toFixed(2)}</td>
                    <td className={`p-4 font-bold flex items-center gap-2 ${estoqueBaixo && isAtivo ? 'text-red-500' : 'text-slate-700'}`}>
                      {p.quantity} {estoqueBaixo && isAtivo && <i className="fas fa-exclamation-triangle"></i>}
                    </td>
                    <td className="p-4"><span className="bg-slate-200 text-slate-700 px-3 py-1 rounded-md text-xs font-semibold">{p.category ? p.category.name : 'Geral'}</span></td>
                    
                    {/* === BOTÕES CONDICIONAIS === */}
                    <td className="p-4 text-center">
                      <button onClick={() => abrirModal(p)} className="bg-amber-500 hover:bg-amber-600 text-white p-2 rounded-md mx-1 transition-colors" title="Editar">
                        <i className="fas fa-edit"></i>
                      </button>
                      
                      {isAtivo ? (
                        <button onClick={() => excluirProduto(p.id, p.name)} className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-md mx-1 transition-colors" title="Inativar">
                          <i className="fas fa-trash"></i>
                        </button>
                      ) : (
                        <button onClick={() => reativarProduto(p.id, p.name)} className="bg-emerald-500 hover:bg-emerald-600 text-white p-2 rounded-md mx-1 transition-colors" title="Reativar Produto">
                          <i className="fas fa-trash-restore"></i>
                        </button>
                      )}
                    </td>
                    
                  </tr>
                );
            })}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800">
                {produtoEditandoId ? "Editar Produto" : "Novo Produto"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome do Produto</label>
                <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
              </div>
              
              <div className="flex gap-4">
                <div className="w-1/2">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Preço (Venda)</label>
                  <input required type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                </div>
                <div className="w-1/2">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Custo</label>
                  <input required type="number" step="0.01" name="cost" value={formData.cost} onChange={handleChange} className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-1/3">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Estoque</label>
                  <input required type="number" name="quantity" value={formData.quantity} onChange={handleChange} className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                </div>
                <div className="w-2/3">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Categoria</label>
                  <select required name="categoryId" value={formData.categoryId} onChange={handleChange} className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white">
                    <option value="" disabled>Selecione...</option>
                    {categorias.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-slate-600 font-semibold hover:bg-slate-100 rounded-lg transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={salvando} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center gap-2">
                  {salvando ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-save"></i>}
                  {salvando ? 'Salvando...' : (produtoEditandoId ? 'Atualizar' : 'Salvar')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}