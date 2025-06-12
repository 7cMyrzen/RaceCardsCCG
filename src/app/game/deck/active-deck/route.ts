import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth-utils';
import { safeJsonResponse } from '@/lib/api-utils';

export async function GET(req: NextRequest) {
    try {
        const user = await getUserFromRequest(req);
        if (!user) {
            return safeJsonResponse({ error: 'Non autorisé' }, { status: 401 });
        }

        // On récupère le deck actif du joueur
        const deck = await prisma.deck.findFirst({
            where: { user_id: user.id, is_active: true },
            include: {
                DeckCar: { include: { CarCard: true } },
                DeckUpgrade: { include: { UpgradeCard: true } },
            },
        });

        if (!deck) {
            return safeJsonResponse({ error: 'Aucun deck actif' }, { status: 404 });
        }

        // On formate les cartes pour l'UI
        const carCards = deck.DeckCar.map((c) => ({
            id: c.CarCard.id,
            type: 'car',
            name: c.CarCard.name,
            description: c.CarCard.description,
            img_path: c.CarCard.img_path,
            cost: c.CarCard.cost,
        }));
        const upgradeCards = deck.DeckUpgrade.map((u) => ({
            id: u.UpgradeCard.id,
            type: 'upgrade',
            name: u.UpgradeCard.name,
            description: u.UpgradeCard.description,
            img_path: u.UpgradeCard.img_path,
            cost: u.UpgradeCard.cost,
        }));

        return safeJsonResponse({
            id: deck.id,
            name: deck.name,
            cards: [...carCards, ...upgradeCards],
        });
    } catch (err) {
        console.error(err);
        return safeJsonResponse({ error: 'Erreur serveur' }, { status: 500 });
    }
}
