import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  Mesh,
  Vector3,
  Vector2,
  MeshStandardMaterial,
  PlaneGeometry,
  SpotLight,
  HemisphereLight,
  SphereBufferGeometry,
  Raycaster,
} from 'three';
import OrbitControls from 'three-orbitcontrols';
import keys from './keys';
import battleField from './battleField';
import { RED, BLUE } from './consts';
import processWithNaiveEngine from './processWithNaiveEngine';

const TAU = 2 * Math.PI;

const scene = new Scene();
const camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
const renderer = new WebGLRenderer();
renderer.physicallyCorrectLights = true;
renderer.setSize(window.innerWidth, window.innerHeight);
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.render(scene, camera);
});
document.body.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);

const floorMat = new MeshStandardMaterial({ color: 0x224400 });
floorMat.metalness = 0.0;
floorMat.roughness = 0.8;
const floor = new Mesh(
  new PlaneGeometry(100, 100, 50, 50),
  floorMat
);
floor.rotation.x -= 0.25 * TAU;
scene.add(floor);

const hemLight = new HemisphereLight(0xffffbb, 0x080820, 4);
scene.add(hemLight);

camera.position.set(1, 1, 1).multiplyScalar(100);
camera.lookAt(new Vector3(0, 0, 0));
controls.update();

const makeAndAddSphereMesh = (color, r = 1) => {
  const mesh = new Mesh(
    new SphereBufferGeometry(r, 32, 32),
    new MeshStandardMaterial({ color })
  );
  scene.add(mesh);
  return mesh;
};

class BattleSphere {
  constructor({
    team,
    radius = 1,
    initHealth = 100,
    damage = 25,
    cooldown = 1.5e3,
    seeingRange = 50,
    attackingRange = 10,
    moveSpeed = 1,
    initPosition = { x: 0, y: 0, z: 0 },
  }) {
    this.team = team;
    this.radius = radius;
    this.damage = damage;
    this.cooldown = cooldown;
    this.seeingRange = seeingRange;
    this.attackingRange = attackingRange;
    this.moveSpeed = moveSpeed;
    this.mesh = makeAndAddSphereMesh(team, radius);

    this.currentHealth = initHealth;
    this.currentCooldown = 0;
    this.currentPosition = { ...initPosition };
    this.currentTarget = null;
  }

  removeMeshFromScene() {
    scene.remove(this.mesh);
  }
}

const state = {
  spheres: battleField.map(options => new BattleSphere(options)),
  mouse: { x: 0, y: 0 },
};

window.addEventListener('mousemove', ({ clientX, clientY }) => {
  state.mouse.x = (2 * clientX / window.innerWidth) - 1;
  state.mouse.y = -((2 * clientY / window.innerHeight) - 1);
});
window.addEventListener('click', (e) => {
  if (keys.K3) {
    for (const sphere of state.spheres) {
      sphere.removeMeshFromScene();
    }
    state.spheres.splice(0, Infinity);
  }
  const raycaster = new Raycaster();
  raycaster.setFromCamera(new Vector2(state.mouse.x, state.mouse.y), camera);
  const hits = raycaster.intersectObject(floor);
  if (hits.length > 0) {
    const [{ point }] = hits;
    if (keys.K1) {
      state.spheres.push(new BattleSphere({
        team: BLUE,
        initPosition: {
          x: point.x,
          y: 1,
          z: point.z,
        },
      }));
    }
    if (keys.K2) {
      state.spheres.push(new BattleSphere({
        team: RED,
        initPosition: {
          x: point.x,
          y: 1,
          z: point.z,
        },
      }));
    }
  }
});

const update = (dt) => {
  processWithNaiveEngine(state.spheres, dt);
  // Clean up dead spheres and update mesh positions of live spheres.
  for (let i = 0, len = state.spheres.length; i < len; i++) {
    const sphere = state.spheres[i];
    if (sphere.currentHealth <= 0) {
      sphere.removeMeshFromScene();
      state.spheres.splice(i, 1);
      i--;
      len--;
      continue;
    }

    sphere.mesh.position.set(sphere.currentPosition.x, sphere.currentPosition.y, sphere.currentPosition.z);
  }
};

let then = Date.now();
const gameLoop = () => {
  requestAnimationFrame(gameLoop);

  const now = Date.now();
  const dt = now - then;
  then = now;

  update(dt);
  renderer.render(scene, camera);
};
gameLoop();
