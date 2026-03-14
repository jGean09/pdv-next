// app/login/page.jsx
"use client";

import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao conectar");
      }

      // Se deu certo, a API já injetou o cookie. Só precisamos redirecionar.
      // Usamos window.location.href para forçar um recarregamento total e limpar o estado do React
      if (data.role === 'CAIXA') {
        window.location.href = "/caixa";
      } else {
        window.location.href = "/"; // Dashboard
      }

    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        
        <div className="bg-blue-600 p-8 text-center">
          <h1 className="text-3xl font-black text-white tracking-tighter">
            PDV <span className="text-blue-200">MASTER</span>
          </h1>
          <p className="text-blue-100 text-sm mt-2 font-medium">Acesso Restrito ao Sistema</p>
        </div>

        <div className="p-8">
          {erro && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-bold text-center mb-6 border border-red-100">
              <i className="fas fa-exclamation-circle mr-2"></i> {erro}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">E-mail de Acesso</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium text-slate-700"
                placeholder="admin@pdv.com"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Senha</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium text-slate-700"
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit" 
              disabled={carregando}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-lg transition-colors mt-4 shadow-md disabled:opacity-70 flex justify-center items-center gap-2"
            >
              {carregando ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-sign-in-alt"></i>}
              {carregando ? "Autenticando..." : "Entrar no Sistema"}
            </button>
          </form>
        </div>
        
      </div>
    </div>
  );
}