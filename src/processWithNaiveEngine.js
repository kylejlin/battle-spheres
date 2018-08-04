import { RED, BLUE } from './consts';

const processWithNaiveEngine = (spheres, dt) => {
  const reds = spheres.filter(s => s.team === RED);
  const blues = spheres.filter(s => s.team === BLUE);
  const getEnemies = (team) => {
    return team === RED
      ? blues
      : reds;
  };

  for (const sphere of spheres) {
    sphere.currentCooldown -= dt;

    let dx, dz, dist;

    // For the purpose of these comments
    //   "We" refers to `sphere`.

    // If we have a current target,
    //   then check if it is
    //   either dead or out of seeing range,
    //   and if so, then set it to null
    //   so we can find a new target.
    if (sphere.currentTarget) {
      if (sphere.currentTarget.currentHealth <= 0) {
        sphere.currentTarget = null;
      } else {
        dx = sphere.currentTarget.rigidBody.position.x - sphere.rigidBody.position.x;
        dz = sphere.currentTarget.rigidBody.position.y - sphere.rigidBody.position.y;
        dist = Math.hypot(dx, dz);
        if (dist > sphere.seeingRange) {
          sphere.currentTarget = null;
        }
      }
    }
    // If we have no current target,
    //   then choose the closest enemy.
    if (sphere.currentTarget === null) {
      const enemies = getEnemies(sphere.team);
      let closestEnemy = null;
      let closestDistance = Infinity;
      for (const enemy of enemies) {
        dx = enemy.rigidBody.position.x - sphere.rigidBody.position.x;
        dz = enemy.rigidBody.position.y - sphere.rigidBody.position.y;
        dist = Math.hypot(dx, dz);
        if (enemy.currentHealth > 0 && dist < closestDistance) {
          closestEnemy = enemy;
          closestDistance = dist;
        }
      }
      if (closestEnemy !== null && closestDistance <= sphere.seeingRange) {
        sphere.currentTarget = closestEnemy;
      }
    }
    // If one can't be found,
    //   there's nothing left to do.
    if (sphere.currentTarget === null) {
      continue;
    }
    // If we are in firing range, then fire
    //   assuming our current cooldown permits it.
    // Else, move toward our target.
    if (dist <= sphere.attackingRange) {
      if (sphere.currentCooldown <= 0) {
        sphere.currentCooldown = sphere.cooldown;
        sphere.currentTarget.currentHealth -= sphere.damage;
      }
    } else {
      const ndx = dx / dist;
      const ndz = dz / dist;
      sphere.rigidBody.position.x += ndx * dt * 1e-3 * sphere.moveSpeed;
      sphere.rigidBody.position.y += ndz * dt * 1e-3 * sphere.moveSpeed;
    }
  }
};

export default processWithNaiveEngine;
