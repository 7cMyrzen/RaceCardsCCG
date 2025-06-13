import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth-utils';
import { safeJsonResponse } from '@/lib/api-utils';
import Pusher from 'pusher';
import { trackPath1, trackPath2, trackPath3 } from '@/data/map';
import { calculerDecelerationEtDistanceApres5s } from '@/lib/physics/deceleration';
import { applyEffectsToCarStats } from '@/lib/physics/acceleration';
import type { GameState, PlayerState, Penalty } from '@/types/game';
import type { Effect } from '@prisma/client';

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
    if (!user) return safeJsonResponse({ error: 'Non autorisé' }, { status: 401 });

    const { gameId, brakePercent } = await req.json();
    if (!gameId || !brakePercent) return safeJsonResponse({ error: 'Paramètres requis' }, { status: 400 });
    if (brakePercent < 1 || brakePercent > 100) return safeJsonResponse({ error: 'brakePercent invalide' }, { status: 400 });

    const game = await prisma.game.findUnique({ where: { id: Number(gameId) } });
    if (!game) return safeJsonResponse({ error: 'Partie introuvable' }, { status: 404 });

    if (game.currentPlayerId !== user.id) {
      return safeJsonResponse({ error: "Ce n'est pas votre tour" }, { status: 403 });
    }

    let stateRaw = game.state;
    if (typeof stateRaw === 'string') {
      try { stateRaw = JSON.parse(stateRaw); } catch { stateRaw = {}; }
    }
    if (!stateRaw || typeof stateRaw !== 'object' || Array.isArray(stateRaw)) {
      stateRaw = { players: {}, turn: 1 };
    }
    const state = stateRaw as unknown as GameState;
    let players: Record<string, PlayerState> = state.players || {};
    const player = players[user.id];
    if (!player || !player.car) {
      return safeJsonResponse({ error: 'Aucune voiture sélectionnée' }, { status: 400 });
    }

    // Récupérer la map
    let map = null;
    if (game.circuitId === 1) map = trackPath1;
    if (game.circuitId === 2) map = trackPath2;
    if (game.circuitId === 3) map = trackPath3;
    if (!map) return safeJsonResponse({ error: 'Circuit inconnu' }, { status: 400 });

    // Appliquer les effets actifs (permanents + temporaires)
    const effectIds = [
      ...(player.upgrades ? player.upgrades.map((u: any) => u.effectId) : []),
      ...(player.tempEffects ? player.tempEffects.map((e: any) => e.effectId) : [])
    ];
    let effects: Effect[] = [];
    if (effectIds.length > 0) {
      effects = await prisma.effect.findMany({ where: { id: { in: effectIds } } });
    }
    let carStats = {
      max_speed: player.car.max_speed,
      weight: player.car.weight,
      power: player.car.power,
      zero_hundred: player.car.zero_hundred,
      drag_coefficient: player.car.drag_coefficient,
      frontal_area: player.car.frontal_area,
      rrc: player.car.rrc,
    };
    carStats = applyEffectsToCarStats(carStats, effects);
    // Utiliser les stats modifiées pour le calcul physique
    const oldDistance = player.distance || 0;
    const v0 = player.speed ? player.speed / 3.6 : 0;
    const masse = carStats.weight || 1200;
    const alpha = brakePercent / 100;
    const cd = carStats.drag_coefficient || 0.3;
    const area = carStats.frontal_area || 2.0;
    const muRoulis = carStats.rrc || 0.015;
    const muFrein = 0.7;

    // Calcul physique
    const { vitesse, distance } = calculerDecelerationEtDistanceApres5s(v0, masse, alpha, cd, area, muRoulis, muFrein);
    player.speed = Math.round(vitesse * 3.6); // km/h
    player.distance = Math.round(oldDistance + distance);
    const newDistance = player.distance;
    // Gestion des tours
    const mT = map.len;
    const oldLap = Math.floor(oldDistance / mT);
    const newLap = Math.floor(newDistance / mT);
    if (!player.lap) player.lap = 0;
    if (!player.diamonds) player.diamonds = 0;
    if (newLap > oldLap) player.lap += (newLap - oldLap);
    // Récompense : 35 diamants par action
    player.diamonds += 35;
    // Récompense : 100 diamants par tour de map franchi
    if (newLap > oldLap) player.diamonds += 100 * (newLap - oldLap);
    // Vérifier la pénalité virage sur tout le segment parcouru (modulo mT)
    let penalty: Penalty | null = null;
    let crash = false;
    const vmax = player.car.max_speed ? player.car.max_speed / 3.6 : 0;
    for (const turn of map.turns) {
      for (const interval of turn.m) {
        const [start, end] = interval.split('-').map(Number);
        for (let lap = oldLap; lap <= newLap; lap++) {
          const offset = lap * mT;
          const minD = Math.min(oldDistance, newDistance) - offset;
          const maxD = Math.max(oldDistance, newDistance) - offset;
          if (end >= minD && start <= maxD) {
            let limit = 0;
            if (turn.type === 'PeuSerre') limit = vmax * 0.85;
            if (turn.type === 'Serre') limit = vmax * 0.6;
            if (turn.type === 'TresSerre') limit = vmax * 0.3;
            if (vitesse > limit) {
              const kmh = Math.round(vitesse * 3.6);
              const limKmh = Math.round(limit * 3.6);
              if (kmh - limKmh > 20) {
                player.speed = 0;
                crash = true;
                penalty = {
                  limit: limKmh,
                  speed: kmh,
                  crash: true,
                  message: `Crash ! Tu as dépassé la limite de ${limKmh} km/h dans un virage ${turn.type}. Immobilisé 1 tour.`
                };
                break;
              } else {
                player.speed = limKmh;
                penalty = {
                  limit: limKmh,
                  speed: kmh,
                  crash: false,
                  message: `Dépassement de la limite dans un virage ${turn.type} ! Vitesse réduite à la limite.`
                };
              }
            }
          }
        }
        if (crash) break;
      }
      if (crash) break;
    }

    // Vérifier la victoire (5 tours)
    if (player.lap >= 5) {
      (state as GameState).winnerId = user.id;
      await prisma.game.update({
        where: { id: game.id },
        data: { state },
      });
      // Enregistrer le résultat dans la table Result
      const looserId = game.player1Id === user.id ? game.player2Id : game.player1Id;
      await prisma.result.create({
        data: {
          winner_id: user.id,
          looser_id: looserId,
        }
      });
      // Récompense money
      await prisma.user.update({ where: { id: user.id }, data: { money: { increment: 1000 } } });
      await prisma.user.update({ where: { id: looserId }, data: { money: { increment: 500 } } });
      await pusher.trigger(`game-${game.id}`, 'game-ended', {
        gameId: game.id,
        winnerId: user.id,
        message: '🏁 Victoire ! Vous avez terminé 5 tours.'
      });
      return safeJsonResponse({
        gameId: game.id,
        winnerId: user.id,
        message: '🏁 Victoire ! Vous avez terminé 5 tours.'
      });
    }

    // Passe le tour à l'autre joueur
    const nextPlayerId = game.currentPlayerId === game.player1Id ? game.player2Id : game.player1Id;
    await prisma.game.update({
      where: { id: game.id },
      data: { currentPlayerId: nextPlayerId, state },
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
      currentPlayerId: nextPlayerId,
      penalty,
    }));

    return safeJsonResponse({
      gameId: game.id,
      currentPlayerId: nextPlayerId,
      speed: player.speed,
      distance: player.distance,
      penalty,
      message: penalty ? penalty.message : 'Tour passé au joueur suivant',
    });
  } catch (err) {
    console.error(err);
    return safeJsonResponse({ error: 'Erreur serveur' }, { status: 500 });
  }
} 