import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

// Limites définies
const MAX_CARS = 4;
const MAX_UPGRADES = 4;

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Token manquant' }, { status: 401 });

    const { id: userId } = jwt.verify(token, JWT_SECRET) as { id: string };
    const { deckId, cardId, type } = await req.json(); // type: 'car' ou 'upgrade'

    if (!deckId || !cardId || !['car', 'upgrade'].includes(type)) {
      return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 });
    }

    // Vérification que le deck appartient au joueur
    const deck = await prisma.deck.findUnique({ where: { id: deckId } });
    if (!deck || deck.user_id !== userId) {
      return NextResponse.json({ error: 'Deck non autorisé' }, { status: 403 });
    }

    // Vérification des limites
    if (type === 'car') {
      const carCount = await prisma.deckCar.count({ where: { deck_id: deckId } });
      if (carCount >= MAX_CARS) {
        return NextResponse.json({ error: 'Nombre maximum de cartes voiture atteint' }, { status: 400 });
      }

      await prisma.deckCar.create({
        data: { deck_id: deckId, car_id: cardId },
      });
    } else {
      const upgradeCount = await prisma.deckUpgrade.count({ where: { deck_id: deckId } });
      if (upgradeCount >= MAX_UPGRADES) {
        return NextResponse.json({ error: 'Nombre maximum de cartes amélioration atteint' }, { status: 400 });
      }

      await prisma.deckUpgrade.create({
        data: { deck_id: deckId, upgrade_id: cardId },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
