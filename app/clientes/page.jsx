"use client";

import { useState, useEffect } from "react";

export default function ClientesPage() {
  const [clientes, setClientes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  
  // Controle de exibição de inativos
  const [mostrarInativos, setMostrarInativos] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [clienteEditandoId, setClienteEditandoId] = useState(null);
  
  const [formData, setFormData] = useState({ name: "", phone: "" });

  const carregarClientes = async () => {
    try {
      setCarregando(true);
      const url = mostrarInativos ? "/api/clients?includeInactive=true" : "/api/clients";
      const res = await fetch(url);
      const data = await res.json();
      setClientes(data);
    } catch (erro) {
      console.error("Erro ao buscar clientes:", erro);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarClientes();
  }, [mostrarInativos]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const abrirModal = (cliente = null) => {
    if (cliente) {
      setClienteEditandoId(cliente.id);
      setFormData({ name: cliente.name, phone: cliente.phone || "" });
    } else {
      setClienteEditandoId(null);
      setFormData({ name: "", phone: "" });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSalvando(true);

    const url = clienteEditandoId ? `/api/clients/${clienteEditandoId}` : "/api/clients";
    const method = clienteEditandoId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error("Erro na operação");

      setIsModalOpen(false);
      carregarClientes();
    } catch (erro) {
      alert("Erro ao salvar. Verifique os dados.");
    } finally {
      setSalvando(false);
    }
  };

  const excluirCliente = async (id, nome) => {
    const confirmacao = window.confirm(`Tem certeza que deseja inativar o cliente "${nome}"?`);
    if (!confirmacao) return;

    try {
      const res = await fetch(`/api/clients/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Falha ao inativar.");
      
      carregarClientes();
    } catch (erro) {
      alert("Erro ao excluir.");
    }
  };

  const reativarCliente = async (id, nome) => {
    const confirmacao = window.confirm(`Deseja reativar o cliente "${nome}"?`);
    if (!confirmacao) return;

    try {
      const res = await fetch(`/api/clients/${id}`, { 
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: true })
      });
      
      if (!res.ok) throw new Error("Falha ao reativar");
      carregarClientes();
    } catch (erro) {
      alert("Erro ao reativar.");
    }
  };

  return (
    <div className="flex flex-col h-full relative">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Gestão de Clientes</h1>
          <p className="text-slate-500 text-sm mt-1">Cadastro e controle da sua base de clientes.</p>
        </div>
        
        <div className="flex items-center gap-6">
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
            <i className="fas fa-user-plus mr-2"></i> Novo Cliente
          </button>
        </div>
      </header>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
              <th className="p-4 w-1/2">Nome</th>
              <th className="p-4">Telefone</th>
              <th className="p-4 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {carregando ? (
              <tr><td colSpan="3" className="p-8 text-center text-slate-500"><i className="fas fa-spinner fa-spin mr-2"></i> Atualizando...</td></tr>
            ) : clientes.length === 0 ? (
              <tr><td colSpan="3" className="p-8 text-center text-slate-500">Nenhum cliente cadastrado.</td></tr>
            ) : clientes.map((c) => {
                const isAtivo = c.active;
                
                return (
                  <tr key={c.id} className={`hover:bg-slate-50 transition-all ${!isAtivo ? 'opacity-50 bg-slate-50' : ''}`}>
                    <td className="p-4 font-semibold text-slate-800">
                      <i className="fas fa-user-circle text-slate-400 mr-3 text-lg align-middle"></i>
                      {c.name}
                      {!isAtivo && (
                        <span className="ml-3 bg-red-100 text-red-600 text-[10px] px-2 py-0.5 rounded-md uppercase font-bold tracking-wider border border-red-200">
                          Inativo
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-slate-600 font-mono">{c.phone || "Não informado"}</td>
                    <td className="p-4 text-center">
                      <button onClick={() => abrirModal(c)} className="bg-amber-500 hover:bg-amber-600 text-white p-2 rounded-md mx-1 transition-colors" title="Editar">
                        <i className="fas fa-edit"></i>
                      </button>
                      
                      {isAtivo ? (
                        <button onClick={() => excluirCliente(c.id, c.name)} className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-md mx-1 transition-colors" title="Inativar">
                          <i className="fas fa-trash"></i>
                        </button>
                      ) : (
                        <button onClick={() => reativarCliente(c.id, c.name)} className="bg-emerald-500 hover:bg-emerald-600 text-white p-2 rounded-md mx-1 transition-colors" title="Reativar Cliente">
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
          <div className="bg-white p-8 rounded-xl w-full max-w-sm shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800">
                {clienteEditandoId ? "Editar Cliente" : "Novo Cliente"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome Completo</label>
                <input required type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Ex: João da Silva" className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Telefone (Opcional)</label>
                <input type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="(00) 00000-0000" className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
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