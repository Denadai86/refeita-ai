import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-400 py-12 mt-auto">
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10 text-center md:text-left">
          {/* Logo e Slogan */}
          <div className="space-y-4">
            <h3 className="text-white font-black text-xl tracking-tighter">Refeita AI</h3>
            <p className="text-sm leading-relaxed">
              Transformando desperdício em gastronomia com o poder da inteligência artificial.
            </p>
          </div>

          {/* Links Rápidos */}
          <div className="flex flex-col gap-3">
            <h4 className="text-white font-bold text-sm uppercase tracking-widest">Explorar</h4>
            <Link href="/" className="hover:text-emerald-400 transition-colors">Gerar Receita</Link>
            <Link href="/sobre" className="hover:text-emerald-400 transition-colors">Sobre o Projeto</Link>
          </div>

          {/* Legal */}
          <div className="flex flex-col gap-3">
            <h4 className="text-white font-bold text-sm uppercase tracking-widest">Legal</h4>
            <Link href="/privacidade" className="hover:text-emerald-400 transition-colors">Privacidade</Link>
            <Link href="/termos" className="hover:text-emerald-400 transition-colors">Termos de Uso</Link>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-800 text-center flex flex-col items-center gap-4">
          <p className="text-xs">
            © {currentYear} Refeita AI — Um projeto do portal{' '}
            <a href="https://acaoleve.com" target="_blank" className="text-emerald-400 font-bold hover:underline">
              Ação Leve
            </a>
          </p>
          <div className="flex gap-4 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all">
             {/* Aqui você pode colocar mini ícones de redes sociais no futuro */}
          </div>
        </div>
      </div>
    </footer>
  );
}