// components/Sidebar.jsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  // Estado que controla se o menu está aberto ou fechado
  const [isOpen, setIsOpen] = useState(true);

  const menuItems = [
    { name: "Dashboard", path: "/", icon: "fas fa-home" },
    { name: "Caixa", path: "/caixa", icon: "fas fa-cash-register" },
    { name: "Estoque", path: "/estoque", icon: "fas fa-boxes" },
    { name: "Clientes", path: "/clientes", icon: "fas fa-users" },
    { name: "Financeiro", path: "/financeiro", icon: "fas fa-chart-pie" },
    { name: "Categorias", path: "/categorias", icon: "fas fa-tags" },
  ];

  return (
    <aside 
      className={`${isOpen ? 'w-64' : 'w-20'} bg-slate-900 text-white flex flex-col transition-all duration-300 relative`}
    >
      {/* Botão de abrir/fechar o menu */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="absolute -right-3 top-8 bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center shadow-md hover:bg-blue-500 z-10 transition-transform"
        style={{ transform: isOpen ? 'rotate(0deg)' : 'rotate(180deg)' }}
      >
        <i className="fas fa-chevron-left text-xs"></i>
      </button>

      {/* Cabeçalho do Menu */}
      <div className="p-6 border-b border-slate-800 min-h-[5rem] flex items-center overflow-hidden">
        <h1 className={`text-2xl font-black text-blue-500 tracking-tighter whitespace-nowrap transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
          PDV <span className="text-white">MASTER</span>
        </h1>
        {/* Ícone pequeno quando fechado */}
        {!isOpen && (
           <h1 className="text-2xl font-black text-blue-500 tracking-tighter absolute left-1/2 -translate-x-1/2">
             P<span className="text-white">M</span>
           </h1>
        )}
      </div>

      {/* Links de Navegação */}
      <nav className="flex-1 py-6">
        <ul className="space-y-2 px-3">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={`flex items-center gap-4 px-4 py-3 rounded-lg font-medium transition-all
                    ${isActive 
                      ? "bg-blue-600/10 text-blue-400 border border-blue-600/20" 
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                    }`}
                  title={!isOpen ? item.name : ""}
                >
                  <i className={`${item.icon} text-lg w-5 text-center ${isActive ? "text-blue-500" : ""}`}></i>
                  <span className={`whitespace-nowrap transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
                    {item.name}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Rodapé do Menu */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center shrink-0">
            <span className="font-bold text-slate-300 text-sm">N</span>
          </div>
          <div className={`overflow-hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
            <p className="text-sm font-bold text-slate-200 whitespace-nowrap">PDV Master v2.0</p>
            <p className="text-xs text-slate-500 whitespace-nowrap">Next.js Edition</p>
          </div>
        </div>
      </div>
    </aside>
  );
}