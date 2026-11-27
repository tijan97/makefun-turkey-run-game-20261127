// Screenshot staging: when the page opens with ?shot=start, ?shot=play or
// ?shot=end, the game poses itself in that exact state (title screen, a busy
// mid-run, or the caught end screen) so the maker's screenshots are real
// renders of the game's own code, not composites. Normal play ignores it.

import { makeObstacle } from './obstacles.js';

export function applyShot(game, shot) {
  if (shot === 'start') {
    game.state = 'title';
    return true;
  }
  if (shot === 'play') {
    game.state = 'playing';
    game.distance = 742;
    game.score = 1840;
    game.corn = 9;
    game.lives = 3;
    game.farmer.gap = 92;
    game.farmer.angry = 1;
    game.obstacles = [
      makeObstacle('oven', 620, game.world.groundY),
      makeObstacle('knife', 830, game.world.groundY),
      makeObstacle('hay', 1020, game.world.groundY),
      makeObstacle('corn', 480, game.world.groundY),
      makeObstacle('corn', 520, game.world.groundY),
      makeObstacle('fence', 1120, game.world.groundY),
    ];
    game.turkey.y = game.world.groundY - 40;
    game.turkey.vy = -120;
    game.turkey.jumpsUsed = 1;
    return true;
  }
  if (shot === 'end') {
    game.state = 'caught';
    game.escaped = false;
    game.distance = 913;
    game.score = 2210;
    game.corn = 12;
    game.lives = 0;
    game.farmer.gap = 55;
    return true;
  }
  return false;
}
