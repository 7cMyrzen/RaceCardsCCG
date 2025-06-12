import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

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
    const token = req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };

    // Récupérer les cartes voitures avec les détails
    const userCars = await prisma.userCar.findMany({
      where: { user_id: decoded.id },
      include: {
        CarCard: true,
      },
      orderBy: {
        CarCard: {
          level: 'asc',
        },
      },
    });
    

    // Récupérer les upgrades avec les détails
    const userUpgrades = await prisma.userUpgrade.findMany({
      where: { user_id: decoded.id },
      include: {
        UpgradeCard: true,
      },
    });

    return NextResponse.json({
        cars: sanitizeBigInt(userCars.map((uc) => uc.CarCard)),
        upgrades: sanitizeBigInt(userUpgrades.map((uu) => uu.UpgradeCard)),
      });

  } catch (err) {
    console.error("Erreur JWT ou BDD :", err);
    return NextResponse.json({ error: 'Token invalide ou erreur serveur' }, { status: 401 });
  }
}
