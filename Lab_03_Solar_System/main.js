import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Lab 3: Each moon pivot is parented to its planet's orbit pivot.
// That way the moon follows the planet while orbiting it independently.
const stage = document.querySelector('#stage');
const scene = new THREE.Scene();
scene.background = new THREE.Color('#020611');
const camera = new THREE.PerspectiveCamera(52, 1, .1, 400);
camera.position.set(3.5, 10.5, 16.5);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.65;
stage.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 0, 0);
controls.minDistance = 4;
controls.maxDistance = 45;
scene.add(new THREE.AmbientLight('#b1c8ff', .27));

// Seeded positions ensure the star field looks the same every run.
let seed = 12345;
function random() { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }
const starVertices = [];
for (let i = 0; i < 1200; i++) {
  const a = random() * Math.PI * 2;
  const h = random() * 2 - 1;
  const radius = 65 + random() * 85;
  const r = Math.sqrt(1 - h * h);
  starVertices.push(radius * r * Math.cos(a), radius * h, radius * r * Math.sin(a));
}
const starGeometry = new THREE.BufferGeometry();
starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
scene.add(new THREE.Points(starGeometry, new THREE.PointsMaterial({ color: '#c1d3ff', size: .28, sizeAttenuation: true })));

function sphere(radius, color, emissive = '#000000') {
  return new THREE.Mesh(new THREE.SphereGeometry(radius, 32, 24), new THREE.MeshStandardMaterial({ color, emissive, emissiveIntensity: emissive === '#000000' ? 0 : 1.1, roughness: 1 }));
}
function orbitRing(radius, color) {
  const points = [];
  for (let j = 0; j <= 128; j++) {
    const a = j * Math.PI * 2 / 128;
    points.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius));
  }
  return new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(points.slice(0, -1)), new THREE.LineBasicMaterial({ color, transparent: true, opacity: .52 }));
}
function label(text, color) {
  const canvas = document.createElement('canvas');
  canvas.width = 256; canvas.height = 64;
  const ctx = canvas.getContext('2d');
  ctx.font = 'bold 30px Arial';
  ctx.textAlign = 'center';
  ctx.fillStyle = color;
  ctx.fillText(text, 128, 41);
  const texture = new THREE.CanvasTexture(canvas);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false }));
  sprite.scale.set(1.7, .43, 1);
  return sprite;
}

const sun = sphere(.96, '#ffbc40', '#ff8b15');
scene.add(sun);
const sunLabel = label('SUN', '#ffdc91');
sunLabel.position.y = 1.5;
scene.add(sunLabel);
const sunlight = new THREE.PointLight('#ffeed2', 105, 0, 1.4);
scene.add(sunlight);
const sunGlow = new THREE.Mesh(new THREE.SphereGeometry(1.15, 32, 24), new THREE.MeshBasicMaterial({ color: '#ffac36', transparent: true, opacity: .09, side: THREE.BackSide }));
scene.add(sunGlow);

const earthOrbit = new THREE.Group(); // revolves around Sun
scene.add(earthOrbit);
const earth = sphere(.39, '#2787dc');
earth.position.x = 4.4;
earthOrbit.add(earth);
const earthLabel = label('EARTH', '#a5d9ff');
earthLabel.position.set(4.4, .82, 0);
earthOrbit.add(earthLabel);
const earthMoonPivot = new THREE.Group(); // revolves around Earth
// It follows Earth because it is a child of earthOrbit.
earthMoonPivot.position.x = 4.4;
earthOrbit.add(earthMoonPivot);
const moon = sphere(.14, '#d5dfec');
moon.position.x = .93;
earthMoonPivot.add(moon);
const moonLabel = label('MOON', '#d9e3f0');
moonLabel.position.set(.93, .37, 0);
moonLabel.scale.multiplyScalar(.6);
earthMoonPivot.add(moonLabel);
const moonPath = orbitRing(.93, '#5c8baa');
moonPath.position.x = 4.4;
earthOrbit.add(moonPath);

const marsOrbit = new THREE.Group(); // revolves around Sun
scene.add(marsOrbit);
const mars = sphere(.30, '#e47e52');
mars.position.x = 7.15;
marsOrbit.add(mars);
const marsLabel = label('MARS', '#ffc29c');
marsLabel.position.set(7.15, .72, 0);
marsOrbit.add(marsLabel);
const phobosPivot = new THREE.Group();
phobosPivot.position.x = 7.15;
marsOrbit.add(phobosPivot);
const phobos = sphere(.105, '#af9584');
phobos.position.x = .77;
phobosPivot.add(phobos);
const phobosLabel = label('PHOBOS', '#d9b6a3');
phobosLabel.position.set(.77, .31, 0);
phobosLabel.scale.multiplyScalar(.55);
phobosPivot.add(phobosLabel);
const phobosPath = orbitRing(.77, '#b78e77');
phobosPath.position.x = 7.15;
marsOrbit.add(phobosPath);

const earthPath = orbitRing(4.4, '#3472ac');
const marsPath = orbitRing(7.15, '#8b5345');
scene.add(earthPath, marsPath);
const allPaths = [earthPath, marsPath, moonPath, phobosPath];
const allLabels = [sunLabel, earthLabel, moonLabel, marsLabel, phobosLabel];
const speed = document.querySelector('#speed');
let paused = false;
speed.addEventListener('input', () => { document.querySelector('#speedValue').textContent = `${Number(speed.value).toFixed(1)}×`; });
document.querySelector('#orbits').addEventListener('change', event => { allPaths.forEach(p => p.visible = event.target.checked); });
document.querySelector('#labels').addEventListener('change', event => { allLabels.forEach(p => p.visible = event.target.checked); });
document.querySelector('#pause').addEventListener('click', event => { paused = !paused; event.target.textContent = paused ? 'Resume' : 'Pause'; });
document.querySelector('#reset').addEventListener('click', () => { camera.position.set(3.5, 10.5, 16.5); controls.target.set(0, 0, 0); controls.update(); });

function resize() {
  camera.aspect = stage.clientWidth / stage.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(stage.clientWidth, stage.clientHeight);
}
window.addEventListener('resize', resize);
resize();
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), .05) * Number(speed.value);
  if (!paused) {
    sun.rotation.y += dt * .11;
    earthOrbit.rotation.y += dt * .27;
    earth.rotation.y += dt * 1.15;
    earthMoonPivot.rotation.y += dt * 1.5;
    moon.rotation.y += dt * .24;
    marsOrbit.rotation.y += dt * .16;
    mars.rotation.y += dt * .94;
    phobosPivot.rotation.y += dt * 2.45;
  }
  controls.update();
  renderer.render(scene, camera);
}
animate();
