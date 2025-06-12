import { NextRequest, NextResponse } from 'next/server';
import Pusher from 'pusher';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';
import { safeJsonResponse } from '@/lib/api-utils';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

// File d'attente en mémoire (pour dev uniquement)
let waitingPlayer: { id: string, deckId: string } | null = null;

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

import { trackPath1, trackPath2, trackPath3 } from "@/data/map"

const circuits = [
    { id: 1, name: "Monza", key: "monza" },
    { id: 2, name: "Circuit de Spa", key: "spa" },
    { id: 3, name: "Monaco", key: "monaco" },
];

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Token manquant' }, { status: 401 });
    const { id: userId } = jwt.verify(token, JWT_SECRET) as { id: string };

    const { deckId } = await req.json();
    if (!deckId) return NextResponse.json({ error: 'Deck manquant' }, { status: 400 });

    const randomCircuit = circuits[Math.floor(Math.random() * circuits.length)];

    // Fonction utilitaire pour récupérer les cartes d'un deck
    async function getDeckCards(deckId: string | number) {
      const cars = await prisma.deckCar.findMany({
        where: { deck_id: Number(deckId) },
        include: { CarCard: true },
      });
      const upgrades = await prisma.deckUpgrade.findMany({
        where: { deck_id: Number(deckId) },
        include: { UpgradeCard: true },
      });
      const carCards = cars.map((c) => ({
        id: c.CarCard.id,
        type: 'car',
        name: c.CarCard.name,
        description: c.CarCard.description,
        img_path: c.CarCard.img_path,
      }));
      const upgradeCards = upgrades.map((u) => ({
        id: u.UpgradeCard.id,
        type: 'upgrade',
        name: u.UpgradeCard.name,
        description: u.UpgradeCard.description,
        img_path: u.UpgradeCard.img_path,
      }));
      return [...carCards, ...upgradeCards];
    }

    // Si personne n'attend, on met ce joueur en attente
    if (!waitingPlayer) {
      waitingPlayer = { id: userId, deckId };
      return NextResponse.json({ status: 'waiting' , userId });
    }

    // Sinon, on crée une partie
    const gameId = `game-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const channel = `race-${gameId}`;

    // Récupère les decks des deux joueurs
    const player1Deck = await getDeckCards(waitingPlayer.deckId);
    const player2Deck = await getDeckCards(deckId);

    // --- AJOUT : Création de la partie en base ---
    // On suppose que waitingPlayer.id = joueur 1, userId = joueur 2
    const createdGame = await prisma.game.create({
      data: {
        player1Id: waitingPlayer.id,
        player2Id: userId,
        currentPlayerId: waitingPlayer.id, // Premier joueur commence
        circuitId: randomCircuit.id,
        state: {
          players: {
            [waitingPlayer.id]: { diamonds: 300, speed: 0, distance: 0, car: null },
            [userId]: { diamonds: 300, speed: 0, distance: 0, car: null }
          },
          turn: 1
        },
      }
    });
    // --- FIN AJOUT ---

    // Utilitaire pour sérialiser les BigInt
    function sanitizeBigInt(obj: any): any {
      if (Array.isArray(obj)) {
        return obj.map(sanitizeBigInt);
      } else if (obj !== null && typeof obj === 'object') {
        const sanitized: any = {};
        for (const key in obj) {
          const value = obj[key];
          sanitized[key] =
            typeof value === 'bigint' ? value.toString() : sanitizeBigInt(value);
        }
        return sanitized;
      }
      return obj;
    }

    // Notifie le joueur déjà en attente
    await pusher.trigger(`user-${waitingPlayer.id}`, 'match-found', {
      gameId: createdGame.id.toString(),
      channel,
      opponentId: userId,
      opponentDeckId: deckId,
      circuit: randomCircuit.id,
      deck: sanitizeBigInt(player1Deck),
      opponentDeck: sanitizeBigInt(player2Deck),
      userId: waitingPlayer.id
    });

    // Notifie le joueur courant (celui qui vient d'arriver)
    await pusher.trigger(`user-${userId}`, 'match-found', {
      gameId: createdGame.id.toString(),
      channel,
      opponentId: waitingPlayer.id,
      opponentDeckId: waitingPlayer.deckId,
      circuit: randomCircuit.id,
      deck: sanitizeBigInt(player2Deck),
      opponentDeck: sanitizeBigInt(player1Deck),
      userId: userId
    });

    // Vide la file d'attente
    waitingPlayer = null;

    return safeJsonResponse({ status: 'matched', gameId: createdGame.id.toString(), channel, circuit: randomCircuit.id, deck: sanitizeBigInt(player2Deck), opponentDeck: sanitizeBigInt(player1Deck), userId });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}