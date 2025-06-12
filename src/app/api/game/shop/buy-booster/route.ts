import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth-utils';
import { safeJsonResponse } from '@/lib/api-utils';

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return safeJsonResponse({ error: 'Non autorisé' }, { status: 401 });
    // Vérifier l'argent
    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser || dbUser.money < 500) return safeJsonResponse({ error: 'Pas assez d\'argent' }, { status: 403 });
    // Tirage aléatoire : voiture ou upgrade
    const isCar = Math.random() < 0.7; // 70% voiture, 30% upgrade
    let card = null;
    if (isCar) {
      const allCars = await prisma.carCard.findMany();
      const ownedCars = await prisma.userCar.findMany({ where: { user_id: user.id } });
      const ownedCarIds = new Set(ownedCars.map((uc) => uc.car_id));
      const availableCars = allCars.filter((c) => !ownedCarIds.has(c.id));
      if (availableCars.length === 0) {
        return safeJsonResponse({ error: 'Erreur serveur' }, { status: 500 });
      }
      // Boucle de tirage sécurisé
      let success = false;
      let attempts = 0;
      let drawnCar = null;
      let lastError = null;
      const maxAttempts = availableCars.length;
      while (!success && attempts < maxAttempts) {
        drawnCar = availableCars[Math.floor(Math.random() * availableCars.length)];
        try {
          await prisma.userCar.create({ data: { user_id: user.id, car_id: drawnCar.id } });
          success = true;
        } catch (e) {
          attempts++;
          lastError = e;
        }
      }
      if (!success || !drawnCar) {
        return safeJsonResponse({ error: 'Tu possèdes déjà toutes les voitures !' }, { status: 400 });
      }
      card = {
        id: drawnCar.id,
        name: drawnCar.name,
        description: drawnCar.description,
        img_path: drawnCar.img_path,
        type: 'car',
      };
    } else {
      const allUpgrades = await prisma.upgradeCard.findMany();
      const ownedUpgrades = await prisma.userUpgrade.findMany({ where: { user_id: user.id } });
      const ownedUpgradeIds = new Set(ownedUpgrades.map((uu) => uu.upgrade_id));
      const availableUpgrades = allUpgrades.filter((u) => !ownedUpgradeIds.has(u.id));
      if (availableUpgrades.length === 0) {
        return safeJsonResponse({ error: 'Erreur serveur' }, { status: 500 });
      }
      let success = false;
      let attempts = 0;
      let drawnUpgrade = null;
      let lastError = null;
      const maxAttempts = availableUpgrades.length;
      while (!success && attempts < maxAttempts) {
        drawnUpgrade = availableUpgrades[Math.floor(Math.random() * availableUpgrades.length)];
        try {
          await prisma.userUpgrade.create({ data: { user_id: user.id, upgrade_id: drawnUpgrade.id } });
          success = true;
        } catch (e) {
          attempts++;
          lastError = e;
        }
      }
      if (!success || !drawnUpgrade) {
        return safeJsonResponse({ error: 'Tu possèdes déjà toutes les upgrades !' }, { status: 400 });
      }
      card = {
        id: drawnUpgrade.id,
        name: drawnUpgrade.name,
        description: drawnUpgrade.description,
        img_path: drawnUpgrade.img_path,
        type: 'upgrade',
      };
    }
    // Déduire l'argent
    await prisma.user.update({ where: { id: user.id }, data: { money: { decrement: 500 } } });
    return safeJsonResponse({ card });
  } catch (err) {
    console.error(err);
    return safeJsonResponse({ error: 'Erreur serveur' }, { status: 500 });
  }
} 