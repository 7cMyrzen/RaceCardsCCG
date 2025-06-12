export function calculerVitesseEtDistanceApres5s(
    v0: number,         // Vitesse initiale (m/s)
    vmax: number,       // Vitesse max du véhicule (m/s)
    masse: number,      // Masse du véhicule (kg)
    cv: number,         // Puissance en chevaux
    alpha: number,      // Intensité d'accélération (0 à 1)
    t_0_100 = 8.0,      // Temps pour 0 → 100 km/h
    cd = 0.3,           // Coefficient de traînée
    area = 2.0,         // Surface frontale (m²)
    mu = 0.015          // Coefficient de roulement
): { vitesse: number; distance: number } {
    if (alpha < 0 || alpha > 1) {
        throw new Error("Alpha doit être entre 0 et 1");
    }

    const g = 9.81;
    const rho = 1.2;
    const puissance = cv * 735.5; // conversion CV → watts
    const v100 = 27.78;
    const aMax = v100 / t_0_100;
    const tTotal = 5;
    const dt = 0.05;
    const steps = Math.floor(tTotal / dt);

    let v = v0;
    let distance = 0;

    for (let i = 0; i < steps; i++) {
        const ramp = Math.min(1.0, v / 5.0 + 0.2);
        const fMoteur = (alpha * puissance / Math.max(v, 0.1)) * ramp;
        const aMoteur = fMoteur / masse;
        const a = Math.min(aMoteur, aMax);

        const fDrag = 0.5 * rho * cd * area * v * v;
        const fRoulis = mu * masse * g;
        const fResistance = fDrag + fRoulis;

        let aNette = a - fResistance / masse;
        if (aNette < 0 && alpha === 0) {
            aNette = -fResistance / masse;
        } else if (aNette < 0) {
            aNette = 0;
        }

        v += aNette * dt;
        v = Math.max(0, Math.min(v, vmax));

        distance += v * dt;
    }

    return { vitesse: v, distance };
}

// Applique une liste d'effets (objets Effect) sur les stats d'une voiture
export function applyEffectsToCarStats(carStats: any, effects: any[]): any {
  // Copie défensive
  let stats = { ...carStats };
  for (const effect of effects) {
    for (const key of [
      'max_speed', 'weight', 'power', 'zero_hundred',
      'drag_coefficient', 'frontal_area', 'rrc', 'actual_speed']) {
      const val = effect[key];
      if (!val || typeof val !== 'string') continue;
      // Pourcentages
      if (val.endsWith('%')) {
        const sign = val.startsWith('-') ? -1 : 1;
        const pct = parseFloat(val.replace('%', '').replace('+', '').replace('-', ''));
        if (!isNaN(pct)) {
          if (typeof stats[key] === 'number') {
            stats[key] = stats[key] * (1 + sign * pct / 100);
          }
        }
      } else {
        // Valeur absolue (ex: -0.02, +0.1)
        const num = parseFloat(val);
        if (!isNaN(num) && typeof stats[key] === 'number') {
          stats[key] = stats[key] + num;
        }
      }
    }
  }
  return stats;
}
