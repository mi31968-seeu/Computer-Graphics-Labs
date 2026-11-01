import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Lab 1: Create a scene, cube, camera, lights, and an animation loop.
const stage = document.querySelector('#stage');
const scene = new THREE.Scene();
scene.background = new THREE.Color('#081525');
scene.fog = new THREE.Fog('#081525', 12, 28);

const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
camera.position.set(4.3, 3.2, 5.8);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
stage.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 0.35, 0);
controls.minDistance = 2.8;
controls.maxDistance = 16;

scene.add(new THREE.AmbientLight('#bbd6ff', 1.0));
const light = new THREE.DirectionalLight('#ffffff', 3);
light.position.set(3, 6, 5);
light.castShadow = true;
light.shadow.mapSize.set(1024, 1024);
scene.add(light);

const geometry = new THREE.BoxGeometry(2, 2, 2);
const material = new THREE.MeshStandardMaterial({ color: '#48bdce', metalness: 0.25, roughness: 0.34 });
const cube = new THREE.Mesh(geometry, material);
cube.position.y = 1.65;
cube.castShadow = true;
cube.receiveShadow = true;
scene.add(cube);

const outlines = new THREE.LineSegments(new THREE.EdgesGeometry(geometry), new THREE.LineBasicMaterial({ color: '#daffff' }));
cube.add(outlines);

const ground = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.MeshStandardMaterial({ color: '#101f2e', roughness: 1 }));
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.02;
ground.receiveShadow = true;
scene.add(ground);
const grid = new THREE.GridHelper(40, 40, '#426f80', '#1c3449');
grid.position.y = 0.002;
scene.add(grid);

const speedInput = document.querySelector('#speed');
const autoRotate = document.querySelector('#autoRotate');
const pauseButton = document.querySelector('#pause');
let paused = false;

speedInput.addEventListener('input', () => {
  document.querySelector('#speedValue').textContent = `${Number(speedInput.value).toFixed(1)}×`;
});
document.querySelector('#edges').addEventListener('change', (event) => { outlines.visible = event.target.checked; });
autoRotate.addEventListener('change', () => {
  if (autoRotate.checked) paused = false;
  pauseButton.textContent = paused ? 'Resume' : 'Pause';
});
pauseButton.addEventListener('click', () => {
  paused = !paused;
  pauseButton.textContent = paused ? 'Resume' : 'Pause';
});
document.querySelector('#reset').addEventListener('click', () => {
  camera.position.set(4.3, 3.2, 5.8);
  controls.target.set(0, 0.35, 0);
  controls.update();
  cube.rotation.set(0, 0, 0);
});

function resize() {
  const width = stage.clientWidth;
  const height = stage.clientHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}
window.addEventListener('resize', resize);
resize();

const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);
  if (!paused && autoRotate.checked) {
    cube.rotation.x += dt * 0.45 * Number(speedInput.value);
    cube.rotation.y += dt * 0.8 * Number(speedInput.value);
  }
  controls.update();
  renderer.render(scene, camera);
}
animate();
