// components/Sidebar.jsx
import Link from 'next/link';

export default function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 text-white h-full flex flex-col shadow-xl">
      <div className="p-6 text-2xl font-black tracking-wider border-b border-slate-800 text-center">
        <span className="text-blue-500">PDV</span> MASTER
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2">
        <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
          <i className="fas fa-cash-register w-5"></i> Caixa
        </Link>
        <Link href="/estoque" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
          <i className="fas fa-boxes w-5"></i> Estoque
        </Link>
        <Link href="/clientes" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
          <i className="fas fa-users w-5"></i> Clientes
        </Link>
        <Link href="/financeiro" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
          <i className="fas fa-chart-pie w-5"></i> Financeiro
        </Link>
        <Link href="/categorias" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
          <i className="fas fa-tags w-5"></i> Categorias
        </Link>
      </nav>

      <div className="p-4 border-t border-slate-800 text-xs text-center text-slate-500">
        PDV Master v2.0 <br/> Next.js Edition
      </div>
    </aside>
  );
}