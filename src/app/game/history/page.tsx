"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function GameHistoryPage() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchResults() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/game/history');
        if (!res.ok) throw new Error('Erreur lors du chargement de l\'historique');
        const data = await res.json();
        setResults(data.results || []);
      } catch (e: any) {
        setError(e.message || 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    }
    fetchResults();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-8">
      <h1 className="text-3xl font-bold mb-6">Historique des parties</h1>
      <button onClick={() => router.push('/game')} className="mb-6 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-bold">Retour à l'accueil</button>
      {loading && <div>Chargement…</div>}
      {error && <div className="text-red-500">{error}</div>}
      {!loading && !error && results.length === 0 && <div>Aucun résultat trouvé.</div>}
      {!loading && !error && results.length > 0 && (
        <table className="w-full max-w-2xl bg-white rounded-xl shadow-lg overflow-hidden">
          <thead>
            <tr className="bg-gray-200 text-gray-700">
              <th className="py-2 px-4">Date</th>
              <th className="py-2 px-4">Gagnant</th>
              <th className="py-2 px-4">Perdant</th>
              <th className="py-2 px-4">Statut</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r, idx) => (
              <tr key={idx} className="text-center border-b last:border-b-0">
                <td className="py-2 px-4">{new Date(r.date_played).toLocaleString('fr-FR')}</td>
                <td className="py-2 px-4 font-bold text-green-700">{r.winner_username}</td>
                <td className="py-2 px-4 text-red-700">{r.looser_username}</td>
                <td className="py-2 px-4">
                  {r.isVictory ? <span className="text-green-600 font-bold">Victoire</span> : <span className="text-red-600 font-bold">Défaite</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
} 