"use client";

import { useEffect, useState } from 'react';
import Pusher from 'pusher-js';
import { useRouter } from 'next/navigation';

export default function RacePage() {
  const [status, setStatus] = useState<'idle' | 'waiting' | 'matched' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [deckId, setDeckId] = useState<string | null>(null);
  const router = useRouter();

  // Récupère le deck actif
  useEffect(() => {
    const fetchActiveDeck = async () => {
      try {
        const res = await fetch('/api/game/deck', { credentials: 'include' });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Erreur API');
        const active = data.decks.find((d: any) => d.is_active);
        if (active) setDeckId(active.id);
        else setError("Aucun deck actif trouvé.");
      } catch (err: any) {
        setError(err.message || "Erreur lors du chargement du deck actif.");
      }
    };
    fetchActiveDeck();
  }, []);

  // Matchmaking
  useEffect(() => {
    if (!deckId) return;
    let pusher: Pusher | null = null;
    let channel: any = null;

    const startMatchmaking = async () => {
      setStatus('waiting');
      setError(null);

      const res = await fetch('/api/game/matchmaking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ deckId }),
      });
      const data = await res.json();

      if (data.status === 'waiting') {
        pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
          cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
        });
        channel = pusher.subscribe(`user-${data.userId}`);

        channel.bind('match-found', (payload: any) => {
          setStatus('matched');
          if (payload.userId) localStorage.setItem('userId', payload.userId);
          if (payload.deck) {
            sessionStorage.setItem('myDeck', JSON.stringify(payload.deck));
          }
          router.push(`/game/race/${payload.gameId}?circuit=${payload.circuit}`);
        });
      } else if (data.status === 'matched') {
        setStatus('matched');
        if (data.userId) localStorage.setItem('userId', data.userId);
        if (data.deck) {
          sessionStorage.setItem('myDeck', JSON.stringify(data.deck));
        }
        router.push(`/game/race/${data.gameId}?circuit=${data.circuit}`);
      } else {
        setStatus('error');
        setError(data.error || 'Erreur matchmaking');
      }
    };

    startMatchmaking();

    return () => {
      if (channel) channel.unbind_all();
      if (pusher) pusher.disconnect();
    };
  }, [deckId, router]);

  // UI
  if (status === 'waiting') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
          <span className="w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
          <span className="w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
        </div>
        <div className="text-lg font-semibold text-gray-800">Recherche d'un adversaire…</div>
        <div className="text-gray-500 text-sm mt-2">Reste sur cette page, tu seras redirigé automatiquement dès qu'un match est trouvé.</div>
      </div>
    );
  }
  if (status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded shadow max-w-md text-center">
          <div className="font-bold mb-2">Erreur</div>
          <div>{error}</div>
        </div>
        <button
          className="mt-6 px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-700"
          onClick={() => window.location.reload()}
        >
          Réessayer
        </button>
      </div>
    );
  }
  if (status === 'idle') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-gray-700">Chargement…</div>
      </div>
    );
  }
  return null;
}