// app/layout.js
import Sidebar from '../components/Sidebar';
import './globals.css';

export const metadata = {
  title: 'PDV Master - Next.js',
  description: 'Sistema de Ponto de Venda e Gestão',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-br">
      <head>
        {/* Importando o FontAwesome que você já usava */}
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />
      </head>
      <body className="flex h-screen bg-slate-50 overflow-hidden font-sans">
        
        {/* A Sidebar fica fixa aqui na esquerda */}
        <Sidebar />
        
        {/* O conteúdo das páginas vai rolar aqui na direita */}
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
        
      </body>
    </html>
  );
}