export function calculerDecelerationEtDistanceApres5s(
    v0: number,         // Vitesse initiale (m/s)
    masse: number,      // Masse du véhicule (kg)
    alpha: number,      // Intensité de freinage (0 à 1)
    cd = 0.3,           // Coefficient de traînée
    area = 2.0,         // Surface frontale (m²)
    muRoulis = 0.015,   // Coefficient de frottement de roulement
    muFrein = 0.7       // Coefficient de freinage max
): { vitesse: number; distance: number } {
    if (alpha < 0 || alpha > 1) {
        throw new Error("Alpha doit être entre 0 et 1");
    }

    const g = 9.81;
    const rho = 1.2;
    const tTotal = 5;
    const dt = 0.05;
    const steps = Math.floor(tTotal / dt);

    let v = v0;
    let distance = 0;

    for (let i = 0; i < steps; i++) {
        if (v <= 0) {
            v = 0;
            break;
        }

        const fFreinMax = muFrein * masse * g;
        const fFrein = alpha * fFreinMax;
        const fDrag = 0.5 * rho * cd * area * v * v;
        const fRoulis = muRoulis * masse * g;
        const fResistance = fFrein + fDrag + fRoulis;

        const aNette = -fResistance / masse;

        v += aNette * dt;
        v = Math.max(0, v);

        distance += v * dt;
    }

    return { vitesse: v, distance };
}
