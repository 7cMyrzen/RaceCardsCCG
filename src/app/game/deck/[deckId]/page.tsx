'use client';

import { GameBar } from '@/components/game/GameBar';
import Tilt3DCard from '@/components/game/TiltCard';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import React from 'react';

function AddCardModal({ open, onClose, onAdd, deckCards }: { open: boolean, onClose: () => void, onAdd: (type: string, cardId: string) => Promise<void>, deckCards: any[] }) {
  const [type, setType] = useState<'car' | 'upgrade'>('car');
  const [ownedCars, setOwnedCars] = useState<any[]>([]);
  const [ownedUpgrades, setOwnedUpgrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addError, setAddError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError(null);
    setAddError(null);
    fetch('/api/game/get-cards', { credentials: 'include' })
      .then(async res => {
        if (!res.ok) throw new Error('Erreur API');
        const data = await res.json();
        setOwnedCars((data.cars || []).map((c: any) => ({ ...c, type: 'car' })));
        setOwnedUpgrades((data.upgrades || []).map((u: any) => ({ ...u, type: 'upgrade' })));
      })
      .catch(() => setError('Erreur de chargement des cartes possédées'))
      .finally(() => setLoading(false));
  }, [open]);

  // IDs déjà dans le deck
  const deckCarIds = deckCards.filter(c => c.type === 'car').map(c => c.id);
  const deckUpgradeIds = deckCards.filter(c => c.type === 'upgrade').map(c => c.id);

  // Cartes filtrées
  const availableCars = ownedCars.filter(c => !deckCarIds.includes(c.id));
  const availableUpgrades = ownedUpgrades.filter(u => !deckUpgradeIds.includes(u.id));

  const handleAdd = async (card: any) => {
    setAddError(null);
    try {
      await onAdd(card.type, card.id);
      onClose();
    } catch (err: any) {
      setAddError(err.message || 'Erreur inconnue');
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold text-gray-800 text-center">Ajouter une carte</h2>
        <div className="flex gap-2 justify-center mb-2">
          <button type="button" onClick={() => setType('car')} className={`px-3 py-1 rounded ${type === 'car' ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-700'}`}>Voiture</button>
          <button type="button" onClick={() => setType('upgrade')} className={`px-3 py-1 rounded ${type === 'upgrade' ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-700'}`}>Amélioration</button>
        </div>
        {loading ? (
          <div className="text-center text-gray-500">Chargement...</div>
        ) : error ? (
          <div className="text-center text-red-600">{error}</div>
        ) : (
          <>
            {type === 'car' ? (
              <div className="grid grid-cols-2 gap-3">
                {availableCars.length > 0 ? availableCars.map(card => (
                  <button key={card.id} type="button" onClick={() => handleAdd(card)} className="flex flex-col items-center bg-gray-100 rounded-lg p-2 hover:bg-green-100 transition">
                    <div className="w-full max-w-[100px] mx-auto">
                      <Tilt3DCard imageUrl={`/images/cards/car/${card.img_path}`} />
                    </div>
                    <span className="mt-1 text-xs font-semibold text-gray-800 truncate w-full max-w-[100px]">{card.name}</span>
                  </button>
                )) : <div className="col-span-2 text-center text-gray-400">Aucune voiture disponible</div>}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {availableUpgrades.length > 0 ? availableUpgrades.map(card => (
                  <button key={card.id} type="button" onClick={() => handleAdd(card)} className="flex flex-col items-center bg-gray-100 rounded-lg p-2 hover:bg-green-100 transition">
                    <div className="w-full max-w-[100px] mx-auto">
                      <Tilt3DCard imageUrl={`/images/cards/upgrade/${card.img_path}`} />
                    </div>
                    <span className="mt-1 text-xs font-semibold text-gray-800 truncate w-full max-w-[100px]">{card.name}</span>
                  </button>
                )) : <div className="col-span-2 text-center text-gray-400">Aucune amélioration disponible</div>}
              </div>
            )}
            {addError && <div className="text-center text-red-600 mt-2">{addError}</div>}
          </>
        )}
        <button type="button" className="mt-4 bg-gray-300 text-gray-700 rounded py-1 font-semibold" onClick={onClose}>Annuler</button>
      </div>
    </div>
  );
}

