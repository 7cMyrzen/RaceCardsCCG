"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import RaceTrack from "@/components/game/RaceTrack"; // ou MapWithPlayers selon ton export
import CardModalCarousel from "@/components/game/Modal";
import { AbilityModalCarousel } from "@/components/game/Modal";
import { trackPath1, trackPath2, trackPath3 } from "@/data/map";
import Pusher from 'pusher-js';
import { calculerVitesseEtDistanceApres5s } from '@/lib/physics/acceleration';
import { calculerDecelerationEtDistanceApres5s } from '@/lib/physics/deceleration';


const sampleCards = [
    { id: '1', imageUrl: '/cartes/car1.jpg', cost: 3 },
    { id: '2', imageUrl: '/cartes/car2.jpg', cost: 5 },
    { id: '3', imageUrl: '/cartes/car3.jpg', cost: 2 },
];
const abilitiesSample = [
    {
        id: 'a1',
        imageUrl: '/capacites/capa1.jpg',
        cost: 2,
        name: 'Turbo Boost',
        description: 'Accélère le véhicule pendant un tour sans payer de carburant.',
    },
    {
        id: 'a2',
        imageUrl: '/capacites/capa2.jpg',
        cost: 3,
        name: 'Drift Contrôlé',
        description: 'Permet de prendre un virage serré sans pénalité de freinage.',
    },
];

// Types à adapter selon ton backend
type Turn = { type: string; m: string[] };
type Circuit = { svgPath: string; mT: number; turns: Turn[] };
type Player = { id: string; username: string; meters: number; isYou: boolean };

