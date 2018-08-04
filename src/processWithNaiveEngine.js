import { Body } from 'matter-js';
import { RED, BLUE } from './consts';

const K = 0.01;

const absClamp = (a, b) => {
  return Math.abs(a) > Math.abs(b)
    ? b
    : a;
};

const applyCorrection = (sphere, dt, intendedVelocity) => {
  const actualVelocity = sphere.rigidBody.velocity;
  const correctionVelocity = {
    x: intendedVelocity.x - actualVelocity.x,
    y: intendedVelocity.y - actualVelocity.y,
  };
  const correctionSpeed = Math.hypot(correctionVelocity.x, correctionVelocity.y);
  const normalizedVelocity = correctionSpeed === 0
    ? { x: 0, y: 0 }
    : {
      x: correctionVelocity.x / correctionSpeed,
      y: correctionVelocity.y / correctionSpeed,
    };
  const maximumCorrectionVelocity = {
    x: absClamp(normalizedVelocity.x * sphere.moveSpeed * K, correctionVelocity.x),
    y: absClamp(normalizedVelocity.y * sphere.moveSpeed * K, correctionVelocity.y),
  };
  Body.applyForce(
    sphere.rigidBody,
    sphere.rigidBody.position,
    {
      x: maximumCorrectionVelocity.x * dt * 1e-3,
      y: maximumCorrectionVelocity.y * dt * 1e-3,
    }
  );
};

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
    //   gradually to come to a stop.
    if (sphere.currentTarget === null) {
      applyCorrection(sphere, dt, { x: 0, y: 0 });
      continue;
    }
    // If we are in firing range, gradually
    //   come to a stop and fire if our cooldown
    //   permits it.
    // Else, move toward our target.
    if (dist <= sphere.attackingRange) {
      applyCorrection(sphere, dt, { x: 0, y: 0 });
      if (sphere.currentCooldown <= 0) {
        sphere.currentCooldown = sphere.cooldown;
        sphere.currentTarget.currentHealth -= sphere.damage;
      }
    } else {
      const ndx = dx / dist;
      const ndz = dz / dist;
      applyCorrection(sphere, dt, {
        x: ndx * sphere.moveSpeed,
        y: ndz * sphere.moveSpeed,
      });
    }
  }
};

export default processWithNaiveEngine;
