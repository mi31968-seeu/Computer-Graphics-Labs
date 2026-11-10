import * as THREE from 'three'
import { PLYLoader } from 'three/addons/loaders/PLYLoader.js'

const scene = new THREE.Scene()
scene.background = new THREE.Color(0xcccccc)

const aspect = window.innerWidth / window.innerHeight
const perspective = new THREE.PerspectiveCamera(75, aspect, 0.1, 100)
perspective.position.set(2, 2, 10)
perspective.lookAt(0, 0, 0)

const size = 3
const orthographic = new THREE.OrthographicCamera(
    -size * aspect, size * aspect, size, -size, 0.1, 100
)
orthographic.position.set(2, 2, 10)
orthographic.lookAt(0, 0, 0)

const cameras = [perspective, orthographic]
let current = 0

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setSize(window.innerWidth, window.innerHeight)
document.getElementById('app').appendChild(renderer.domElement)

const ambient = new THREE.AmbientLight(0xffffff, 0.4)
const directional = new THREE.DirectionalLight(0xffffff, 3.5)
directional.position.set(5, 8, 4)
scene.add(ambient, directional)

const depths = [0, -3, -8]
const colors = [0xA65C4C, 0xed9494, 0x404F82]
const status = document.getElementById('status')
const cameraLabel = document.getElementById('camera-name')

new PLYLoader().load(
    'models/3dModel.ply',
    (geo) => {
        geo.center()
        // The model has normals already. This is a fallback if you replace it.
        if (!geo.getAttribute('normal')) geo.computeVertexNormals()
        for (let i = 0; i < depths.length; i++) {
            const mesh = new THREE.Mesh(geo,
                new THREE.MeshStandardMaterial({ color: colors[i], roughness: 0.4, metalness: 0.1 }))
            mesh.scale.setScalar(0.02)
            mesh.rotation.x = Math.PI
            mesh.position.x = (i - 1) * 2
            mesh.position.z = depths[i]
            scene.add(mesh)
        }
        status.textContent = '3D rocket loaded successfully'
    },
    undefined,
    (error) => {
        console.error('Could not load models/3dModel.ply:', error)
        status.textContent = 'Error: model not loaded. Use VS Code Live Server.'
    }
)

// The assignment TODO: switch between the two cameras using the Space key.
function switchCamera() {
    current = (current + 1) % cameras.length
    const name = current === 0 ? 'Perspective' : 'Orthographic'
    cameraLabel.textContent = `Camera: ${name}`
    console.log(`Active: ${name}`)
}

window.addEventListener('keydown', (event) => {
    if (event.code === 'Space' && !event.repeat) {
        event.preventDefault()
        switchCamera()
    }
})
document.getElementById('toggle-camera').addEventListener('click', switchCamera)

window.addEventListener('resize', () => {
    const aspect = window.innerWidth / window.innerHeight
    perspective.aspect = aspect
    perspective.updateProjectionMatrix()
    orthographic.left = -size * aspect
    orthographic.right = size * aspect
    orthographic.top = size
    orthographic.bottom = -size
    orthographic.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
})

function animate() {
    requestAnimationFrame(animate)
    renderer.render(scene, cameras[current])
}
animate()
