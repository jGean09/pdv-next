"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Verificação real: o cookie pdv_session existe? 
    // E o servidor nos disse que somos ADMIN?
    // Para simplificar agora e resolver seu problema visual:
    const checkAdmin = document.cookie.includes("role=ADMIN") || 
                       !document.cookie.includes("role=CAIXA"); 
    setIsAdmin(checkAdmin);
  }, []);

  const allMenuItems = [
    { name: "Dashboard", path: "/", icon: "fas fa-home", roles: ["ADMIN"] },
    { name: "Caixa", path: "/caixa", icon: "fas fa-cash-register", roles: ["ADMIN", "CAIXA"] },
    { name: "Estoque", path: "/estoque", icon: "fas fa-boxes", roles: ["ADMIN"] },
    { name: "Clientes", path: "/clientes", icon: "fas fa-users", roles: ["ADMIN"] },
    { name: "Financeiro", path: "/financeiro", icon: "fas fa-chart-pie", roles: ["ADMIN"] },
    { name: "Categorias", path: "/categorias", icon: "fas fa-tags", roles: ["ADMIN"] },
    { name: "Usuários", path: "/usuarios", icon: "fas fa-user-cog", roles: ["ADMIN"] },
  ];

  // FILTRO CORRIGIDO:
  // Se montou e for ADMIN, vê tudo. Se for CAIXA, vê apenas o que é dele.
  const filteredMenu = allMenuItems.filter(item => {
    if (!mounted) return item.roles.includes("CAIXA");
    if (isAdmin) return true; // ADMIN vê a lista inteira sempre
    return item.roles.includes("CAIXA"); // CAIXA vê só o PDV
  });

  const handleLogout = async () => {
    if (confirm("Deseja realmente sair?")) {
      await fetch("/api/auth/logout", { method: "POST" });
      document.cookie = "pdv_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
      document.cookie = "role=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
      window.location.href = "/login";
    }
  };

  if (!mounted) return <aside className="w-20 bg-slate-900 h-screen" />;

  return (
    <aside className={`${isOpen ? 'w-64' : 'w-20'} bg-slate-900 text-white flex flex-col transition-all duration-300 h-screen shadow-2xl relative`}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="absolute -right-3 top-8 bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center shadow-md z-10"
      >
        <i className={`fas fa-chevron-${isOpen ? 'left' : 'right'} text-xs`}></i>
      </button>

      <div className="p-6 border-b border-slate-800 flex items-center h-20 overflow-hidden">
        <h1 className={`text-2xl font-black text-blue-500 tracking-tighter transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
          PDV <span className="text-white">MASTER</span>
        </h1>
      </div>

      <nav className="flex-1 py-6 overflow-y-auto">
        <ul className="space-y-2 px-3">
          {filteredMenu.map((item) => (
            <li key={item.path}>
              <Link
                href={item.path}
                className={`flex items-center gap-4 px-4 py-3 rounded-lg font-medium transition-all ${pathname === item.path ? "bg-blue-600/10 text-blue-400 border border-blue-600/20" : "text-slate-400 hover:text-white hover:bg-slate-800"}`}
              >
                <i className={`${item.icon} text-lg w-5 text-center`}></i>
                {isOpen && <span>{item.name}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center justify-between bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center shrink-0">
              <i className="fas fa-user-shield text-xs text-blue-400"></i>
            </div>
            {isOpen && <span className="text-xs font-black uppercase tracking-widest">{isAdmin ? "Admin" : "Caixa"}</span>}
          </div>
          <button onClick={handleLogout} className="text-red-400 hover:text-red-500 p-2 transition-colors">
            <i className="fas fa-sign-out-alt text-xl"></i>
          </button>
        </div>
      </div>
    </aside>
  );
}