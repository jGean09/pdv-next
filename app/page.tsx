// app/page.js
export default function Home() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-800 mb-2">Frente de Caixa</h1>
      <p className="text-slate-500">Bem-vindo ao novo PDV Master.</p>
      
      <div className="mt-8 p-6 bg-white rounded-xl shadow-sm border border-slate-100">
        <p className="text-slate-600">
          A interface do caixa será reconstruída aqui usando React e Tailwind.
        </p>
      </div>
    </div>
  );
}