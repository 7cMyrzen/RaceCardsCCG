"use client";

import { useEffect, useState } from "react";
import { GameBar } from "@/components/game/GameBar";
import Link from "next/link";
import Tilt3DCard from '@/components/game/TiltCard';
import { NewDeckModal } from "@/components/game/Modal";
import { useRouter } from 'next/navigation';
import React from 'react';

type Deck = {
  id: string;
  name: string;
  carCount: number;
  upgradeCount: number;
  DeckCar?: any[];
  is_active?: boolean;
};

function ConfirmDeleteModal({ open, onClose, onConfirm, deckName }: { open: boolean, onClose: () => void, onConfirm: () => void, deckName: string }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-xs flex flex-col gap-4">
        <h2 className="text-lg font-bold text-gray-800 text-center">Supprimer le deck ?</h2>
        <div className="text-center text-gray-700">Voulez-vous vraiment supprimer le deck <span className="font-bold">{deckName}</span> ?</div>
        <div className="flex gap-2 mt-2">
          <button onClick={onConfirm} className="flex-1 bg-red-600 text-white rounded py-1 font-semibold">Supprimer</button>
          <button onClick={onClose} className="flex-1 bg-gray-300 text-gray-700 rounded py-1 font-semibold">Annuler</button>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deckToDelete, setDeckToDelete] = useState<Deck | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const router = useRouter();
  const [activeDeckId, setActiveDeckId] = useState<string | null>(null);

  const fetchDecks = async () => {
    try {
      const res = await fetch("/api/game/deck", {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setDecks(data.decks);
        const active = data.decks.find((d: any) => d.is_active);
        setActiveDeckId(active ? active.id : null);
      } else {
        console.error("Erreur :", data.error);
      }
    } catch (err) {
      console.error("Erreur de récupération des decks :", err);
    }
  };

  useEffect(() => {
    fetchDecks();
  }, []);

  const handleCreateDeck = async (name: string) => {
    try {
      const res = await fetch("/api/game/deck", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });

      if (res.ok) {
        fetchDecks();
        setIsModalOpen(false);
      } else {
        const data = await res.json();
        alert("Erreur : " + data.error);
      }
    } catch (err) {
      console.error("Erreur de création :", err);
    }
  };

  const handleDeleteDeck = async () => {
    if (!deckToDelete) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      const res = await fetch("/api/game/deck", {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deckId: deckToDelete.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la suppression');
      setDeleteModalOpen(false);
      setDeckToDelete(null);
      fetchDecks();
    } catch (err: any) {
      setDeleteError(err.message || 'Erreur inconnue');
    } finally {
      setDeleteLoading(false);
    }
  };

  const canBeActive = (deck: Deck) => {
    if (!deck.DeckCar || deck.DeckCar.length === 0) return false;
    // On cherche une voiture de niveau 1 à 3 inclus
    return deck.DeckCar.some(dc => dc.CarCard && dc.CarCard.level >= 1 && dc.CarCard.level <= 3);
  };

  const handleSetActive = async (deck: Deck) => {
    if (!canBeActive(deck)) return;
    try {
      const res = await fetch("/api/game/deck", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deckId: deck.id, name: deck.name, is_active: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de l\'activation');
      fetchDecks();
    } catch (err) {
      alert(err.message || 'Erreur lors de l\'activation du deck');
    }
  };

  return (
    <div className="h-dvh w-screen flex flex-col overflow-hidden bg-gray-300 select-none relative">
      {/* Barre en haut */}
      <div className="h-[8%] w-full px-4 flex items-center justify-center bg-gray-200 shadow-sm">
        <div className="flex gap-2 w-full max-w-md mx-auto justify-center py-2">
          <button
            onClick={() => router.push('/game/deck/cards')}
            className="px-6 py-2 rounded-lg font-semibold transition-colors bg-gray-950 text-white hover:bg-gray-800 text-sm sm:text-base"
          >
            Voir toutes les cartes du jeu
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-2 rounded-lg font-semibold transition-colors bg-gray-950 text-white hover:bg-gray-800 text-sm sm:text-base"
          >
            + Nouveau deck
          </button>
        </div>
      </div>

      {/* Zone principale */}
      <div className="h-[82%] w-full p-2 overflow-y-auto flex flex-col items-center">
        <div className="w-full max-w-4xl flex flex-col gap-6">
          {[...decks].sort((a, b) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' })).map((deck) => {
            return (
              <div
                key={deck.id}
                className="relative w-full bg-white rounded-2xl shadow-lg flex flex-col sm:flex-row items-center gap-4 p-4 hover:shadow-2xl transition cursor-pointer group"
                onClick={e => {
                  if ((e.target as HTMLElement).closest('.btn-delete-deck')) return;
                  router.push(`/game/deck/${deck.id}`);
                }}
              >
                {/* Switch deck actif */}
                <div className="absolute top-2 left-2 z-20 flex items-center gap-1">
                  <button
                    type="button"
                    title={canBeActive(deck) ? (deck.id === activeDeckId ? 'Deck actif' : 'Définir comme deck actif') : 'Il faut au moins une voiture de niveau 1 à 3'}
                    className={`w-10 h-6 rounded-full border-2 flex items-center transition-colors duration-200 ${deck.id === activeDeckId ? 'bg-green-500 border-green-600' : 'bg-gray-200 border-gray-400'} ${canBeActive(deck) ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
                    onClick={e => { e.stopPropagation(); if (canBeActive(deck)) handleSetActive(deck); }}
                  >
                    <span className={`block w-5 h-5 rounded-full bg-white shadow transform transition-transform duration-200 ${deck.id === activeDeckId ? 'translate-x-4' : 'translate-x-0'}`}></span>
                  </button>
                </div>
                <button
                  type="button"
                  className="btn-delete-deck absolute top-2 right-2 z-20 bg-white rounded-full border border-red-400 w-8 h-8 flex items-center justify-center hover:bg-red-100 shadow"
                  title="Supprimer le deck"
                  onClick={e => { e.stopPropagation(); setDeckToDelete(deck); setDeleteModalOpen(true); }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-red-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <div className="flex-shrink-0 flex items-center justify-center w-[90px] h-[120px] sm:w-[120px] sm:h-[160px] md:w-[160px] md:h-[210px]">
                  <img
                    src="/images/cover.webp"
                    alt="Image du deck"
                    className="object-contain w-full h-full rounded-xl shadow"
                  />
                </div>
                <div className="flex-1 flex flex-col items-center sm:items-start">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 group-hover:text-green-700 transition">{deck.name}</h2>
                  <div className="flex gap-4 text-gray-600 text-sm sm:text-base mt-1">
                    <span>🚗 {deck.carCount} voiture{deck.carCount > 1 ? 's' : ''}</span>
                    <span>🛠️ {deck.upgradeCount} amélioration{deck.upgradeCount > 1 ? 's' : ''}</span>
                  </div>
                </div>
                <div className="hidden sm:block ml-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-gray-400 group-hover:text-green-700 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Barre de navigation */}
      <div className="h-[10%] w-[90%] max-w-md mx-auto mb-4">
        <GameBar />
      </div>

      {/* Modal de création de deck */}
      <NewDeckModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateDeck}
      />

      {/* Modal de confirmation suppression */}
      <ConfirmDeleteModal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} onConfirm={handleDeleteDeck} deckName={deckToDelete?.name || ''} />
    </div>
  );
}
