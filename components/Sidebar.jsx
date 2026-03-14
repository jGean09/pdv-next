// components/Sidebar.jsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);

  const menuItems = [
    { name: "Dashboard", path: "/", icon: "fas fa-home" },
    { name: "Caixa", path: "/caixa", icon: "fas fa-cash-register" },
    { name: "Estoque", path: "/estoque", icon: "fas fa-boxes" },
    { name: "Clientes", path: "/clientes", icon: "fas fa-users" },
    { name: "Financeiro", path: "/financeiro", icon: "fas fa-chart-pie" },
    { name: "Categorias", path: "/categorias", icon: "fas fa-tags" },
  ];

  // LOGOUT PROFISSIONAL: Chama a API e limpa o navegador
  const handleLogout = async () => {
    if (confirm("Deseja realmente sair do sistema?")) {
      try {
        // 1. Chama a API de Logout no servidor
        const res = await fetch("/api/auth/logout", { method: "POST" });
        
        if (res.ok) {
          // 2. Limpa o navegador (Cookie por garantia + Storages)
          document.cookie = "pdv_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax";
          localStorage.clear();
          sessionStorage.clear();
          
          // 3. Redirecionamento total
          window.location.href = "/login";
        } else {
          alert("Erro ao encerrar sessão no servidor.");
        }
      } catch (error) {
        console.error("Erro ao deslogar:", error);
        // Fallback: se a rede falhar, limpa o cliente e sai
        window.location.href = "/login";
      }
    }
  };

  return (
    <aside className={`${isOpen ? 'w-64' : 'w-20'} bg-slate-900 text-white flex flex-col transition-all duration-300 relative h-screen shadow-2xl`}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="absolute -right-3 top-8 bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center shadow-md z-10 hover:bg-blue-500"
      >
        <i className={`fas fa-chevron-${isOpen ? 'left' : 'right'} text-xs`}></i>
      </button>

      <div className="p-6 border-b border-slate-800 flex items-center h-20 overflow-hidden">
        <h1 className={`text-2xl font-black text-blue-500 tracking-tighter transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
          PDV <span className="text-white">MASTER</span>
        </h1>
        {!isOpen && (
           <h1 className="text-2xl font-black text-blue-500 tracking-tighter absolute left-1/2 -translate-x-1/2">
             P<span className="text-white">M</span>
           </h1>
        )}
      </div>

      <nav className="flex-1 py-6 overflow-y-auto">
        <ul className="space-y-2 px-3">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={`flex items-center gap-4 px-4 py-3 rounded-lg font-medium transition-all ${
                    isActive 
                      ? "bg-blue-600/10 text-blue-400 border border-blue-600/20 shadow-sm" 
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <i className={`${item.icon} text-lg w-5 text-center ${isActive ? "text-blue-500" : ""}`}></i>
                  <span className={`transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
                    {item.name}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center justify-between bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center shrink-0 border border-slate-600">
              <i className="fas fa-user-shield text-xs text-slate-300"></i>
            </div>
            {isOpen && (
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-slate-200 truncate leading-none">Admin</p>
                <p className="text-[10px] text-emerald-400 font-black uppercase mt-1 tracking-widest">Online</p>
              </div>
            )}
          </div>
          
          <button 
            type="button" 
            onClick={handleLogout}
            className="text-red-400 hover:text-red-500 p-2 transition-colors cursor-pointer hover:bg-red-500/10 rounded-lg"
            title="Sair do Sistema"
          >
            <i className="fas fa-sign-out-alt text-xl"></i>
          </button>
        </div>
      </div>
    </aside>
  );
}