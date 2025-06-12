import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth-utils';
import { safeJsonResponse } from '@/lib/api-utils';

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return safeJsonResponse({ error: 'Non autorisé' }, { status: 401 });

    // Récupérer les résultats où le joueur est gagnant ou perdant
    const results = await prisma.result.findMany({
      where: {
        OR: [
          { winner_id: user.id },
          { looser_id: user.id },
        ],
      },
      orderBy: { date_played: 'desc' },
      take: 50,
      include: {
        User_Result_winner_idToUser: true,
        User_Result_looser_idToUser: true,
      },
    });

    // Formater pour le frontend
    const formatted = results.map(r => ({
      date_played: r.date_played,
      winner_username: r.User_Result_winner_idToUser?.username || 'Inconnu',
      looser_username: r.User_Result_looser_idToUser?.username || 'Inconnu',
      isVictory: r.winner_id === user.id,
    }));

    return safeJsonResponse({ results: formatted });
  } catch (err) {
    console.error(err);
    return safeJsonResponse({ error: 'Erreur serveur' }, { status: 500 });
  }
} 