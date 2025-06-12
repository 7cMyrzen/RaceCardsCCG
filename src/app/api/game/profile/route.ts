import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth-utils';
import { safeJsonResponse } from '@/lib/api-utils';

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return safeJsonResponse({ error: 'Non autorisé' }, { status: 401 });
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        username: true,
        email: true,
        nb_victoires: true,
        nb_defaites: true,
        profile_pic: true,
        money: true,
      },
    });
    if (!dbUser) return safeJsonResponse({ error: 'Utilisateur introuvable' }, { status: 404 });
    return safeJsonResponse({ user: dbUser });
  } catch (err) {
    console.error(err);
    return safeJsonResponse({ error: 'Erreur serveur' }, { status: 500 });
  }
} 