import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Lab 5: All vertices and triangular faces below are built manually.
// No built-in vase or crystal geometry is used.
const stage = document.getElementById('stage');
const scene = new THREE.Scene();
scene.background = new THREE.Color('#071625');
const camera = new THREE.PerspectiveCamera(50, 1, .1, 100);
camera.position.set(5.7, 4.2, 7.7);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
stage.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 1.2, 0);
controls.minDistance = 3;
controls.maxDistance = 22;
scene.add(new THREE.HemisphereLight('#e2f6ff', '#17415e', 1.6));
const key = new THREE.DirectionalLight('#ffffff', 3.4);
key.position.set(5, 8, 6);
scene.add(key);
const edgeLight = new THREE.DirectionalLight('#ffbafd', 1.6);
edgeLight.position.set(-4, 3, -4);
scene.add(edgeLight);
const grid = new THREE.GridHelper(12, 12, '#416c81', '#254458');
scene.add(grid);

const display = new THREE.Group();
scene.add(display);
const material = new THREE.MeshStandardMaterial({ vertexColors: true, side: THREE.DoubleSide, metalness: .26, roughness: .37, flatShading: false });
const wireMaterial = new THREE.LineBasicMaterial({ color: '#d2fcff', transparent: true, opacity: .33, depthWrite: false });
let mesh = null;
let wireframe = null;
let currentModel = 'vase';

function makeGeometry(positions, colors, indices) {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices); // Every 3 indices define one triangular face.
  geometry.computeVertexNormals();
  return geometry;
}
function addVertex(positions, colors, x, y, z, color) {
  positions.push(x, y, z);
  colors.push(color.r, color.g, color.b);
}
function makeVase(sides) {
  // Outer profile goes from bottom to rim; inner profile returns to the base.
  // This makes the vase hollow with a visible lip, not just a solid cylinder.
  const profile = [
    [0, .52], [.15, .64], [.6, .85], [1.13, 1.01], [1.72, .91],
    [2.26, .67], [2.85, .57], [3.04, .69], [3.13, .73],
    [3.13, .59], [3.04, .56], [2.85, .45], [2.26, .54],
    [1.72, .75], [1.13, .86], [.6, .71], [.2, .47],
  ];
  const positions = [], colors = [], indices = [];
  for (let ring = 0; ring < profile.length; ring++) {
    const [y, radius] = profile[ring];
    const shade = new THREE.Color().setHSL(.51 + y * .012, .57, .35 + y * .055);
    for (let j = 0; j < sides; j++) {
      const angle = j * Math.PI * 2 / sides;
      addVertex(positions, colors, Math.cos(angle) * radius, y, Math.sin(angle) * radius, shade);
    }
  }
  for (let ring = 0; ring < profile.length - 1; ring++) {
    for (let j = 0; j < sides; j++) {
      const next = (j + 1) % sides;
      const a = ring * sides + j;
      const b = ring * sides + next;
      const c = (ring + 1) * sides + j;
      const d = (ring + 1) * sides + next;
      indices.push(a, c, b, b, c, d); // two triangles form one quad
    }
  }
  // Bottom discs finish the outside base and inner floor.
  const outerCenter = positions.length / 3;
  addVertex(positions, colors, 0, 0, 0, new THREE.Color('#249eb1'));
  const innerCenter = positions.length / 3;
  addVertex(positions, colors, 0, .2, 0, new THREE.Color('#249eb1'));
  for (let j = 0; j < sides; j++) {
    const next = (j + 1) % sides;
    indices.push(outerCenter, j, next); // bottom face points down
    const last = (profile.length - 1) * sides;
    indices.push(innerCenter, last + next, last + j); // inner floor points up
  }
  return makeGeometry(positions, colors, indices);
}
function makeCrystal(sides) {
  const positions = [], colors = [], indices = [];
  const add = (x, y, z, hueShift = 0) => {
    const shade = new THREE.Color().setHSL(.69 + hueShift, .74, .51 + y * .06);
    addVertex(positions, colors, x, y, z, shade);
  };
  const bottomTip = 0;
  add(0, -1.6, 0);
  const rings = [[-.8, .73], [.1, 1.18], [.9, .72]];
  for (const [y, radius] of rings) {
    for (let j = 0; j < sides; j++) {
      const angle = j * Math.PI * 2 / sides;
      const zigzag = j % 2 === 0 ? 1 : .91;
      add(Math.cos(angle) * radius * zigzag, y, Math.sin(angle) * radius * zigzag, j % 2 ? .02 : -.02);
    }
  }
  const topTip = positions.length / 3;
  add(0, 1.95, 0);
  // Pointed lower tip.
  for (let j = 0; j < sides; j++) indices.push(bottomTip, 1 + j, 1 + (j + 1) % sides);
  // Two bands of triangular faces (4 triangles for every 2 quads).
  for (let ring = 0; ring < rings.length - 1; ring++) {
    for (let j = 0; j < sides; j++) {
      const a = 1 + ring * sides + j;
      const b = 1 + ring * sides + (j + 1) % sides;
      const c = 1 + (ring + 1) * sides + j;
      const d = 1 + (ring + 1) * sides + (j + 1) % sides;
      indices.push(a, c, b, b, c, d);
    }
  }
  // Pointed top.
  const last = 1 + (rings.length - 1) * sides;
  for (let j = 0; j < sides; j++) indices.push(topTip, last + (j + 1) % sides, last + j);
  return makeGeometry(positions, colors, indices);
}
function rebuild() {
  const sides = Number(document.getElementById('sides').value);
  document.getElementById('sidesValue').textContent = sides;
  if (mesh) {
    display.remove(mesh, wireframe);
    mesh.geometry.dispose();
    wireframe.geometry.dispose();
  }
  const geometry = currentModel === 'vase' ? makeVase(sides) : makeCrystal(sides);
  material.flatShading = currentModel === 'crystal';
  material.needsUpdate = true;
  mesh = new THREE.Mesh(geometry, material);
  mesh.position.y = currentModel === 'vase' ? 0 : 1.55;
  wireframe = new THREE.LineSegments(new THREE.WireframeGeometry(geometry), wireMaterial);
  wireframe.position.copy(mesh.position);
  wireframe.visible = document.getElementById('wire').checked;
  display.add(mesh, wireframe);
  document.getElementById('vertexCount').textContent = geometry.getAttribute('position').count;
  document.getElementById('faceCount').textContent = geometry.getIndex().count / 3;
  document.getElementById('indexCount').textContent = geometry.getIndex().count;
}
for (const button of document.querySelectorAll('[data-model]')) {
  button.addEventListener('click', () => {
    currentModel = button.dataset.model;
    for (const btn of document.querySelectorAll('[data-model]')) btn.classList.toggle('primary', btn === button);
    rebuild();
  });
}
document.getElementById('sides').addEventListener('input', rebuild);
document.getElementById('wire').addEventListener('change', event => { wireframe.visible = event.target.checked; });
rebuild();
function resize() { camera.aspect = stage.clientWidth / stage.clientHeight; camera.updateProjectionMatrix(); renderer.setSize(stage.clientWidth, stage.clientHeight); }
window.addEventListener('resize', resize);
resize();
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), .05);
  if (document.getElementById('spin').checked) display.rotation.y += dt * .32;
  controls.update();
  renderer.render(scene, camera);
}
animate();
