'use client';

import { useEffect, useState } from 'react';
import { GameBar } from "@/components/game/GameBar";
import Tilt3DCard from '@/components/game/TiltCard';
import { Modal2 } from '@/components/game/Modal';
import { Tabs } from '@/components/game/Tabs';

type CardType = 'car' | 'upgrade';

interface Card {
  id: number;
  name: string;
  img_path: string;
  type: CardType;
  [key: string]: any;
}

export default function Page() {
  const [ownedCars, setOwnedCars] = useState<Card[]>([]);
  const [ownedUpgrades, setOwnedUpgrades] = useState<Card[]>([]);
  const [allCars, setAllCars] = useState<Card[]>([]);
  const [allUpgrades, setAllUpgrades] = useState<Card[]>([]);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [loadingOwned, setLoadingOwned] = useState(true);
  const [loadingAll, setLoadingAll] = useState(true);
  const [errorOwned, setErrorOwned] = useState<string | null>(null);
  const [errorAll, setErrorAll] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'owned' | 'all'>('owned');

  useEffect(() => {
    const fetchOwnedCards = async () => {
      try {
        setLoadingOwned(true);
        setErrorOwned(null);
        const res = await fetch('/api/game/get-cards', { credentials: 'include' });
        if (!res.ok) {
          const errData = await res.json();
          setErrorOwned(errData.error || 'Erreur inconnue');
          setLoadingOwned(false);
          return;
        }
        const data = await res.json();
        setOwnedCars((data.cars || []).map((car: any) => ({ ...car, type: 'car' })));
        setOwnedUpgrades((data.upgrades || []).map((upgrade: any) => ({ ...upgrade, type: 'upgrade' })));
      } catch {
        setErrorOwned('Erreur de chargement');
      } finally {
        setLoadingOwned(false);
      }
    };

    const fetchAllCards = async () => {
      try {
        setLoadingAll(true);
        setErrorAll(null);
        const res = await fetch('/api/game/get-all-cards');
        if (!res.ok) {
          const errData = await res.json();
          setErrorAll(errData.error || 'Erreur inconnue');
          setLoadingAll(false);
          return;
        }
        const data = await res.json();
        setAllCars((data.cars || []).map((car: any) => ({ ...car, type: 'car' })));
        setAllUpgrades((data.upgrades || []).map((upgrade: any) => ({ ...upgrade, type: 'upgrade' })));
      } catch {
        setErrorAll('Erreur de chargement');
      } finally {
        setLoadingAll(false);
      }
    };

    fetchOwnedCards();
    fetchAllCards();
  }, []);

  const getImageUrl = (card: Card) => {
    if (card.type === 'car') return `/images/cards/car/${card.img_path}`;
    if (card.type === 'upgrade') return `/images/cards/upgrade/${card.img_path}`;
    return '/images/cards/default.png';
  };

  if (loadingOwned || loadingAll) {
    return (
      <div className="bg-gray-300 min-h-screen w-full flex items-center justify-center select-none">
        <span className="text-gray-700 text-xl font-semibold flex items-center">
          Chargement
          <span className="dot-anim ml-1">.</span>
          <span className="dot-anim ml-1" style={{ animationDelay: '0.2s' }}>.</span>
          <span className="dot-anim ml-1" style={{ animationDelay: '0.4s' }}>.</span>
        </span>
      </div>
    );
  }

  if (errorOwned || errorAll) {
    return (
      <div className="bg-gray-300 min-h-screen w-full flex flex-col items-center justify-center select-none p-4 gap-4">
        {errorOwned && (
          <div className="text-red-600 text-lg font-semibold rounded shadow-md bg-white px-6 py-4 max-w-md text-center">
            Erreur cartes possédées : {errorOwned}
          </div>
        )}
        {errorAll && (
          <div className="text-red-600 text-lg font-semibold rounded shadow-md bg-white px-6 py-4 max-w-md text-center">
            Erreur toutes cartes : {errorAll}
          </div>
        )}
      </div>
    );
  }

  const renderCardsSection = (cars: Card[], upgrades: Card[]) => (
    <>
      <h3 className="text-lg font-semibold text-gray-700 mb-2">Véhicules</h3>
      <div className="flex flex-wrap justify-center gap-4 mb-6">
        {cars.length > 0 ? cars.map(card => (
          <div
            key={card.id}
            className="w-[120px] sm:w-[150px] md:w-[180px] cursor-pointer"
            onClick={() => setSelectedCard(card)}
          >
            <Tilt3DCard imageUrl={getImageUrl(card)} />
          </div>
        )) : (
          <p className="text-center text-gray-500">Aucun véhicule {activeTab === 'owned' ? 'possédé' : 'disponible'}</p>
        )}
      </div>

      <h3 className="text-lg font-semibold text-gray-700 mb-2">Améliorations</h3>
      <div className="flex flex-wrap justify-center gap-4">
        {upgrades.length > 0 ? upgrades.map(card => (
          <div
            key={card.id}
            className="w-[120px] sm:w-[150px] md:w-[180px] cursor-pointer"
            onClick={() => setSelectedCard(card)}
          >
            <Tilt3DCard imageUrl={getImageUrl(card)} />
          </div>
        )) : (
          <p className="text-center text-gray-500">Aucune amélioration {activeTab === 'owned' ? 'possédée' : 'disponible'}</p>
        )}
      </div>
    </>
  );

  return (
    <>
      <div className="flex flex-col min-h-screen bg-gray-300 select-none">
        {/* Onglets fixes en haut */}
        <nav className="bg-white shadow sticky top-0 z-50">
          <div className="max-w-7xl mx-auto flex justify-center gap-4 p-4">
            <button
              onClick={() => setActiveTab('owned')}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors
                ${activeTab === 'owned' ? 'bg-gray-950 text-white' : 'bg-white text-gray-700 hover:bg-gray-200'}`}
            >
              Possédées
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors
                ${activeTab === 'all' ? 'bg-gray-950 text-white' : 'bg-white text-gray-700 hover:bg-gray-200'}`}
            >
              Toutes
            </button>
          </div>
        </nav>

        {/* Contenu cartes, scrollable */}
        <main className="flex-grow overflow-y-auto max-w-7xl mx-auto p-4 flex gap-8">
          <section className="flex-1 bg-white rounded-lg shadow p-4 flex flex-col">
            <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
              {activeTab === 'owned' ? 'Mes Cartes Possédées' : 'Toutes les Cartes'}
            </h2>

            {activeTab === 'owned'
              ? renderCardsSection(ownedCars, ownedUpgrades)
              : renderCardsSection(allCars, allUpgrades)}
          </section>
        </main>

        {/* Footer fixe en bas */}
        <footer className="h-[10%] w-full max-w-md mx-auto mb-4 sticky bottom-0 bg-gray-300 z-40">
          <GameBar />
        </footer>
      </div>

      {selectedCard && (
        <Modal2 onClose={() => setSelectedCard(null)}>
          <div className="w-full h-full max-h-[90vh] overflow-y-auto px-4 py-6 bg-white rounded-lg flex flex-col items-center gap-4 sm:max-w-lg sm:mx-auto sm:mt-10 sm:rounded-xl sm:shadow-lg">
            <div className="w-[200px] sm:w-[250px]">
              <Tilt3DCard imageUrl={getImageUrl(selectedCard)} />
            </div>
            <Tabs
              tabs={[
                {
                  label: "Infos",
                  content: (
                    <div className="text-gray-700 text-sm space-y-2">
                      <p><span className="font-semibold">Nom :</span> {selectedCard.name}</p>
                      <p><span className="font-semibold">Description :</span> {selectedCard.description || 'Aucune description'}</p>
                      <p><span className="font-semibold">Coût :</span> {selectedCard.cost ?? 'Non défini'}</p>
                    </div>
                  )
                },
                {
                  label: "Stats",
                  content: (
                    <div className="text-sm text-gray-700 space-y-1">
                      {selectedCard.type === 'car' ? (
                        <>
                          <p><span className="font-semibold">Puissance :</span> {selectedCard.power ?? 'N/A'}</p>
                          <p><span className="font-semibold">Poids :</span> {selectedCard.weight ?? 'N/A'} kg</p>
                          <p><span className="font-semibold">Vitesse max :</span> {selectedCard.max_speed ?? 'N/A'} km/h</p>
                          <p><span className="font-semibold">0 à 100 :</span> {selectedCard.zero_hundred ?? 'N/A'} s (0-100)</p>
                          <p><span className="font-semibold">Coefficient de trainé :</span> {selectedCard.drag_coefficient ?? 'N/A'}</p>
                          <p><span className="font-semibold">Surface de contact :</span> {selectedCard.frontal_area ?? 'N/A'} m<sup>2</sup></p>
                          <p><span className="font-semibold">Coefficient de resistance :</span> {selectedCard.rrc ?? 'N/A'}</p>
                        </>
                      ) : (
                        <>
                          <p className="italic text-gray-500">Statistiques dans la description.</p>
                        </>
                      )}
                    </div>
                  )
                },
              ]}
            />
          </div>
        </Modal2>
      )}
    </>
  );
}
