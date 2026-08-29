export function getSizeAnalogy(diameterMeters: number): string {
  if (diameterMeters < 2) return "Size of a microwave";
  if (diameterMeters < 5) return "Size of a car";
  if (diameterMeters < 15) return "Size of a bus";
  if (diameterMeters < 30) return "Size of a house";
  if (diameterMeters < 75) return "Size of a commercial airplane";
  if (diameterMeters < 150) return "Size of a football field";
  if (diameterMeters < 300) return "Size of a large cruise ship";
  if (diameterMeters < 500) return "Size of the Empire State Building";
  if (diameterMeters < 1000) return "Size of a small mountain";
  if (diameterMeters < 5000) return "Size of a large city";
  return "City-killer class (Massive)";
}

export function getSpeedAnalogy(velocityKmPerSec: number): string {
  // Speed of sound is ~0.343 km/s
  // Rifle bullet is ~1 km/s
  // Commercial jet is ~0.25 km/s
  if (velocityKmPerSec < 1) return `Faster than a commercial jet`;
  if (velocityKmPerSec < 5) return `${Math.round(velocityKmPerSec)}x the speed of a rifle bullet`;
  if (velocityKmPerSec < 15) return `${Math.round(velocityKmPerSec)}x faster than a bullet`;
  if (velocityKmPerSec < 30) return `${Math.round(velocityKmPerSec / 8)}x faster than the Space Shuttle`; // space shuttle orbital velocity ~7.7 km/s
  return `Hypersonic (Unfathomably fast)`;
}

export function getDistanceAnalogy(missDistanceLunar: number): string {
  if (missDistanceLunar < 1) {
    return `Closer than the Moon!`;
  }
  if (missDistanceLunar === 1) {
    return `Exactly the distance to the Moon`;
  }
  return `${Math.round(missDistanceLunar)}x further than the Moon`;
}
