# Computer Graphics — Five Laboratories

**Student:** Mustafa Ismaili  
**Course:** Computer Graphics, Fall 2026–2027  
**Technology:** JavaScript, HTML, CSS, [Three.js](https://threejs.org/) **r187**

This repository has five different, interactive computer-graphics exercises, each in its own folder. Each lab has its own `index.html` and `main.js`.

| Lab | Folder | Main requirement |
| --- | --- | --- |
| 1 — Rotating Cube | `Lab_01_Rotating_Cube/` | Rotating 3D cube, camera, lighting |
| 2 — Vector Laboratory | `Lab_02_Vector_Laboratory/` | Minimum, Standard, Challenge; ray–plane intersection |
| 3 — Solar System | `Lab_03_Solar_System/` | Sun, Earth–Moon hierarchy, Mars–Phobos hierarchy |
| 4 — Robotic Hand | `Lab_04_Robotic_Hand/` | Palm, five fingers, left thumb and movable joints |
| 5 — BufferGeometry | `Lab_05_BufferGeometry/` | Manual vertices, indexed triangle faces, vase and crystal |

## Run the labs

**Option A (easy):** Open this entire folder in VS Code, install the **Live Server** extension if needed, and select **Go Live** on the root `index.html`.

**Option B:** In a terminal, run a local web server from the repository folder:

```bash
python3 -m http.server 8000
```

For Windows, use `py -m http.server 8000` if `python3` is unavailable.

Then open **http://localhost:8000/** and choose any lab. **Do not simply double-click** the HTML file: JavaScript ES modules should be served over HTTP. The first load needs an internet connection because Three.js is loaded from a version-pinned CDN. No npm installation is needed.

## What each lab demonstrates

### Lab 1 — Rotating Cube
- A cube built with `THREE.BoxGeometry` and a 3D material.
- Rotation about both X and Y, frame-rate-independent animation.
- Speed, pause/resume, edge-display and camera controls.

### Lab 2 — Vector Laboratory
- **Minimum:** 3D vector addition, subtraction, scalar multiplication, length and normalization.
- **Standard:** dot product, cross product, angle, distance, projection of one vector onto another.
- **Challenge:** mandatory **ray–plane intersection** using `THREE.Ray`, `THREE.Plane`, ray direction and hit point.
- Adjust vector components, ray origin and slope to see results update.

**Note:** The professor's announcement lists the three difficulty levels but does not provide the complete Lab 2 assignment sheet. The exercise here covers common vector topics and the explicitly mandatory ray–plane task. Compare with the original Lab 2 handout in case specific additional exercises are required.

### Lab 3 — Solar System
- Sun is in the center; Earth and Mars revolve around it.
- The Moon revolves around Earth using a nested pivot (`Object3D` / `Group`).
- Phobos revolves around Mars using an independent nested pivot.
- Speeds are scaled for visibility, not astronomical accuracy.

### Lab 4 — Robotic Hand
- A palm and **all five digits**, including the thumb on the viewer's left.
- Each digit is a chain of 3 pivoting joints.
- Independent finger sliders and Open/Fist/Point/Peace presets.

### Lab 5 — BufferGeometry
- Each shape is manually generated from a JavaScript array of vertex coordinates.
- `geometry.setAttribute('position', ...)`, `geometry.setIndex(indices)`, and `computeVertexNormals()` form the mesh.
- Two models: a **hollow vase** and a **faceted crystal**.
- Adjustable number of sides and optional triangle-wireframe overlay.

## Git / GitHub submission

The ZIP distribution includes a `.git` folder with **five local commits, one for each lab**. Extract the entire ZIP, keeping hidden files (`.git`) included. Verify them with:

```bash
git log --oneline
```

Create an **empty** repository on GitHub (do not initialize it with a README). From the extracted folder run:

```bash
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
git branch -M main
git push -u origin main
```

Replace the URL with the URL GitHub gives you. GitHub may ask you to sign in using GitHub Desktop, the GitHub CLI, or a credential helper; a GitHub account is required for the final upload. **GitHub's browser "Upload files" option does not preserve these local commits**, so push through Git/GitHub Desktop instead.

> The included commits use a placeholder local email (`student@example.invalid`), because no verified Git commit email was provided. Before submission, you can configure your proper GitHub email for new commits with `git config user.email "your-verified-email"`. Existing commits retain the placeholder author until rewritten. The five distinct commit timestamps and changes remain visible in `git log`.

## File layout

```text
Computer_Graphics_5_Labs_Mustafa_Ismaili/
├── index.html                    # Lab selection home page
├── README.md
├── assets/site.css               # Shared controls styling
├── Lab_01_Rotating_Cube/
│   ├── index.html
│   └── main.js
├── Lab_02_Vector_Laboratory/
│   ├── index.html
│   └── main.js
├── Lab_03_Solar_System/
│   ├── index.html
│   └── main.js
├── Lab_04_Robotic_Hand/
│   ├── index.html
│   └── main.js
└── Lab_05_BufferGeometry/
    ├── index.html
    └── main.js
```
