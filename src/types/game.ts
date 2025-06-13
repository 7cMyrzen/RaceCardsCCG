import type { CarCard, Effect } from '@prisma/client';
// Types partagés pour le jeu de course automobile

export interface PlayerState {
  id: string;
  username?: string;
  diamonds: number;
  speed: number;
  distance: number;
  car: CarCard | null;
  upgrades?: UpgradeCard[];
  tempEffects?: Effect[];
  lap?: number;
  meters?: number;
}

export interface UpgradeCard {
  id: string | number;
  name: string;
  description: string;
  img_path: string;
  evolution: number;
  cost: number;
  effectId: number;
}

export interface Penalty {
  message: string;
  crash?: boolean;
  immobilized?: number;
  limit?: number;
  speed?: number;
}

export interface GameState {
  players: Record<string, PlayerState>;
  turn: number;
  winnerId?: string;
  [key: string]: any;
  // autres propriétés d'état
} 