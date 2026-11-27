// Gobble Run tuning: every number that shapes the chase lives here, so the
// difficulty curve can be read (and retuned) in one place.

export const CONFIG = {
  // World: the turkey runs left-to-right through three stages on the way to
  // the forest gate. Distances are in metres; the run ends at ESCAPE_DISTANCE.
  ESCAPE_DISTANCE: 1500,
  STAGES: [
    { name: 'The Farmyard', from: 0, sky: '#f6b352', hills: '#c98a3d', ground: '#a86f2e' },
    { name: 'The Barn', from: 500, sky: '#e88f3f', hills: '#a85f2c', ground: '#7d4a22' },
    { name: 'The Kitchen', from: 1000, sky: '#d96a35', hills: '#8a4a28', ground: '#5f3a20' },
  ],
  GRAVITY: 2600,
  JUMP_SPEED: 980,
  DOUBLE_JUMP_SPEED: 880,
  BASE_SPEED: 340,
  MAX_SPEED: 560,
  // The farmer gains on the turkey whenever it stumbles; he falls behind
  // while the turkey runs clean. Caught when the gap closes to zero.
  FARMER_START_GAP: 260,
  FARMER_CATCH_GAP: 26,
  STUMBLE_COST: 95,
  CLEAN_RECOVERY: 26,
  LIVES: 3,
  CORN_SCORE: 25,
  METRE_SCORE: 1,
  // Spawn pacing (seconds between hazards, shrinking as the run goes on).
  SPAWN_MIN: 0.85,
  SPAWN_MAX: 1.7,
  HAY_DURATION: 2.2,
  MUTE_KEY: 'KeyM',
};

export function stageAt(distance) {
  let stage = CONFIG.STAGES[0];
  for (const s of CONFIG.STAGES) if (distance >= s.from) stage = s;
  return stage;
}

export function speedAt(distance) {
  const t = Math.min(1, distance / CONFIG.ESCAPE_DISTANCE);
  return CONFIG.BASE_SPEED + (CONFIG.MAX_SPEED - CONFIG.BASE_SPEED) * t;
}

export function spawnGapAt(distance) {
  const t = Math.min(1, distance / CONFIG.ESCAPE_DISTANCE);
  return CONFIG.SPAWN_MAX - (CONFIG.SPAWN_MAX - CONFIG.SPAWN_MIN) * t;
}
