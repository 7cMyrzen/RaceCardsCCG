import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth-utils';
import { safeJsonResponse } from '@/lib/api-utils';
import Pusher from 'pusher';
import { trackPath1, trackPath2, trackPath3 } from '@/data/map';
import { calculerVitesseEtDistanceApres5s } from '@/lib/physics/acceleration';

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return safeJsonResponse({ error: 'Non autorisé' }, { status: 401 });

    const { gameId } = await req.json();
    if (!gameId) return safeJsonResponse({ error: 'gameId requis' }, { status: 400 });

    const game = await prisma.game.findUnique({ where: { id: Number(gameId) } });
    if (!game) return safeJsonResponse({ error: 'Partie introuvable' }, { status: 404 });

    if (game.currentPlayerId !== user.id) {
      return safeJsonResponse({ error: "Ce n'est pas votre tour" }, { status: 403 });
    }

    // --- LOGIQUE DE PENALITE VIRAGE ---
    let state = game.state || {};
    if (typeof state === 'string') {
      try { state = JSON.parse(state); } catch { state = {}; }
    }
    if (typeof state !== 'object' || state === null) state = {};
    let players = (state as any).players || {};
    const player = players[user.id];
    if (!player || !player.car) {
      // Pas de voiture choisie, rien à faire
      return safeJsonResponse({ error: 'Aucune voiture sélectionnée' }, { status: 400 });
    }

    // Récupérer la map
    let map = null;
    if (game.circuitId === 1) map = trackPath1;
    if (game.circuitId === 2) map = trackPath2;
    if (game.circuitId === 3) map = trackPath3;
    if (!map) return safeJsonResponse({ error: 'Circuit inconnu' }, { status: 400 });

    // Récupérer la distance et la vitesse du joueur
    const distance = player.distance || 0;
    const speed = player.speed || 0; // en km/h
    const vmax = player.car.max_speed || 0; // en km/h

    // Conversion en m/s
    const speedMs = speed / 3.6;
    const vmaxMs = vmax / 3.6;

    // Chercher si on est dans un virage
    let penalty = null;
    for (const turn of map.turns) {
      for (const interval of turn.m) {
        const [start, end] = interval.split('-').map(Number);
        if (distance >= start && distance <= end) {
          let limit = 0;
          if (turn.type === 'PeuSerre') limit = vmaxMs * 0.85;
          if (turn.type === 'Serre') limit = vmaxMs * 0.6;
          if (turn.type === 'TresSerre') limit = vmaxMs * 0.3;
          if (speedMs > limit) {
            // Appliquer un malus simple : réduction de la vitesse de 30% et message
            player.speed = Math.round(speedMs * 0.7 * 3.6); // repasse en km/h
            penalty = {
              type: turn.type,
              limit: Math.round(limit * 3.6),
              speed: speed,
              message: `Dépassement de la limite dans un virage ${turn.type} ! Vitesse réduite.`
            };
          }
        }
      }
    }

    // Gestion immobilisation (crash)
    if (player.immobilized && player.immobilized > 0) {
      player.immobilized -= 1;
      // Passe le tour sans action
      const nextPlayerId = game.currentPlayerId === game.player1Id ? game.player2Id : game.player1Id;
      await prisma.game.update({
        where: { id: game.id },
        data: { currentPlayerId: nextPlayerId, state },
      });
      // Notifier via Pusher
      function sanitizeBigInt(obj: any): any {
        if (Array.isArray(obj)) return obj.map(sanitizeBigInt);
        if (obj && typeof obj === 'object') {
          const out: any = {};
          for (const k in obj) {
            out[k] = typeof obj[k] === 'bigint' ? obj[k].toString() : sanitizeBigInt(obj[k]);
          }
          return out;
        }
        return obj;
      }
      await pusher.trigger(`game-${game.id}`, 'turn-changed', sanitizeBigInt({
        gameId: game.id,
        currentPlayerId: nextPlayerId,
        penalty: {
          crash: true,
          immobilized: player.immobilized,
          message: `Vous êtes immobilisé suite à un crash ! Tours restants : ${player.immobilized}`
        }
      }));
      return safeJsonResponse({
        gameId: game.id,
        currentPlayerId: nextPlayerId,
        penalty: {
          crash: true,
          immobilized: player.immobilized,
          message: `Vous êtes immobilisé suite à un crash ! Tours restants : ${player.immobilized}`
        },
        message: `Vous êtes immobilisé suite à un crash ! Tours restants : ${player.immobilized}`
      });
    }

    // Passe le tour à l'autre joueur
    const nextPlayerId = game.currentPlayerId === game.player1Id ? game.player2Id : game.player1Id;
    await prisma.game.update({
      where: { id: game.id },
      data: { currentPlayerId: nextPlayerId, state },
    });

    // Notifier via Pusher ici
    function sanitizeBigInt(obj: any): any {
      if (Array.isArray(obj)) return obj.map(sanitizeBigInt);
      if (obj && typeof obj === 'object') {
        const out: any = {};
        for (const k in obj) {
          out[k] = typeof obj[k] === 'bigint' ? obj[k].toString() : sanitizeBigInt(obj[k]);
        }
        return out;
      }
      return obj;
    }
    await pusher.trigger(`game-${game.id}`, 'turn-changed', sanitizeBigInt({
      gameId: game.id,
      currentPlayerId: nextPlayerId,
      penalty,
    }));

    return safeJsonResponse({
      gameId: game.id,
      currentPlayerId: nextPlayerId,
      penalty,
      message: penalty ? penalty.message : 'Tour passé au joueur suivant',
    });
  } catch (err) {
    console.error(err);
    return safeJsonResponse({ error: 'Erreur serveur' }, { status: 500 });
  }
} 