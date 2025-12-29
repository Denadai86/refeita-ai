'use client'
import { useState, useEffect } from 'react';

export default function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) setShow(true);
  }, []);

  const accept = () => {
    localStorage.setItem('cookie-consent', 'true');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-2xl z-50">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-gray-600">
          Nós usamos cookies para personalizar anúncios e melhorar sua experiência. Ao continuar navegando, você concorda com nossa <a href="/privacidade" className="underline font-bold">Política de Privacidade</a>.
        </p>
        <button onClick={accept} className="bg-green-600 text-white px-8 py-2 rounded-full font-bold text-sm hover:bg-green-700 transition-colors">
          Aceitar e Continuar
        </button>
      </div>
    </div>
  );
}