import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  Mesh,
  Vector3,
  MeshStandardMaterial,
  PlaneGeometry,
  SpotLight,
  HemisphereLight,
} from 'three';
import keys from './keys';

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

const floorMat = new MeshStandardMaterial({ color: 0x224400 });
floorMat.metalness = 0.0;
floorMat.roughness = 0.8;
const floor = new Mesh(
  new PlaneGeometry(100, 100, 50, 50),
  floorMat
);
floor.rotation.x -= 0.25 * TAU;
scene.add(floor);

// const SPOT_COLOR = 0xaaaaaa;
// const spot1 = new SpotLight(SPOT_COLOR);
// const spot2 = new SpotLight(SPOT_COLOR);
// const spot3 = new SpotLight(SPOT_COLOR);
// const spot4 = new SpotLight(SPOT_COLOR);
// scene.add(spot1);
// scene.add(spot2);
// scene.add(spot3);
// scene.add(spot4);
// spot1.power = spot2.power = spot3.power = spot4.power = 4 * Math.PI;
// spot1.position.set(50, 10, 50);
// spot2.position.set(-50, 10, 50);
// spot3.position.set(-50, 10, -50);
// spot4.position.set(50, 10, -50);
// spot1.lookAt(0, 0, 0);
// spot2.lookAt(0, 0, 0);
// spot3.lookAt(0, 0, 0);
// spot4.lookAt(0, 0, 0);
const hemLight = new HemisphereLight(0xffffbb, 0x080820, 4);
scene.add(hemLight);

camera.position.set(1, 1, 1).multiplyScalar(100);
camera.lookAt(new Vector3(0, 0, 0));

const update = (dt) => {

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
