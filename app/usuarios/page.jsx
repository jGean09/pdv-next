"use client";

import { useState, useEffect } from "react";

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // Estado do formulário
  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "CAIXA" });
  const [erro, setErro] = useState("");

  const fetchUsuarios = async () => {
    const res = await fetch("/api/users");
    const data = await res.json();
    setUsuarios(data);
    setLoading(false);
  };

  useEffect(() => { fetchUsuarios(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      setShowModal(false);
      setFormData({ name: "", email: "", password: "", role: "CAIXA" });
      fetchUsuarios();
    } else {
      const data = await res.json();
      setErro(data.error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tighter">GESTÃO DE USUÁRIOS</h1>
          <p className="text-slate-500">Controle quem acessa o seu sistema</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg flex items-center gap-2"
        >
          <i className="fas fa-user-plus"></i> Novo Funcionário
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase">Nome</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase">E-mail</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase">Cargo</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase">Status</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((user) => (
              <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                <td className="p-4 font-bold text-slate-700">{user.name}</td>
                <td className="p-4 text-slate-600">{user.email}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-black ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`flex items-center gap-1.5 font-bold text-xs ${user.active ? 'text-emerald-600' : 'text-red-600'}`}>
                    <span className={`w-2 h-2 rounded-full ${user.active ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                    {user.active ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="p-4 text-center">
                   <button className="text-slate-400 hover:text-blue-600 transition-colors p-2">
                     <i className="fas fa-edit"></i>
                   </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL DE CADASTRO */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
              <h2 className="text-xl font-bold">Cadastrar Funcionário</h2>
              <button onClick={() => setShowModal(false)}><i className="fas fa-times"></i></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {erro && <p className="bg-red-50 text-red-600 p-3 rounded-lg text-xs font-bold">{erro}</p>}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome Completo</label>
                <input required type="text" className="w-full border p-3 rounded-lg outline-none focus:border-blue-500" 
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}/>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">E-mail</label>
                <input required type="email" className="w-full border p-3 rounded-lg outline-none focus:border-blue-500" 
                  value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}/>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Senha Inicial</label>
                <input required type="password" minLength={4} className="w-full border p-3 rounded-lg outline-none focus:border-blue-500" 
                  value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}/>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Cargo / Permissão</label>
                <select className="w-full border p-3 rounded-lg outline-none focus:border-blue-500 font-bold"
                  value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                  <option value="CAIXA">CAIXA (Acesso restrito à venda)</option>
                  <option value="ADMIN">ADMIN (Acesso total)</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all mt-4">
                Salvar Funcionário
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}