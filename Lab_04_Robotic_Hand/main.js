import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Lab 4: Hierarchical joints. Rotating a knuckle rotates every later segment.
const stage = document.querySelector('#stage');
const scene = new THREE.Scene();
scene.background = new THREE.Color('#091827');
const camera = new THREE.PerspectiveCamera(44, 1, .1, 100);
camera.position.set(3, 2.4, 11.9);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
stage.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, .45, 0);
controls.minDistance = 5;
controls.maxDistance = 25;
scene.add(new THREE.HemisphereLight('#c4f2ff', '#19314e', 2));
const key = new THREE.DirectionalLight('#ffffff', 2.5);
key.position.set(-5, 9, 9);
scene.add(key);
const rim = new THREE.DirectionalLight('#62d0ff', 1.6);
rim.position.set(5, 4, -7);
scene.add(rim);

const metal = new THREE.MeshStandardMaterial({ color: '#8aa8c2', metalness: .65, roughness: .31 });
const darkMetal = new THREE.MeshStandardMaterial({ color: '#243a50', metalness: .6, roughness: .37 });
const accent = new THREE.MeshStandardMaterial({ color: '#56edd2', metalness: .42, roughness: .29, emissive: '#1a645b', emissiveIntensity: .28 });
const palmGroup = new THREE.Group();
scene.add(palmGroup);
function box(width, height, depth, material, parent, x, y, z = 0) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
  mesh.position.set(x, y, z);
  parent.add(mesh);
  return mesh;
}
function joint(parent, radius) {
  const ball = new THREE.Mesh(new THREE.SphereGeometry(radius, 16, 12), accent);
  parent.add(ball);
}
// Palm and a small wrist section.
box(3.35, 3.0, .64, metal, palmGroup, 0, -.1);
box(3.0, .18, .72, darkMetal, palmGroup, 0, 1.42);
box(2.0, 1.25, .7, darkMetal, palmGroup, 0, -2.17);
box(2.2, .23, .85, accent, palmGroup, 0, -1.68);
for (const x of [-1.22, -.45, .35, 1.13]) box(.09, 1.95, .07, darkMetal, palmGroup, x, -.1, .35);

const fingers = {};
/** Create a 3-part finger with local axes placed at each bending joint. */
function createFinger(name, baseX, baseY, widths, lengths, z = 0) {
  const root = new THREE.Group();
  root.position.set(baseX, baseY, z);
  palmGroup.add(root);
  let current = root;
  const pivots = [];
  lengths.forEach((length, index) => {
    const pivot = new THREE.Group();
    if (index > 0) pivot.position.y = lengths[index - 1];
    current.add(pivot);
    joint(pivot, widths[index] * .56);
    box(widths[index], length * .92, .52 - index * .08, index === 1 ? darkMetal : metal, pivot, 0, length / 2);
    box(widths[index] * .62, .09, .08, accent, pivot, 0, length * .65, .29);
    pivots.push(pivot);
    current = pivot;
  });
  fingers[name] = { root, pivots };
}
// From the viewer's left to right: index, middle, ring, pinky.
createFinger('index', -1.15, 1.44, [.54, .48, .40], [1.02, .77, .54]);
createFinger('middle', -.37, 1.44, [.58, .51, .42], [1.23, .93, .65]);
createFinger('ring', .43, 1.44, [.56, .49, .40], [1.15, .86, .58]);
createFinger('pinky', 1.2, 1.4, [.43, .37, .32], [.83, .66, .45]);
// Thumb is anchored to the LEFT edge of the palm and points up and left.
createFinger('thumb', -1.73, -.53, [.68, .57, .46], [1.0, .78, .46], .02);

const ids = ['thumb', 'index', 'middle', 'ring', 'pinky'];
function applyPose(values) {
  for (const name of ids) {
    const input = document.getElementById(name);
    if (values) input.value = values[name];
    const amount = Number(input.value) / 100;
    const { root, pivots } = fingers[name];
    if (name === 'thumb') {
      root.rotation.z = 1.12 - amount * .30;
      pivots[0].rotation.x = amount * 1.00;
      pivots[1].rotation.x = amount * 1.12;
      pivots[2].rotation.x = amount * .58;
    } else {
      pivots[0].rotation.x = amount * .86;
      pivots[1].rotation.x = amount * 1.12;
      pivots[2].rotation.x = amount * .78;
    }
    document.getElementById(`${name}Value`).textContent = `${input.value}%`;
  }
  const average = ids.reduce((sum, name) => sum + Number(document.getElementById(name).value), 0) / ids.length;
  document.getElementById('gripValue').textContent = `${Math.round(average)}%`;
  document.getElementById('grip').value = average;
}
const presets = {
  open: { thumb: 0, index: 0, middle: 0, ring: 0, pinky: 0 },
  fist: { thumb: 75, index: 100, middle: 100, ring: 100, pinky: 100 },
  point: { thumb: 70, index: 0, middle: 100, ring: 100, pinky: 100 },
  peace: { thumb: 75, index: 0, middle: 0, ring: 100, pinky: 100 },
};
for (const button of document.querySelectorAll('[data-pose]')) {
  button.addEventListener('click', () => {
    applyPose(presets[button.dataset.pose]);
    for (const element of document.querySelectorAll('[data-pose]')) element.classList.toggle('primary', element === button);
  });
}
for (const name of ids) {
  document.getElementById(name).addEventListener('input', () => {
    applyPose();
    document.querySelectorAll('[data-pose]').forEach(element => element.classList.remove('primary'));
  });
}
document.querySelector('#grip').addEventListener('input', event => {
  applyPose(Object.fromEntries(ids.map(id => [id, event.target.value])));
  document.querySelectorAll('[data-pose]').forEach(element => element.classList.remove('primary'));
});
document.getElementById('resetView').addEventListener('click', () => {
  camera.position.set(3, 2.4, 11.9);
  controls.target.set(0, .45, 0);
  controls.update();
});
applyPose(presets.open);
function resize() { camera.aspect = stage.clientWidth / stage.clientHeight; camera.updateProjectionMatrix(); renderer.setSize(stage.clientWidth, stage.clientHeight); }
window.addEventListener('resize', resize);
resize();
function animate() { requestAnimationFrame(animate); controls.update(); renderer.render(scene, camera); }
animate();
