import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { safeJsonResponse } from '@/lib/api-utils';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) return safeJsonResponse({ error: 'Token manquant' }, { status: 401 });
    jwt.verify(token, JWT_SECRET); // On vérifie juste l'authentification

    const { searchParams } = new URL(req.url);
    const deckId = searchParams.get('deckId');
    if (!deckId) return safeJsonResponse({ error: 'deckId requis' }, { status: 400 });

    // On récupère les cartes voiture
    const cars = await prisma.deckCar.findMany({
      where: { deck_id: Number(deckId) },
      include: { CarCard: true },
    });
    // On récupère les cartes upgrade
    const upgrades = await prisma.deckUpgrade.findMany({
      where: { deck_id: Number(deckId) },
      include: { UpgradeCard: true },
    });

    // On formate les résultats
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

    return safeJsonResponse({ cards: [...carCards, ...upgradeCards] });
  } catch (err) {
    console.error(err);
    return safeJsonResponse({ error: 'Erreur serveur' }, { status: 500 });
  }
}
