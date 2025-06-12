import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { getUserFromRequest } from '@/lib/auth-utils';
import { safeJsonResponse } from '@/lib/api-utils';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

// Créer un nouveau deck
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) return safeJsonResponse({ error: 'Token manquant' }, { status: 401 });
    
    const { id: userId } = jwt.verify(token, JWT_SECRET) as { id: string };

    const { name } = await req.json();
    if (!name) return safeJsonResponse({ error: 'Nom requis' }, { status: 400 });

    const newDeck = await prisma.deck.create({
      data: { name, user_id: userId },
    });

    return safeJsonResponse(newDeck);
  } catch (err) {
    console.error(err);
    return safeJsonResponse({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// Modifier un deck (nom ou état actif)
export async function PUT(req: NextRequest) {
  try {
    const { deckId, name, is_active } = await req.json();

    const user = await getUserFromRequest(req);
    if (!user) {
      return safeJsonResponse({ error: 'Non autorisé' }, { status: 401 });
    }

    const deck = await prisma.deck.findUnique({ where: { id: deckId } });
    if (!deck) {
      return safeJsonResponse({ error: 'Deck introuvable' }, { status: 404 });
    }

    if (deck.user_id !== user.id) {
      return safeJsonResponse({ error: 'Accès interdit' }, { status: 403 });
    }

    // Si on veut activer ce deck, désactive tous les autres
    if (is_active) {
      await prisma.deck.updateMany({
        where: { user_id: user.id },
        data: { is_active: false },
      });
    }

    const updatedDeck = await prisma.deck.update({
      where: { id: deckId },
      data: { name, ...(is_active !== undefined ? { is_active } : {}) },
    });

    return safeJsonResponse(updatedDeck);
  } catch (err) {
    console.error(err);
    return safeJsonResponse({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// Supprimer un deck
export async function DELETE(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) return safeJsonResponse({ error: 'Token manquant' }, { status: 401 });

    const { id: userId } = jwt.verify(token, JWT_SECRET) as { id: string };
    const { deckId } = await req.json();

    await prisma.deck.deleteMany({
      where: { id: deckId, user_id: userId },
    });

    return safeJsonResponse({ success: true });
  } catch (err) {
    console.error(err);
    return safeJsonResponse({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// Récupérer les decks
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) return safeJsonResponse({ error: 'Token manquant' }, { status: 401 });

    const { id: userId } = jwt.verify(token, JWT_SECRET) as { id: string };

    const decks = await prisma.deck.findMany({
      where: { user_id: userId },
      include: {
        DeckCar: { include: { CarCard: true } },
        DeckUpgrade: true,
      },
    });

    const enrichedDecks = decks.map((deck) => ({
      ...deck,
      carCount: deck.DeckCar.length,
      upgradeCount: deck.DeckUpgrade.length,
    }));

    return safeJsonResponse({ decks: enrichedDecks });
  } catch (err) {
    console.error(err);
    return safeJsonResponse({ error: 'Erreur serveur' }, { status: 500 });
  }
}