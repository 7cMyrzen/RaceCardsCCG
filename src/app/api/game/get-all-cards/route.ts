import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

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

export async function GET(req: NextRequest) {
  try {
    // On ne vérifie plus le token ni utilisateur, on récupère toutes les cartes

    // Toutes les cartes voitures
    const allCars = await prisma.carCard.findMany({
        orderBy: {
          level: 'asc'
        }
      });
      
    // Toutes les cartes améliorations
    const allUpgrades = await prisma.upgradeCard.findMany();

    return NextResponse.json({
      cars: sanitizeBigInt(allCars),
      upgrades: sanitizeBigInt(allUpgrades),
    });

  } catch (err) {
    console.error("Erreur lors de la récupération des cartes :", err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