function ConfirmModal({ open, onClose, onConfirm, card }: { open: boolean, onClose: () => void, onConfirm: () => void, card: any }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-xs flex flex-col gap-4">
        <h2 className="text-lg font-bold text-gray-800 text-center">Retirer la carte ?</h2>
        <div className="flex flex-col items-center gap-2">
          <div className="w-[80px]">
            {card && card.img_path && (
              <Tilt3DCard imageUrl={card.type === 'car' ? `/images/cards/car/${card.img_path}` : `/images/cards/upgrade/${card.img_path}`} />
            )}
          </div>
          <span className="text-center font-semibold text-gray-800 text-sm">{card && card.name}</span>
        </div>
        <div className="flex gap-2 mt-2">
          <button onClick={onConfirm} className="flex-1 bg-red-600 text-white rounded py-1 font-semibold">Retirer</button>
          <button onClick={onClose} className="flex-1 bg-gray-300 text-gray-700 rounded py-1 font-semibold">Annuler</button>
        </div>
      </div>
    </div>
  );
}

export default function EditDeckPage() {
  const { deckId } = useParams();
  const router = useRouter();
  const [deck, setDeck] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [cards, setCards] = useState<any[]>([]);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [addLoading, setAddLoading] = useState(false);
  const [cardToRemove, setCardToRemove] = useState<any | null>(null);
  const [removeModalOpen, setRemoveModalOpen] = useState(false);
  const [removeError, setRemoveError] = useState<string | null>(null);
  const [removeLoading, setRemoveLoading] = useState(false);

  useEffect(() => {
    const fetchDeck = async () => {
      try {
        const res = await fetch('/api/game/deck', { credentials: 'include' });
        const data = await res.json();
        const foundDeck = data.decks.find((d: any) => d.id === deckId);
        if (foundDeck) {
          setDeck(foundDeck);
          setName(foundDeck.name);
        }
        setLoading(false);
      } catch (error) {
        console.error('Erreur chargement deck :', error);
      }
    };

    const fetchCards = async () => {
      try {
        const res = await fetch(`/api/game/deck/get-cards?deckId=${deckId}`, { credentials: 'include' });
        const data = await res.json();
        setCards(data.cards || []);
      } catch (error) {
        console.error('Erreur chargement cartes :', error);
      }
    };

    if (deckId) {
      fetchDeck();
      fetchCards();
    }
  }, [deckId]);

  const handleAddCard = async (type: string, cardId: string) => {
    setAddLoading(true);
    setAddError(null);
    try {
      const res = await fetch('/api/game/deck/add-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ deckId, cardId, type }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de l\'ajout');
      }
      // On recharge les cartes
      const cardsRes = await fetch(`/api/game/deck/get-cards?deckId=${deckId}`, { credentials: 'include' });
      const cardsData = await cardsRes.json();
      setCards(cardsData.cards || []);
    } catch (err: any) {
      setAddError(err.message || 'Erreur inconnue');
      throw err;
    } finally {
      setAddLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      const res = await fetch('/api/game/deck', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ deckId, name }),
      });
      if (res.ok) {
        alert('Deck mis à jour');
        router.push('/game/deck');
      } else {
        const error = await res.json();
        alert(error.error || 'Erreur lors de la mise à jour');
      }
    } catch (err) {
      console.error('Erreur mise à jour :', err);
    }
  };

  const handleRemoveCard = async () => {
    if (!cardToRemove) return;
    setRemoveLoading(true);
    setRemoveError(null);
    try {
      const res = await fetch('/api/game/deck/remove-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ deckId, cardId: cardToRemove.id, type: cardToRemove.type }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors du retrait');
      // Recharge les cartes
      const cardsRes = await fetch(`/api/game/deck/get-cards?deckId=${deckId}`, { credentials: 'include' });
      const cardsData = await cardsRes.json();
      setCards(cardsData.cards || []);
      setRemoveModalOpen(false);
      setCardToRemove(null);
    } catch (err: any) {
      setRemoveError(err.message || 'Erreur inconnue');
    } finally {
      setRemoveLoading(false);
    }
  };

  if (loading) return <div>Chargement...</div>;
  if (!deck) return <div>Deck introuvable</div>;

  return (
    <div className="h-dvh w-screen flex flex-col overflow-hidden bg-gray-300 select-none">
      {/* Modal d'ajout */}
      <AddCardModal open={addModalOpen} onClose={() => setAddModalOpen(false)} onAdd={handleAddCard} deckCards={cards} />
      {/* Modal de confirmation */}
      <ConfirmModal open={removeModalOpen} onClose={() => setRemoveModalOpen(false)} onConfirm={handleRemoveCard} card={cardToRemove || {}} />
      {/* Zone principale centrée et scrollable */}
      <div className="flex-1 w-full p-2 overflow-y-auto flex flex-col items-center">
        <div className="w-full max-w-5xl flex flex-col gap-8 bg-white rounded-2xl shadow p-4">
          {/* Section Véhicules */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2 ml-2">Véhicules</h3>
            <div className="flex flex-wrap justify-center gap-4">
              {cards.filter(c => c.type === 'car').length > 0 ? (
                cards.filter(c => c.type === 'car').map((card, idx) => {
                  let imageUrl = `/images/cards/car/${card.img_path}`;
                  return (
                    <div key={card.type + '-' + card.id + '-' + idx} className="relative flex flex-col items-center bg-white rounded-xl shadow-sm py-2 px-2 w-[120px] sm:w-[150px] md:w-[180px]">
                      {/* Bouton retirer */}
                      <button
                        type="button"
                        className="absolute top-1 right-1 z-10 bg-white rounded-full border border-red-400 w-6 h-6 flex items-center justify-center hover:bg-red-100"
                        title="Retirer la carte du deck"
                        onClick={() => { setCardToRemove(card); setRemoveModalOpen(true); }}
                        style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
                      >
                        <span className="text-red-600 text-lg leading-none font-bold">-</span>
                      </button>
                      <Tilt3DCard imageUrl={imageUrl} />
                      <span className="mt-1 text-center font-semibold text-gray-800 text-xs sm:text-sm truncate w-full max-w-[120px] sm:max-w-[150px] md:max-w-[180px]">
                        {card.name}
                      </span>
                    </div>
                  );
                })
              ) : (
                <p className="text-center text-gray-500">Aucun véhicule dans ce deck</p>
              )}
            </div>
          </div>
          {/* Section Améliorations */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2 ml-2">Améliorations</h3>
            <div className="flex flex-wrap justify-center gap-4">
              {cards.filter(c => c.type === 'upgrade').length > 0 ? (
                cards.filter(c => c.type === 'upgrade').map((card, idx) => {
                  let imageUrl = `/images/cards/upgrade/${card.img_path}`;
                  return (
                    <div key={card.type + '-' + card.id + '-' + idx} className="relative flex flex-col items-center bg-white rounded-xl shadow-sm py-2 px-2 w-[120px] sm:w-[150px] md:w-[180px]">
                      {/* Bouton retirer */}
                      <button
                        type="button"
                        className="absolute top-1 right-1 z-10 bg-white rounded-full border border-red-400 w-6 h-6 flex items-center justify-center hover:bg-red-100"
                        title="Retirer la carte du deck"
                        onClick={() => { setCardToRemove(card); setRemoveModalOpen(true); }}
                        style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
                      >
                        <span className="text-red-600 text-lg leading-none font-bold">-</span>
                      </button>
                      <Tilt3DCard imageUrl={imageUrl} />
                      <span className="mt-1 text-center font-semibold text-gray-800 text-xs sm:text-sm truncate w-full max-w-[120px] sm:max-w-[150px] md:max-w-[180px]">
                        {card.name}
                      </span>
                    </div>
                  );
                })
              ) : (
                <p className="text-center text-gray-500">Aucune amélioration dans ce deck</p>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Barre de navigation en bas */}
      <div className="h-[10%] w-[90%] max-w-md mx-auto mb-4">
        <GameBar />
      </div>
      {/* Sticky bouton ajouter carte */}
      <button
        onClick={() => setAddModalOpen(true)}
        className="fixed bottom-24 right-4 z-40 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg p-4 flex items-center justify-center transition-all"
        style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}
        aria-label="Ajouter une carte"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </button>
    </div>
  );
}
