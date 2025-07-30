'use client';

import { useState } from 'react';

export default function TestPage() {
  const [result, setResult] = useState<string>('');

  const testLogin = async () => {
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: 'admin@rockfeller.com.br', 
          password: 'admin123', 
          type: 'school' 
        }),
      });

      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(`Erro: ${error}`);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Teste de Login</h1>
      <button 
        onClick={testLogin}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
      >
        Testar Login
      </button>
      <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
        {result || 'Clique no botão para testar'}
      </pre>
    </div>
  );
} 