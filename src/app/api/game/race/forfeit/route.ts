import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth-utils';
import { safeJsonResponse } from '@/lib/api-utils';
import Pusher from 'pusher';
import type { GameState } from '@/types/game';

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
    // Déterminer le gagnant (l'autre joueur)
    const winnerId = game.player1Id === user.id ? game.player2Id : game.player1Id;
    // Mettre à jour le state
    let stateRaw = game.state;
    if (typeof stateRaw === 'string') {
      try { stateRaw = JSON.parse(stateRaw); } catch { stateRaw = {}; }
    }
    if (!stateRaw || typeof stateRaw !== 'object' || Array.isArray(stateRaw)) {
      stateRaw = { players: {}, turn: 1 };
    }
    const state = stateRaw as unknown as GameState;
    (state as GameState).winnerId = winnerId;
    await prisma.game.update({ where: { id: game.id }, data: { state: state as any } });
    // Enregistrer le résultat
    await prisma.result.create({
      data: {
        winner_id: winnerId,
        looser_id: user.id,
      }
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
    await pusher.trigger(`game-${game.id}`, 'game-ended', sanitizeBigInt({
      gameId: game.id,
      winnerId,
      message: 'L\'adversaire a abandonné. Victoire !',
    }));
    return safeJsonResponse({
      gameId: game.id,
      winnerId,
      message: 'Vous avez abandonné la partie.',
    });
  } catch (err) {
    console.error(err);
    return safeJsonResponse({ error: 'Erreur serveur' }, { status: 500 });
  }
} 