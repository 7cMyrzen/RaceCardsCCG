"use client";

import { useState, useEffect } from 'react';
import Tilt3DCard from '@/components/game/TiltCard';

export default function ShopPage() {
  const [opening, setOpening] = useState(false);
  const [openedCard, setOpenedCard] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [credits, setCredits] = useState<number | null>(null);

  useEffect(() => {
    async function fetchCredits() {
      try {
        const res = await fetch('/api/game/profile');
        if (!res.ok) return;
        const data = await res.json();
        setCredits(data.user.money);
      } catch {}
    }
    fetchCredits();
  }, []);

  const handleBuyBooster = async () => {
    setError(null);
    setOpening(true);
    setOpenedCard(null);
    try {
      const res = await fetch('/api/game/shop/buy-booster', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Erreur');
        setOpening(false);
        return;
      }
      setTimeout(() => {
        setOpenedCard(data.card);
        setOpening(false);
        setCredits((c) => (typeof c === 'number' ? c - 500 : c));
      }, 1500); // Animation 1.5s
    } catch (e: any) {
      setError(e.message || 'Erreur');
      setOpening(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center w-full max-w-md">
        <div className="flex items-center justify-between w-full mb-6">
          <h1 className="text-3xl font-bold">Boutique</h1>
          <div className="flex items-center gap-2 text-lg font-semibold bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            <span>💰</span>
            <span>{credits !== null ? credits : '...'}</span>
          </div>
        </div>
        <p className="mb-8 text-gray-700 text-center">Achetez des boosters pour obtenir de nouvelles cartes !<br />1 booster = 1 carte aléatoire</p>
        <div className="flex flex-col gap-8 w-full">
          <div className="flex flex-row items-center justify-between w-full bg-blue-50 rounded-lg p-4 shadow">
            <div>
              <div className="text-xl font-bold">Booster unique</div>
              <div className="text-gray-600">1 carte</div>
            </div>
            <div className="flex flex-col items-end">
              <div className="text-lg font-bold text-blue-700">500 💰</div>
              <button className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-bold" onClick={handleBuyBooster} disabled={opening}>Acheter</button>
            </div>
          </div>
          <div className="flex flex-row items-center justify-between w-full bg-purple-50 rounded-lg p-4 shadow">
            <div>
              <div className="text-xl font-bold">Pack 10 boosters</div>
              <div className="text-gray-600">10 cartes</div>
            </div>
            <div className="flex flex-col items-end">
              <div className="text-lg font-bold text-purple-700">4000 💰</div>
              <button className="mt-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded font-bold">Acheter</button>
            </div>
          </div>
        </div>
      </div>
      {opening && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-2xl p-8 flex flex-col items-center animate-pulse">
            <div className="text-3xl mb-4">🎁</div>
            <div className="text-xl font-bold mb-2">Ouverture du booster…</div>
          </div>
        </div>
      )}
      {openedCard && (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-2xl p-8 flex flex-col items-center">
            <div className="text-3xl mb-4">🎉</div>
            <div className="text-xl font-bold mb-4">Tu as gagné :</div>
            <Tilt3DCard
              imageUrl={
                openedCard.type === 'car'
                  ? `/images/cards/car/${openedCard.img_path}`
                  : `/images/cards/upgrade/${openedCard.img_path}`
              }
            />
            <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-bold" onClick={() => setOpenedCard(null)}>Fermer</button>
          </div>
        </div>
      )}
      {error && <div className="text-red-500 mt-4">{error}</div>}
    </div>
  );
}
