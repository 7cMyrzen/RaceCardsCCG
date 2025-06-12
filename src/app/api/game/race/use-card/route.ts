import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth-utils';
import { safeJsonResponse } from '@/lib/api-utils';
import Pusher from 'pusher';

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return safeJsonResponse({ error: 'Non autorisé' }, { status: 401 });
    }

    const { gameId, cardId, type } = await req.json();
    if (!gameId || !cardId || !['car', 'upgrade'].includes(type)) {
      return safeJsonResponse({ error: 'Paramètres invalides' }, { status: 400 });
    }

    // Vérifier que la partie existe
    const game = await prisma.game.findUnique({ where: { id: Number(gameId) } });
    if (!game) return safeJsonResponse({ error: 'Partie introuvable' }, { status: 404 });
    let state = game.state || {};
    if (typeof state === 'string') {
      try { state = JSON.parse(state); } catch { state = {}; }
    }
    // Sécurisation de l'accès à state.players
    let players: Record<string, any> = {};
    if (typeof state === 'object' && state !== null && 'players' in state && typeof state.players === 'object' && state.players !== null) {
      players = state.players as Record<string, any>;
    }

    // Changement de voiture à tout moment
    if (type === 'car' && players && players[user.id]) {
      // Récupérer la carte voiture
      const car = await prisma.carCard.findUnique({ where: { id: Number(cardId) } });
      if (!car) return safeJsonResponse({ error: 'Véhicule introuvable' }, { status: 404 });
      const cost = car.cost;
      if (players[user.id].diamonds < cost) {
        return safeJsonResponse({ error: 'Pas assez de diamants pour ce véhicule' }, { status: 403 });
      }
      // Déduire le coût et enregistrer le véhicule
      players[user.id].diamonds -= cost;
      players[user.id].car = {
        id: car.id,
        name: car.name,
        max_speed: car.max_speed,
        cost: car.cost,
        img_path: car.img_path
      };
      // Réassigne dans state
      if (typeof state === 'object' && state !== null) {
        (state as any).players = players;
      }
      await prisma.game.update({
        where: { id: game.id },
        data: { state }
      });
      // Notifier via Pusher
      function sanitizeBigInt(obj: any): any {
        if (Array.isArray(obj)) return obj.map(sanitizeBigInt);
        if (obj && typeof obj === 'object') {
          const out: any = {};
          for (const k in obj) {
            out[k] = typeof obj[k] === 'bigint' ? obj[k].toString() : sanitizeBigInt(obj[k]);
          }
          return out;
        }
        return obj;
      }
      await pusher.trigger(`game-${game.id}`, 'turn-changed', sanitizeBigInt({
        gameId: game.id,
        currentPlayerId: game.currentPlayerId,
        state
      }));
      return safeJsonResponse({ success: true, message: 'Véhicule changé, tu peux jouer ton action !', state });
    }

    // Application d'une carte upgrade
    if (type === 'upgrade' && players && players[user.id]) {
      // Récupérer la carte upgrade et son effet
      const upgrade = await prisma.upgradeCard.findUnique({ where: { id: Number(cardId) }, include: { Effect: true } });
      if (!upgrade) return safeJsonResponse({ error: 'Amélioration introuvable' }, { status: 404 });
      const effect = upgrade.Effect;
      if (!effect) return safeJsonResponse({ error: 'Effet introuvable' }, { status: 404 });
      const cost = upgrade.cost;
      if (players[user.id].diamonds < cost) {
        return safeJsonResponse({ error: 'Pas assez de diamants pour cette amélioration' }, { status: 403 });
      }
      players[user.id].diamonds -= cost;
      // Initialiser les listes si besoin
      if (!players[user.id].upgrades) players[user.id].upgrades = [];
      if (!players[user.id].tempEffects) players[user.id].tempEffects = [];
      // Appliquer l'effet
      if (effect.is_upgrade) {
        // Permanent : on ajoute à upgrades
        players[user.id].upgrades.push({ effectId: effect.id, appliedAt: Date.now() });
      } else {
        // Temporaire : expire au prochain tour
        const currentTurn = (state.turn || 0);
        players[user.id].tempEffects.push({ effectId: effect.id, expiresAtTurn: currentTurn + 1 });
      }
      // Réassigne dans state
      if (typeof state === 'object' && state !== null) {
        (state as any).players = players;
      }
      await prisma.game.update({
        where: { id: game.id },
        data: { state }
      });
      // Notifier via Pusher
      function sanitizeBigInt(obj: any): any {
        if (Array.isArray(obj)) return obj.map(sanitizeBigInt);
        if (obj && typeof obj === 'object') {
          const out: any = {};
          for (const k in obj) {
            out[k] = typeof obj[k] === 'bigint' ? obj[k].toString() : sanitizeBigInt(obj[k]);
          }
          return out;
        }
        return obj;
      }
      await pusher.trigger(`game-${game.id}`, 'turn-changed', sanitizeBigInt({
        gameId: game.id,
        currentPlayerId: game.currentPlayerId,
        state
      }));
      return safeJsonResponse({ success: true, message: effect.is_upgrade ? 'Amélioration appliquée (permanente)' : 'Effet temporaire appliqué', state });
    }

    // Vérifier que la carte appartient bien au deck actif du joueur
    const deck = await prisma.deck.findFirst({
      where: { user_id: user.id, is_active: true },
      include: {
        DeckCar: true,
        DeckUpgrade: true,
      },
    });
    if (!deck) return safeJsonResponse({ error: 'Aucun deck actif' }, { status: 403 });

    let found = false;
    if (type === 'car') {
      found = deck.DeckCar.some((c) => c.car_id == cardId);
    } else {
      found = deck.DeckUpgrade.some((u) => u.upgrade_id == cardId);
    }
    if (!found) return safeJsonResponse({ error: 'Carte non trouvée dans le deck actif' }, { status: 403 });

    // TODO: Appliquer la logique métier ici (effet de la carte sur la partie/game, coût, etc.)
    // Exemple: await prisma.game.update({ ... })

    // Pour l'instant, on retourne juste un succès générique
    return safeJsonResponse({ success: true, message: 'Carte utilisée (logique à compléter)' });
  } catch (err) {
    console.error(err);
    return safeJsonResponse({ error: 'Erreur serveur' }, { status: 500 });
  }
} 