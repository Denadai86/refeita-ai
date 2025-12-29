export default function TermosPage() {
  return (
    <main className="max-w-3xl mx-auto py-16 px-6 prose prose-slate">
      <h1 className="text-3xl font-black mb-8 text-gray-900">Termos de Uso</h1>
      
      <section className="space-y-6 text-gray-700">
        <p>
          Ao acessar o site <strong>Refeita.AI</strong>, você concorda em cumprir estes termos de serviço, todas as leis e regulamentos aplicáveis.
        </p>

        <h2 className="text-xl font-bold text-gray-800">1. Uso de Licença</h2>
        <p>
          É concedida permissão para baixar temporariamente uma cópia dos materiais (informações ou software) no site Refeita.AI, apenas para visualização pessoal e não comercial.
        </p>

        <h2 className="text-xl font-bold text-gray-800">2. Isenção de Responsabilidade</h2>
        <p className="bg-yellow-50 p-4 border-l-4 border-yellow-400 italic">
          As receitas exibidas são geradas por Inteligência Artificial (IA). O Refeita.AI não garante a precisão, segurança ou resultados culinários. É de total responsabilidade do usuário verificar a validade dos ingredientes, condições de higiene e possíveis alergias antes do preparo e consumo.
        </p>

        <h2 className="text-xl font-bold text-gray-800">3. Limitações</h2>
        <p>
          Em nenhum caso o Refeita.AI ou seus fornecedores serão responsáveis por quaisquer danos decorrentes do uso ou da incapacidade de usar os materiais em nosso site.
        </p>

        <h2 className="text-xl font-bold text-gray-800">4. Precisão dos Materiais</h2>
        <p>
          Os materiais exibidos no site podem incluir erros técnicos, tipográficos ou fotográficos. O Refeita.AI não garante que qualquer material em seu site seja preciso, completo ou atual.
        </p>
      </section>

      <footer className="mt-12 pt-8 border-t text-sm text-gray-500">
        Última atualização: 29 de Dezembro de 2025.
      </footer>
    </main>
  );
}