export default function RaceGamePage() {
  const { gameId } = useParams();
    const searchParams = useSearchParams();
    const circuitId = Number(searchParams.get("circuit"));
    const commonClasses =
        "relative overflow-hidden rounded-xl shadow-md p-4 flex items-center justify-center text-center text-md font-medium select-none bg-gray-950 w-full min-h-[120px] sm:min-w-[220px] sm:min-h-[180px]";

    const circuitMap: Record<number, Circuit> = {
        1: {
            svgPath: trackPath1.svg,
            mT: trackPath1.len,
            turns: trackPath1.turns,
        },
        2: {
            svgPath: trackPath2.svg,
            mT: trackPath2.len,
            turns: trackPath2.turns,
        },
        3: {
            svgPath: trackPath3.svg,
            mT: trackPath3.len,
            turns: trackPath3.turns,
        },
    };

    const circuit = circuitMap[circuitId];

    const [players, setPlayers] = useState<Player[]>([]);
    const [loading, setLoading] = useState(true);
    const [showBoostModal, setShowBoostModal] = useState(false);
    const [boostPercent, setBoostPercent] = useState<number | null>(null);
    const [showBrakeModal, setShowBrakeModal] = useState(false);
    const [brakePercent, setBrakePercent] = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
    const [feedbackType, setFeedbackType] = useState<'success' | 'error' | null>(null);
    const [isUsingCard, setIsUsingCard] = useState(false);
    const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);
    const [gameStateLoading, setGameStateLoading] = useState(true);
    const [gameStateError, setGameStateError] = useState<string | null>(null);
    const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
    const [gameState, setGameState] = useState<any>(null);
    const [penalty, setPenalty] = useState<any>(null);
    const [showPenalty, setShowPenalty] = useState(false);
    const [gameEnded, setGameEnded] = useState<{ winnerId: string, message: string } | null>(null);
    const router = useRouter();
    const [showForfeitConfirm, setShowForfeitConfirm] = useState(false);

    const handleUseCard = async (card: any) => {
        setIsUsingCard(true);
        setFeedbackMessage(null);
        setFeedbackType(null);
        try {
            const res = await fetch('/api/game/race/use-card', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    gameId,
                    cardId: card.id,
                    type: card.type,
                }),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setFeedbackMessage(data.message || 'Carte utilisée !');
                setFeedbackType('success');
                setIsModalOpen(false);
            } else {
                setFeedbackMessage(data.error || "Erreur lors de l'utilisation de la carte");
                setFeedbackType('error');
            }
        } catch (e) {
            setFeedbackMessage('Erreur réseau');
            setFeedbackType('error');
        } finally {
            setIsUsingCard(false);
        }
    };
    const [isAbilityModalOpen, setIsAbilityModalOpen] = useState(false);
    const handleUseAbility = (ability: any) => {
        console.log('Capacité utilisée :', ability);
        setIsAbilityModalOpen(false);
    };
    const [deckCards, setDeckCards] = useState<any[]>([]);
    const [deckLoading, setDeckLoading] = useState(true);
    const [deckError, setDeckError] = useState<string | null>(null);

    useEffect(() => {
        // Simule un fetch réel pour les joueurs
        setTimeout(() => {
            setPlayers([
                { id: "1", username: "Adversaire", meters: 120, isYou: false },
                { id: "2", username: "Toi", meters: 80, isYou: true },
            ]);
            setLoading(false);
        }, 500);
    }, [gameId]);

    useEffect(() => {
        async function fetchActiveDeck() {
            setDeckLoading(true);
            setDeckError(null);
            try {
                const res = await fetch('/api/game/deck/active-deck');
                if (!res.ok) {
                    const err = await res.json();
                    setDeckError(err.error || 'Erreur lors du chargement du deck');
                    setDeckCards([]);
                } else {
                    const data = await res.json();
                    setDeckCards(data.cards || []);
                }
            } catch (e) {
                setDeckError('Erreur réseau');
                setDeckCards([]);
            } finally {
                setDeckLoading(false);
            }
        }
        fetchActiveDeck();
    }, []);

    // --- Gestion du tour de jeu via Pusher (à brancher sur le vrai websocket) ---
    useEffect(() => {
        if (!gameId) return;
        const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
            cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
        });
        const channel = pusher.subscribe(`game-${gameId}`);
        channel.bind('turn-changed', (payload: any) => {
            fetchGameState();
            if (payload && payload.penalty) {
                setPenalty(payload.penalty);
                setShowPenalty(true);
                setTimeout(() => setShowPenalty(false), 2500);
            }
        });
        channel.bind('game-ended', (payload: any) => {
            setGameEnded({ winnerId: payload.winnerId, message: payload.message });
        });
        return () => {
            channel.unbind_all();
            pusher.disconnect();
        };
    }, [gameId]);

    async function fetchGameState() {
        setGameStateLoading(true);
        setGameStateError(null);
        try {
            const res = await fetch(`/api/game/race/state?gameId=${gameId}`);
            const data = await res.json();
            if (res.ok) {
                setCurrentPlayerId(data.currentPlayerId);
                setGameState(data.state || null);
                if (data.penalty) {
                    setPenalty(data.penalty);
                    setShowPenalty(true);
                    setTimeout(() => setShowPenalty(false), 2500);
                }
            } else {
                setGameStateError(data.error || 'Erreur lors du chargement de la partie');
            }
        } catch (e) {
            setGameStateError('Erreur réseau');
        } finally {
            setGameStateLoading(false);
        }
    }

    useEffect(() => {
        fetchGameState();
    }, [gameId]);

    const handleEndTurn = async () => {
        setGameStateLoading(true);
        setGameStateError(null);
        try {
            const res = await fetch('/api/game/race/end-turn', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ gameId }),
            });
            const data = await res.json();
            if (res.ok) {
                setCurrentPlayerId(data.currentPlayerId);
            } else {
                setGameStateError(data.error || 'Erreur lors du changement de tour');
            }
        } catch (e) {
            setGameStateError('Erreur réseau');
        } finally {
            setGameStateLoading(false);
        }
    };

    const isTurnActive = userId && currentPlayerId && userId === currentPlayerId;

    // Récupère les infos du joueur courant
    const playerState = userId && gameState && gameState.players ? gameState.players[userId] : null;
    const hasChosenCar = playerState && playerState.car;
    const diamonds = playerState ? playerState.diamonds : 0;
    const speed = playerState ? playerState.speed : 0;
    const distance = playerState ? playerState.distance : 0;

    // Trouver l'adversaire
    const opponentId = gameState && gameState.players && userId
      ? Object.keys(gameState.players).find(id => id !== userId)
      : null;
    const opponentState = opponentId && gameState && gameState.players ? gameState.players[opponentId] : null;
    const myCar = playerState && playerState.car;
    const opponentCar = opponentState && opponentState.car;

    // Gestion de l'affichage temporaire du message de tour
    const [showTurnMessage, setShowTurnMessage] = useState(false);
    const [lastTurnType, setLastTurnType] = useState<'me' | 'opponent' | null>(null);

    useEffect(() => {
      if (isTurnActive !== null) {
        setShowTurnMessage(true);
        setLastTurnType(isTurnActive ? 'me' : 'opponent');
        const timer = setTimeout(() => setShowTurnMessage(false), 1500);
        return () => clearTimeout(timer);
      }
    }, [isTurnActive, currentPlayerId]);

    const handleAccelerate = async () => {
      if (!boostPercent || boostPercent < 1 || boostPercent > 100) return;
      setGameStateLoading(true);
      try {
        const res = await fetch('/api/game/race/accelerate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gameId, boostPercent }),
        });
        // La logique d'affichage de pénalité et de rafraîchissement est déjà gérée par Pusher/fetchGameState
      } catch (e) {
        setGameStateError('Erreur réseau');
      } finally {
        setShowBoostModal(false);
        setGameStateLoading(false);
      }
    };

    const handleBrake = async () => {
      if (!brakePercent || brakePercent < 1 || brakePercent > 100) return;
      setGameStateLoading(true);
      try {
        const res = await fetch('/api/game/race/brake', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gameId, brakePercent }),
        });
        // La logique d'affichage de pénalité et de rafraîchissement est déjà gérée par Pusher/fetchGameState
      } catch (e) {
        setGameStateError('Erreur réseau');
      } finally {
        setShowBrakeModal(false);
        setGameStateLoading(false);
      }
    };

    const getFinalSpeedAfterBoost = () => {
      if (!playerState || !playerState.car || !boostPercent || boostPercent < 1 || boostPercent > 100) return null;
      const v0 = playerState.speed ? playerState.speed / 3.6 : 0;
      const vmax = playerState.car.max_speed ? playerState.car.max_speed / 3.6 : 0;
      const masse = playerState.car.weight || 1200;
      const cv = playerState.car.power || 120;
      const alpha = boostPercent / 100;
      const t_0_100 = playerState.car.zero_hundred || 8.0;
      const cd = playerState.car.drag_coefficient || 0.3;
      const area = playerState.car.frontal_area || 2.0;
      const mu = playerState.car.rrc || 0.015;
      const { vitesse } = calculerVitesseEtDistanceApres5s(v0, vmax, masse, cv, alpha, t_0_100, cd, area, mu);
      return Math.round(vitesse * 3.6);
    };

    const getFinalSpeedAfterBrake = () => {
      if (!playerState || !playerState.car || !brakePercent || brakePercent < 1 || brakePercent > 100) return null;
      const v0 = playerState.speed ? playerState.speed / 3.6 : 0;
      const masse = playerState.car.weight || 1200;
      const alpha = brakePercent / 100;
      const cd = playerState.car.drag_coefficient || 0.3;
      const area = playerState.car.frontal_area || 2.0;
      const muRoulis = playerState.car.rrc || 0.015;
      const muFrein = 0.7;
      const { vitesse } = calculerDecelerationEtDistanceApres5s(v0, masse, alpha, cd, area, muRoulis, muFrein);
      return Math.round(vitesse * 3.6);
    };

    // Fonction pour trouver la prochaine limite de virage
    const getNextTurnLimit = () => {
      if (!playerState || !playerState.car) return null;
      const vmax = playerState.car.max_speed / 3.6;
      const d = playerState.distance || 0;
      for (const turn of circuit.turns) {
        for (const interval of turn.m) {
          const [start, end] = interval.split('-').map(Number);
          if (d < start) {
            let limit = 0;
            if (turn.type === 'PeuSerre') limit = vmax * 0.85;
            if (turn.type === 'Serre') limit = vmax * 0.6;
            if (turn.type === 'TresSerre') limit = vmax * 0.3;
            return { limit: Math.round(limit * 3.6), type: turn.type, start };
          }
        }
      }
      return null;
    };

    // Fonction pour prédire si le prochain déplacement va traverser un virage dangereux
    const getNextDanger = (action: 'boost' | 'brake') => {
      if (!playerState || !playerState.car) return null;
      const oldDistance = playerState.distance || 0;
      let vitesse = 0;
      let distance = 0;
      if (action === 'boost' && boostPercent && boostPercent >= 1 && boostPercent <= 100) {
        const v0 = playerState.speed ? playerState.speed / 3.6 : 0;
        const vmax = playerState.car.max_speed ? playerState.car.max_speed / 3.6 : 0;
        const masse = playerState.car.weight || 1200;
        const cv = playerState.car.power || 120;
        const alpha = boostPercent / 100;
        const t_0_100 = playerState.car.zero_hundred || 8.0;
        const cd = playerState.car.drag_coefficient || 0.3;
        const area = playerState.car.frontal_area || 2.0;
        const mu = playerState.car.rrc || 0.015;
        const res = calculerVitesseEtDistanceApres5s(v0, vmax, masse, cv, alpha, t_0_100, cd, area, mu);
        vitesse = res.vitesse;
        distance = res.distance;
      }
      if (action === 'brake' && brakePercent && brakePercent >= 1 && brakePercent <= 100) {
        const v0 = playerState.speed ? playerState.speed / 3.6 : 0;
        const masse = playerState.car.weight || 1200;
        const alpha = brakePercent / 100;
        const cd = playerState.car.drag_coefficient || 0.3;
        const area = playerState.car.frontal_area || 2.0;
        const muRoulis = playerState.car.rrc || 0.015;
        const muFrein = 0.7;
        const res = calculerDecelerationEtDistanceApres5s(v0, masse, alpha, cd, area, muRoulis, muFrein);
        vitesse = res.vitesse;
        distance = res.distance;
      }
      const newDistance = oldDistance + distance;
      const vmax = playerState.car.max_speed / 3.6;
      for (const turn of circuit.turns) {
        for (const interval of turn.m) {
          const [start, end] = interval.split('-').map(Number);
          const minD = Math.min(oldDistance, newDistance);
          const maxD = Math.max(oldDistance, newDistance);
          if (end >= minD && start <= maxD) {
            let limit = 0;
            if (turn.type === 'PeuSerre') limit = vmax * 0.85;
            if (turn.type === 'Serre') limit = vmax * 0.6;
            if (turn.type === 'TresSerre') limit = vmax * 0.3;
            if (vitesse > limit) {
              return {
                type: turn.type,
                limit: Math.round(limit * 3.6),
                speed: Math.round(vitesse * 3.6),
                start,
                end
              };
            }
          }
        }
      }
      return null;
    };

    if (!circuitId || !circuit) {
        return <div className="flex items-center justify-center min-h-screen text-red-500 font-bold">Circuit inconnu ou non spécifié.</div>;
    }
    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">Chargement…</div>;
    }

    // Utilisation de ton composant
  return (
        <div className="grid grid-cols-2 gap-4 h-full w-full p-2 transition-all duration-300 ease-in-out auto-rows-[minmax(120px,_auto)]">
            <div className={`${commonClasses} bg-gray-950`}>
                <RaceTrack
                    svgPath={circuit.svgPath}
                    mT={circuit.mT}
                    turns={circuit.turns}
                    player1Distance={opponentState?.distance ?? 0}
                    player2Distance={playerState?.distance ?? 0}
                />
            </div>

            <div className={`${commonClasses} bg-gray-950 flex flex-col items-center justify-center`}>
                <div className="text-white text-sm font-bold">💎 : {diamonds}</div><br />
                <div className="text-white text-sm font-bold">Vitesse : {speed} km/h</div>
                {(() => {
                  const lap = playerState?.lap || 0;
                  const totalDistance = playerState && typeof playerState.distance === 'number' ? playerState.distance : 0;
                  return (
                    <div className="text-white text-sm font-bold">
                      Tour : {lap + 1} — {Math.round(totalDistance)} m parcourus
                    </div>
                  );
                })()}
            </div>

            <div className={`${commonClasses} bg-gray-950 flex flex-col items-center p-3`}>
                <h2 className="text-sm text-red-700 font-semibold mb-2">Cartes de l'adversaire</h2>
                {opponentCar ? (
                  <div className="aspect-[931/1300] w-40 bg-gray-800 rounded-md border border-gray-600 flex flex-col items-center justify-center p-2">
                    <img src={`/images/cards/car/${opponentCar.img_path}`} alt={opponentCar.name} className="w-full h-32 object-contain mb-2" />
                    <div className="text-white text-xs font-semibold text-center">{opponentCar.name}</div>
                  </div>
                ) : (
                  <div className="aspect-[931/1300] w-40 bg-gray-800 rounded-md border border-gray-600 flex items-center justify-center text-gray-400 text-xs">Aucune</div>
                )}
            </div>

            <div className={`${commonClasses} bg-gray-950 flex flex-col items-center p-3`}>
                <h2 className="text-sm text-blue-700 font-semibold mb-2">Cartes en jeu</h2>
                {myCar ? (
                  <div className="aspect-[931/1300] w-40 bg-gray-800 rounded-md border border-gray-600 flex flex-col items-center justify-center p-2">
                    <img src={`/images/cards/car/${myCar.img_path}`} alt={myCar.name} className="w-full h-32 object-contain mb-2" />
                    <div className="text-white text-xs font-semibold text-center">{myCar.name}</div>
                  </div>
                ) : (
                  <div className="aspect-[931/1300] w-40 bg-gray-800 rounded-md border border-gray-600 flex items-center justify-center text-gray-400 text-xs">Aucune</div>
                )}
            </div>

            <div className="col-span-2 row-span-2 bg-gray-950 rounded-xl shadow-lg p-6 flex flex-col items-center justify-center text-center select-none relative overflow-hidden">
                {/* Overlay tour par tour */}
                {!isTurnActive && (
                    <div className="absolute inset-0 bg-black bg-opacity-60 z-10 flex items-center justify-center text-white font-semibold text-lg pointer-events-auto">
                        Actions désactivées <br />
                        Tour de l'adversaire
                    </div>
                )}
                {/* Choix du véhicule au premier tour */}
                {isTurnActive && !hasChosenCar && (
                  <>
                    <h2 className="text-white font-bold text-lg mb-4">Choisissez votre véhicule</h2>
                    <div className="flex flex-wrap gap-4 justify-center">
                      {deckCards.filter(card => card.type === 'car').map(card => (
                        <div key={card.id} className="bg-gray-800 rounded-lg p-4 flex flex-col items-center shadow-md">
                          <img src={`/images/cards/car/${card.img_path}`} alt={card.name} className="w-24 h-32 object-contain mb-2" />
                          <div className="text-white font-semibold mb-1">{card.name}</div>
                          <div className="text-gray-300 text-sm mb-2">Coût : {card.cost} 💎</div>
                          <button
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-bold disabled:opacity-50"
                            disabled={diamonds < card.cost || isUsingCard}
                            onClick={() => handleUseCard(card)}
                          >
                            Choisir
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                {/* Bouton Finir mon tour */}
                {isTurnActive && hasChosenCar && (
                    <button
                        onClick={handleEndTurn}
                        className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded font-bold"
                        disabled={gameStateLoading}
                    >
                        Finir mon tour
                    </button>
                )}
                {gameStateError && <div className="text-red-500 text-center w-full">{gameStateError}</div>}

                <h2 className="text-white font-bold text-lg mb-4">A vous de jouer</h2>
                <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                    <button
                        onClick={() => setShowBoostModal(true)}
                        className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded transition-all duration-200"
                        disabled={!isTurnActive || !hasChosenCar}
                    >
                        🚀 Accélérer
                    </button>

                    <button
                        onClick={() => setShowBrakeModal(true)}
                        className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded transition-all duration-200"
                        disabled={!isTurnActive || !hasChosenCar}
                    >
                        🛑 Freiner
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-all duration-200"
                        disabled={!isTurnActive || !hasChosenCar}
                    >
                        🃏 Mes Cartes
                    </button>
                    <button
                        onClick={() => setIsAbilityModalOpen(true)}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 px-4 rounded transition-all duration-200"
                        disabled={!isTurnActive || !hasChosenCar}
                    >
                        ✨ Utiliser capacité
                    </button>
                </div>
            </div>

            {showBoostModal && (
                <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-20 flex items-center justify-center">
                    <div className="bg-gray-900 text-white p-6 rounded-xl shadow-xl w-[90%] max-w-sm text-center space-y-4 border border-gray-700">
                        <h3 className="text-lg font-semibold">Entrez le pourcentage d'accélération</h3>
                        <input
                            type="number"
                            min={1}
                            max={100}
                            placeholder="Ex : 13"
                            value={boostPercent ?? ""}
                            onChange={(e) => setBoostPercent(Number(e.target.value))}
                            className="w-full p-2 rounded bg-gray-800 text-white border border-gray-600 text-center"
                        />
                        <input
                            type="range"
                            min="1"
                            max="100"
                            value={boostPercent ?? 50}
                            onChange={(e) => setBoostPercent(Number(e.target.value))}
                            className="w-full accent-green-500"
                        />
                        <div className="text-sm text-gray-400">
                          Vitesse de fin : {getFinalSpeedAfterBoost() !== null ? getFinalSpeedAfterBoost() + ' km/h' : '—'}
                        </div>
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={handleAccelerate}
                                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm font-semibold"
                            >
                                Valider
                            </button>
                            <button
                                onClick={() => setShowBoostModal(false)}
                                className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded text-sm"
                            >
                                Annuler
                            </button>
                        </div>
                        {(() => {
                          const danger = getNextDanger('boost');
                          if (!danger) return null;
                          return (
                            <div className="text-red-500 font-bold text-sm mt-2">
                              ⚠️ Attention : tu vas traverser un virage {danger.type} ({danger.start}-{danger.end}m) à {danger.speed} km/h (limite {danger.limit} km/h) !
                            </div>
                          );
                        })()}
                    </div>
                </div>
            )}

            {showBrakeModal && (
                <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-20 flex items-center justify-center">
                    <div className="bg-gray-900 text-white p-6 rounded-xl shadow-xl w-[90%] max-w-sm text-center space-y-4 border border-gray-700">
                        <h3 className="text-lg font-semibold">Entrez le pourcentage de freinage</h3>
                        <input
                            type="number"
                            min={1}
                            max={100}
                            placeholder="Ex : 25"
                            value={brakePercent ?? ""}
                            onChange={(e) => setBrakePercent(Number(e.target.value))}
                            className="w-full p-2 rounded bg-gray-800 text-white border border-gray-600 text-center"
                        />
                        <input
                            type="range"
                            min="1"
                            max="100"
                            value={brakePercent ?? 50}
                            onChange={(e) => setBrakePercent(Number(e.target.value))}
                            className="w-full accent-red-500"
                        />
                        <div className="text-sm text-gray-400">
                          Vitesse de fin : {getFinalSpeedAfterBrake() !== null ? getFinalSpeedAfterBrake() + ' km/h' : '—'}
                        </div>
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={handleBrake}
                                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm font-semibold"
                            >
                                Valider
                            </button>
                            <button
                                onClick={() => setShowBrakeModal(false)}
                                className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded text-sm"
                            >
                                Annuler
                            </button>
                        </div>
                        {(() => {
                          const danger = getNextDanger('brake');
                          if (!danger) return null;
                          return (
                            <div className="text-red-500 font-bold text-sm mt-2">
                              ⚠️ Attention : tu vas traverser un virage {danger.type} ({danger.start}-{danger.end}m) à {danger.speed} km/h (limite {danger.limit} km/h) !
                            </div>
                          );
                        })()}
                    </div>
                </div>
            )}

            <CardModalCarousel
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                cards={deckCards.map(card => ({
                    ...card,
                    imageUrl: card.type === 'car'
                        ? `/images/cards/car/${card.img_path}`
                        : `/images/cards/upgrade/${card.img_path}`
                }))}
                onUseCard={handleUseCard}
            />

            <AbilityModalCarousel
                isOpen={isAbilityModalOpen}
                onClose={() => setIsAbilityModalOpen(false)}
                abilities={abilitiesSample}
                onUseAbility={handleUseAbility}
            />

            {deckLoading && <div className="text-white text-center w-full">Chargement du deck…</div>}
            {deckError && <div className="text-red-500 text-center w-full">{deckError}</div>}

            {/* Message temporaire de tour */}
            {showTurnMessage && lastTurnType === 'me' && (
              <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-green-600 text-white px-6 py-2 rounded shadow-lg z-50 font-bold text-lg">
                C'est votre tour !
              </div>
            )}
            {showTurnMessage && lastTurnType === 'opponent' && (
              <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-gray-700 text-white px-6 py-2 rounded shadow-lg z-50 font-bold text-lg">
                Tour de l'adversaire…
              </div>
            )}

            {/* Notification de pénalité persistante */}
            {showPenalty && penalty && (
              <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-red-700 text-white px-8 py-4 rounded-xl shadow-2xl z-50 font-bold text-lg animate-pulse border-4 border-red-400 flex flex-col items-center">
                <span className="block mb-1">⚠️ Pénalité !</span>
                <span>{penalty.message}</span>
                {penalty.crash && (
                  <span className="mt-2 text-yellow-300 font-bold text-base">Vous êtes immobilisé !</span>
                )}
                {typeof penalty.immobilized === 'number' && penalty.immobilized > 0 && (
                  <span className="text-white text-sm">Tours restants : {penalty.immobilized}</span>
                )}
                <button
                  className="mt-4 bg-white text-red-700 font-bold px-6 py-2 rounded shadow hover:bg-gray-200"
                  onClick={() => setShowPenalty(false)}
                >
                  OK
                </button>
              </div>
            )}

            {gameEnded && (
              <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex flex-col items-center justify-center">
                <div className="bg-white rounded-xl shadow-2xl p-8 flex flex-col items-center">
                  <h2 className="text-3xl font-bold mb-4 text-center text-green-700">{gameEnded.winnerId === userId ? '🏆 Victoire !' : 'Défaite...'}</h2>
                  <p className="text-lg mb-6 text-center text-gray-800">{gameEnded.message}</p>
                  <button
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold text-lg shadow"
                    onClick={() => router.push('/game')}
                  >
                    Retour à l'accueil
                  </button>
                </div>
              </div>
            )}

<div className="flex justify-center w-screen mt-4">
  <div className="flex flex-row gap-4">
    <button
      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-bold"
      onClick={() => setShowForfeitConfirm(true)}
      disabled={!!gameEnded}
    >
      Abandonner
    </button>
  </div>
</div>

            {showForfeitConfirm && (
              <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center">
                <div className="bg-white rounded-xl shadow-2xl p-8 flex flex-col items-center">
                  <h2 className="text-xl font-bold mb-4 text-center text-red-700">Confirmer l'abandon ?</h2>
                  <p className="mb-6 text-gray-800">Vous allez perdre la partie. Êtes-vous sûr ?</p>
                  <div className="flex gap-4">
                    <button
                      className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded font-bold"
                      onClick={async () => {
                        setShowForfeitConfirm(false);
                        await fetch(`/api/game/race/forfeit`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ gameId }),
                        });
                      }}
                    >
                      Oui, abandonner
                    </button>
                    <button
                      className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded font-bold"
                      onClick={() => setShowForfeitConfirm(false)}
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              </div>
            )}
        </div>
  );
}

function sanitizeBigInt(obj) {
  if (Array.isArray(obj)) return obj.map(sanitizeBigInt);
  if (obj && typeof obj === 'object') {
    const out = {};
    for (const k in obj) {
      out[k] = typeof obj[k] === 'bigint' ? obj[k].toString() : sanitizeBigInt(obj[k]);
    }
    return out;
  }
  return obj;
}