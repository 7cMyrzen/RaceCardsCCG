"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GameBar } from '@/components/game/GameBar';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchUser() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/game/profile');
        if (!res.ok) throw new Error('Erreur lors du chargement du profil');
        const data = await res.json();
        setUser(data.user);
      } catch (e: any) {
        setError(e.message || 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-8">
      <h1 className="text-3xl font-bold mb-6">Mon Profil</h1>
      {loading && <div>Chargement…</div>}
      {error && <div className="text-red-500">{error}</div>}
      {!loading && !error && user && (
        <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center w-full max-w-md">
          <img
            src={`/images/profiles/${user.profile_pic || 1}.png`}
            alt="Avatar"
            className="w-32 h-32 rounded-full mb-4 border-4 border-blue-400 shadow"
          />
          <div className="text-xl font-bold mb-2">{user.username}</div>
          <div className="text-gray-600 mb-2">{user.email}</div>
          <div className="flex flex-row gap-8 my-4">
            <div className="text-green-700 font-bold">🏆 {user.nb_victoires} victoires</div>
            <div className="text-red-700 font-bold">❌ {user.nb_defaites} défaites</div>
          </div>
          <div className="flex flex-row gap-4 mt-6">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-bold"
              onClick={() => router.push('/game/deck')}
            >
              Mes decks
            </button>
            <button
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded font-bold"
              onClick={() => router.push('/game/history')}
            >
              Historique
            </button>
          </div>
        </div>
      )}
      <div className="h-[10%] w-[90%] max-w-md mx-auto fixed bottom-0">
        <GameBar />
      </div>
    </div>
  );
} 