// app/categorias/page.jsx
"use client";

import { useState, useEffect } from "react";

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [categoriaEditandoId, setCategoriaEditandoId] = useState(null);
  
  const [formData, setFormData] = useState({ name: "" });

  const carregarCategorias = async () => {
    try {
      setCarregando(true);
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategorias(data);
    } catch (erro) {
      console.error("Erro ao buscar categorias:", erro);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarCategorias();
  }, []);

  const handleChange = (e) => {
    setFormData({ name: e.target.value });
  };

  const abrirModal = (categoria = null) => {
    if (categoria) {
      setCategoriaEditandoId(categoria.id);
      setFormData({ name: categoria.name });
    } else {
      setCategoriaEditandoId(null);
      setFormData({ name: "" });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSalvando(true);

    const url = categoriaEditandoId ? `/api/categories/${categoriaEditandoId}` : "/api/categories";
    const method = categoriaEditandoId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error("Erro na operação");

      setIsModalOpen(false);
      carregarCategorias();
    } catch (erro) {
      alert("Erro ao salvar. Verifique os dados.");
    } finally {
      setSalvando(false);
    }
  };

  const excluirCategoria = async (id, nome) => {
    const confirmacao = window.confirm(`Tem certeza que deseja excluir a categoria "${nome}"?`);
    if (!confirmacao) return;

    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      const data = await res.json();
      
      if (!res.ok) {
        // Exibe o erro exato retornado pelo backend (ex: produtos vinculados)
        throw new Error(data.error || "Falha ao excluir.");
      }
      
      carregarCategorias();
    } catch (erro) {
      alert(erro.message);
    }
  };

  return (
    <div className="flex flex-col h-full relative">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Categorias</h1>
          <p className="text-slate-500 text-sm mt-1">Organize seus produtos para relatórios futuros.</p>
        </div>
        <button 
          onClick={() => abrirModal()} 
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors shadow-sm"
        >
          <i className="fas fa-tags mr-2"></i> Nova Categoria
        </button>
      </header>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden w-full max-w-3xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
              <th className="p-4 w-16 text-center">ID</th>
              <th className="p-4">Nome da Categoria</th>
              <th className="p-4 text-center w-32">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {carregando ? (
              <tr><td colSpan="3" className="p-8 text-center text-slate-500"><i className="fas fa-spinner fa-spin mr-2"></i> Carregando...</td></tr>
            ) : categorias.length === 0 ? (
              <tr><td colSpan="3" className="p-8 text-center text-slate-500">Nenhuma categoria cadastrada.</td></tr>
            ) : categorias.map((cat) => (
                <tr key={cat.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-mono font-bold text-slate-400 text-center">{cat.id}</td>
                  <td className="p-4 font-semibold text-slate-800 uppercase tracking-wide">{cat.name}</td>
                  <td className="p-4 text-center">
                    <button onClick={() => abrirModal(cat)} className="bg-amber-500 hover:bg-amber-600 text-white p-2 rounded-md mx-1 transition-colors" title="Editar">
                      <i className="fas fa-edit"></i>
                    </button>
                    <button onClick={() => excluirCategoria(cat.id, cat.name)} className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-md mx-1 transition-colors" title="Excluir">
                      <i className="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl w-full max-w-sm shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800">
                {categoriaEditandoId ? "Editar Categoria" : "Nova Categoria"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome da Categoria</label>
                <input required type="text" value={formData.name} onChange={handleChange} placeholder="Ex: Bebidas, Perfumes..." className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 uppercase" />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-slate-600 font-semibold hover:bg-slate-100 rounded-lg transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={salvando} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center gap-2">
                  {salvando ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-save"></i>}
                  {salvando ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}