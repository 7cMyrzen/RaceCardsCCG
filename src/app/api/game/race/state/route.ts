import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { safeJsonResponse } from '@/lib/api-utils';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const gameId = searchParams.get('gameId');
    if (!gameId) return safeJsonResponse({ error: 'gameId requis' }, { status: 400 });

    const game = await prisma.game.findUnique({ where: { id: Number(gameId) } });
    if (!game) return safeJsonResponse({ error: 'Partie introuvable' }, { status: 404 });

    return safeJsonResponse({
      gameId: game.id,
      player1Id: game.player1Id,
      player2Id: game.player2Id,
      currentPlayerId: game.currentPlayerId,
      circuitId: game.circuitId,
      state: game.state,
    });
  } catch (err) {
    console.error(err);
    return safeJsonResponse({ error: 'Erreur serveur' }, { status: 500 });
  }
} 