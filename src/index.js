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
  SphereBufferGeometry,
} from 'three';
import OrbitControls from 'three-orbitcontrols';
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

const RED = 0xaa0000;
const BLUE = 0x0000aa;
const makeSphere = (color, r = 1, x = 0, y = 0, z = 0) => {
  const mesh = new Mesh(
    new SphereBufferGeometry(r, 32, 32),
    new MeshStandardMaterial({ color })
  );
  mesh.position.set(x, y, z);
  return mesh;
};
scene.add(makeSphere(RED, 1, 0, 1, 0));


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
