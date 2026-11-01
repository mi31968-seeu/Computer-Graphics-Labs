import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Lab 2 includes Minimum (basic operations), Standard (dot/cross/projection),
// and Challenge (mandatory ray-plane intersection).
const stage = document.querySelector('#stage');
const scene = new THREE.Scene();
scene.background = new THREE.Color('#091828');
const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 150);
camera.position.set(9, 7, 10);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
stage.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 0.6, 0);
controls.minDistance = 4;
controls.maxDistance = 35;
scene.add(new THREE.AmbientLight(0xffffff, 1.6));
scene.add(new THREE.AxesHelper(4));
const floorGrid = new THREE.GridHelper(18, 18, '#467284', '#29465b');
floorGrid.position.y = -1.01;
scene.add(floorGrid);

const vectorGroup = new THREE.Group();
const rayGroup = new THREE.Group();
scene.add(vectorGroup, rayGroup);
const rayPlane = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), new THREE.MeshBasicMaterial({ color: '#4284b2', side: THREE.DoubleSide, transparent: true, opacity: 0.22, depthWrite: false }));
rayPlane.rotation.x = -Math.PI / 2;
rayPlane.position.y = -1;
rayGroup.add(rayPlane);
const planeBorder = new THREE.GridHelper(12, 12, '#3a9ecd', '#32617b');
planeBorder.position.y = -1;
rayGroup.add(planeBorder);
const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 1); // y = -1

function fmt(n) { return Math.abs(n) < 0.0005 ? '0.000' : n.toFixed(3); }
function tuple(v) { return `(${fmt(v.x)}, ${fmt(v.y)}, ${fmt(v.z)})`; }
function vec(prefix) {
  return new THREE.Vector3(...['x', 'y', 'z'].map(axis => Number(document.querySelector(`#${prefix}${axis}`).value) || 0));
}
function clearDynamic(group) {
  for (const item of [...group.children]) {
    if (item.userData.dynamic) {
      group.remove(item);
      item.traverse(object => {
        object.geometry?.dispose();
        if (Array.isArray(object.material)) object.material.forEach(m => m.dispose());
        else object.material?.dispose();
      });
    }
  }
}
function addArrow(group, origin, vector, color, lengthLimit = null) {
  const magnitude = vector.length();
  if (magnitude < 0.0001) return;
  const length = lengthLimit === null ? magnitude : lengthLimit;
  const arrow = new THREE.ArrowHelper(vector.clone().normalize(), origin, length, color, Math.min(.4, length * .24), Math.min(.18, length * .1));
  arrow.userData.dynamic = true;
  group.add(arrow);
}
function addDot(group, position, color, radius = .15) {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 16, 12), new THREE.MeshBasicMaterial({ color }));
  mesh.position.copy(position);
  mesh.userData.dynamic = true;
  group.add(mesh);
}

let tab = 'minimum';
function updateVectors() {
  clearDynamic(vectorGroup);
  const a = vec('a');
  const b = vec('b');
  const sum = a.clone().add(b);
  const diff = a.clone().sub(b);
  const scale = a.clone().multiplyScalar(2);
  const unit = a.lengthSq() ? a.clone().normalize() : new THREE.Vector3();
  const dot = a.dot(b);
  const cross = new THREE.Vector3().crossVectors(a, b);
  const angle = a.lengthSq() && b.lengthSq() ? THREE.MathUtils.radToDeg(a.angleTo(b)) : null;
  const projection = b.lengthSq() ? b.clone().multiplyScalar(dot / b.lengthSq()) : new THREE.Vector3();
  const distance = a.distanceTo(b);

  document.querySelector('#resultMin').textContent =
    `A + B = ${tuple(sum)}\nA − B = ${tuple(diff)}\n2 × A = ${tuple(scale)}\n|A| = ${fmt(a.length())}\nNormalize A = ${tuple(unit)}`;
  document.querySelector('#resultStd').textContent =
    `A · B = ${fmt(dot)}\nA × B = ${tuple(cross)}\nAngle = ${angle === null ? 'undefined (zero vector)' : `${fmt(angle)}°`}\nDistance = ${fmt(distance)}\nProjection of A onto B = ${b.lengthSq() ? tuple(projection) : 'undefined (B is zero)'}`;

  if (tab === 'challenge') return;
  addArrow(vectorGroup, new THREE.Vector3(), a, '#56f4da');
  addArrow(vectorGroup, new THREE.Vector3(), b, '#ff9d67');
  let result = new THREE.Vector3();
  if (tab === 'minimum') {
    const selection = document.querySelector('#operationMin').value;
    result = { add: sum, subtract: diff, scale, normalize: unit }[selection];
  } else {
    result = document.querySelector('#operationStd').value === 'cross' ? cross : projection;
  }
  addArrow(vectorGroup, new THREE.Vector3(), result, '#ffda73');
  addDot(vectorGroup, new THREE.Vector3(), '#ffffff', .10);
}
function updateRay() {
  clearDynamic(rayGroup);
  const height = Number(document.querySelector('#originHeight').value);
  const slope = Number(document.querySelector('#raySlope').value);
  document.querySelector('#originHeightValue').textContent = height.toFixed(1);
  document.querySelector('#raySlopeValue').textContent = slope.toFixed(1);
  const origin = new THREE.Vector3(0, height, 0);
  const direction = new THREE.Vector3(.8, slope, -.2).normalize();
  const ray = new THREE.Ray(origin, direction);
  const hit = ray.intersectPlane(plane, new THREE.Vector3());
  const endDistance = hit ? Math.min(origin.distanceTo(hit), 14) : 9;
  addArrow(rayGroup, origin, direction, '#ffda73', endDistance);
  addDot(rayGroup, origin, '#ffae7a', .16);
  if (hit) {
    addDot(rayGroup, hit, '#73ffad', .21);
    const t = hit.clone().sub(origin).dot(direction);
    document.querySelector('#resultRay').textContent =
      `Ray R(t) = O + tD (t ≥ 0)\nOrigin O = ${tuple(origin)}\nDirection D = ${tuple(direction)}\nPlane: y = −1\nHIT ✓  t = ${fmt(t)}\nIntersection = ${tuple(hit)}`;
  } else {
    document.querySelector('#resultRay').textContent =
      `Ray R(t) = O + tD (t ≥ 0)\nOrigin O = ${tuple(origin)}\nDirection D = ${tuple(direction)}\nPlane: y = −1\nNO INTERSECTION in the forward ray direction.`;
  }
}
function refresh() { updateVectors(); updateRay(); }
for (const id of ['ax','ay','az','bx','by','bz','operationMin','operationStd','originHeight','raySlope']) {
  document.getElementById(id).addEventListener('input', refresh);
}
for (const button of document.querySelectorAll('[data-tab]')) {
  button.addEventListener('click', () => {
    tab = button.dataset.tab;
    for (const btn of document.querySelectorAll('[data-tab]')) btn.classList.toggle('active', btn === button);
    for (const panel of document.querySelectorAll('.tab-panel')) panel.classList.toggle('selected', panel.id === tab);
    vectorGroup.visible = tab !== 'challenge';
    rayGroup.visible = tab === 'challenge';
    floorGrid.visible = tab !== 'challenge';
    refresh();
  });
}
rayGroup.visible = false;
refresh();
function resize() {
  camera.aspect = stage.clientWidth / stage.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(stage.clientWidth, stage.clientHeight);
}
window.addEventListener('resize', resize);
resize();
function animate() { requestAnimationFrame(animate); controls.update(); renderer.render(scene, camera); }
animate();
