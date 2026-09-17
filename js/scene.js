import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const canvas = document.getElementById("scene3d");
const wrap = canvas.parentElement;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

const scene = new THREE.Scene();
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
camera.position.set(0, 0.4, 11);

// Luces de acento
const blue = new THREE.PointLight(0x2f6bff, 40, 20);
blue.position.set(-4, 3, 3);
const cyan = new THREE.PointLight(0x3dd6f5, 30, 20);
cyan.position.set(4, -2, 4);
scene.add(blue, cyan, new THREE.AmbientLight(0xffffff, 0.2));

// Materiales
const chrome = new THREE.MeshStandardMaterial({ color: 0xdfe6f2, metalness: 1, roughness: 0.16 });
const copper = new THREE.MeshStandardMaterial({ color: 0xd98a5f, metalness: 1, roughness: 0.28 });
const dark = new THREE.MeshStandardMaterial({ color: 0x1a2340, metalness: 0.6, roughness: 0.35 });
const accent = new THREE.MeshStandardMaterial({ color: 0x2f6bff, metalness: 0.4, roughness: 0.3, emissive: 0x0b2a80, emissiveIntensity: 0.4 });
const red = new THREE.MeshStandardMaterial({ color: 0xff4d5e, metalness: 0.3, roughness: 0.35 });
const water = new THREE.MeshPhysicalMaterial({
  color: 0x9fe8ff, metalness: 0, roughness: 0.05, transmission: 1, thickness: 0.4, ior: 1.33,
  transparent: true, opacity: 0.9, emissive: 0x3dd6f5, emissiveIntensity: 0.15
});

const group = new THREE.Group();
scene.add(group);

const R = 0.16;
const UP = new THREE.Vector3(0, 1, 0);
const v = (x, y, z) => new THREE.Vector3(x, y, z);

// Trazado con codos redondeados
function roundedPath(points, radius) {
  const path = new THREE.CurvePath();
  let from = points[0].clone();
  for (let i = 1; i < points.length - 1; i++) {
    const p = points[i];
    const inDir = p.clone().sub(points[i - 1]).normalize();
    const outDir = points[i + 1].clone().sub(p).normalize();
    const start = p.clone().sub(inDir.clone().multiplyScalar(radius));
    const end = p.clone().add(outDir.clone().multiplyScalar(radius));
    path.add(new THREE.LineCurve3(from, start));
    path.add(new THREE.QuadraticBezierCurve3(start, p.clone(), end));
    from = end;
  }
  path.add(new THREE.LineCurve3(from, points[points.length - 1].clone()));
  return path;
}

function coupling(pos, dir, mat = chrome, r = R * 1.28, len = 0.24) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 40), mat);
  m.position.copy(pos);
  m.quaternion.setFromUnitVectors(UP, dir.clone().normalize());
  group.add(m);
  return m;
}

function pipe(points, mat) {
  const path = roundedPath(points, 0.42);
  const geo = new THREE.TubeGeometry(path, 260, R, 32, false);
  group.add(new THREE.Mesh(geo, mat));
  // Manguitos en extremos y junto a los codos
  coupling(points[0], points[1].clone().sub(points[0]), mat);
  const n = points.length;
  coupling(points[n - 1], points[n - 1].clone().sub(points[n - 2]), mat);
  for (let i = 1; i < n - 1; i++) {
    const inDir = points[i].clone().sub(points[i - 1]).normalize();
    const outDir = points[i + 1].clone().sub(points[i]).normalize();
    coupling(points[i].clone().sub(inDir.clone().multiplyScalar(0.55)), inDir, mat, R * 1.2, 0.12);
    coupling(points[i].clone().add(outDir.clone().multiplyScalar(0.55)), outDir, mat, R * 1.2, 0.12);
  }
}

function valve(pos, axis, stemDir, handleMat) {
  const body = new THREE.Mesh(new THREE.CylinderGeometry(R * 1.6, R * 1.6, 0.62, 6), dark);
  body.position.copy(pos);
  body.quaternion.setFromUnitVectors(UP, axis);
  group.add(body);
  const nut = new THREE.Mesh(new THREE.SphereGeometry(R * 1.5, 32, 16), chrome);
  nut.position.copy(pos);
  group.add(nut);
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.5, 16), chrome);
  stem.position.copy(pos).add(stemDir.clone().multiplyScalar(0.3));
  stem.quaternion.setFromUnitVectors(UP, stemDir);
  group.add(stem);

  const wheel = new THREE.Group();
  wheel.add(new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.05, 16, 60), handleMat));
  for (let i = 0; i < 4; i++) {
    const spoke = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.68, 8), handleMat);
    spoke.rotation.z = (i * Math.PI) / 4;
    wheel.add(spoke);
  }
  wheel.add(new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.08, 20).rotateX(Math.PI / 2), chrome));
  const holder = new THREE.Group();
  holder.position.copy(pos).add(stemDir.clone().multiplyScalar(0.56));
  holder.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), stemDir);
  holder.add(wheel);
  group.add(holder);
  return wheel;
}

// Red de tuberías
const A = [v(-2.6, 1.4, -0.4), v(-0.3, 1.4, -0.4), v(-0.3, -0.5, -0.4), v(-0.3, -0.5, 0.9), v(1.5, -0.5, 0.9), v(1.5, -1.05, 0.9)];
const B = [v(2.5, 2.0, -1.2), v(0.9, 2.0, -1.2), v(0.9, 0.35, -1.2), v(0.9, 0.35, 0.3), v(0.9, -2.2, 0.3)];
const C = [v(-2.4, -2.2, 0.2), v(-1.4, -2.2, 0.2), v(-1.4, -0.9, 0.2), v(-1.4, -0.9, -1.4)];
pipe(A, chrome);
pipe(B, copper);
pipe(C, chrome);

const wheels = [
  valve(v(-1.5, 1.4, -0.4), v(1, 0, 0), v(0, 1, 0), red),
  valve(v(0.9, 1.2, -1.2), v(0, 1, 0), v(0, 0, 1), accent),
  valve(v(-1.4, -1.6, 0.2), v(0, 1, 0), v(0, 0, 1), red)
];

// Boca del grifo
const spout = new THREE.Mesh(new THREE.CylinderGeometry(R * 1.1, R * 1.45, 0.22, 32), chrome);
spout.position.set(1.5, -1.12, 0.9);
group.add(spout);
const tip = v(1.5, -1.25, 0.9);

// Manómetro
const gauge = new THREE.Group();
const face = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.1, 48).rotateX(Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0xf4f7ff, roughness: 0.4 }));
const rim = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.05, 16, 60), chrome);
const needle = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.26, 0.02).translate(0, 0.11, 0), red);
needle.position.z = 0.07;
rim.position.z = 0.03;
gauge.add(face, rim, needle);
gauge.position.set(-0.3, 0.45, -0.4 + 0.46);
const gStem = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.3, 12).rotateX(Math.PI / 2), chrome);
gStem.position.set(-0.3, 0.45, -0.4 + 0.2);
group.add(gauge, gStem);

// Gotas de agua
const dropGeo = new THREE.SphereGeometry(0.075, 24, 16);
dropGeo.translate(0, -0.02, 0);
const drops = Array.from({ length: 4 }, (_, i) => {
  const d = new THREE.Mesh(dropGeo, water);
  d.userData.phase = i / 4;
  group.add(d);
  return d;
});

// Burbujas
const bubbles = Array.from({ length: 14 }, () => {
  const s = 0.03 + Math.random() * 0.07;
  const b = new THREE.Mesh(new THREE.SphereGeometry(s, 16, 12), water);
  b.userData = { x: (Math.random() - 0.5) * 6, z: (Math.random() - 0.5) * 3, speed: 0.15 + Math.random() * 0.3, off: Math.random() * 6 };
  group.add(b);
  return b;
});

// Charco
const puddle = new THREE.Mesh(new THREE.CircleGeometry(0.5, 48).rotateX(-Math.PI / 2), new THREE.MeshPhysicalMaterial({ color: 0x3dd6f5, transparent: true, opacity: 0.18, roughness: 0, metalness: 0.2 }));
puddle.position.set(1.5, -2.35, 0.9);
group.add(puddle);

group.rotation.set(0.18, -0.5, 0);

// Tamaño
function resize() {
  const w = wrap.clientWidth, h = wrap.clientHeight;
  if (!w || !h) return;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.position.z = w < 420 ? 12.5 : 11;
  camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(wrap);
resize();

// Interacción
const target = { x: 0, y: 0 };
window.addEventListener("pointermove", e => {
  target.x = (e.clientX / window.innerWidth - 0.5) * 2;
  target.y = (e.clientY / window.innerHeight - 0.5) * 2;
}, { passive: true });

let visible = true;
new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0 }).observe(canvas);

const clock = new THREE.Clock();
function frame() {
  const t = clock.getElapsedTime();

  group.rotation.y += ((-0.5 + Math.sin(t * 0.25) * 0.35 + target.x * 0.35) - group.rotation.y) * 0.04;
  group.rotation.x += ((0.18 + target.y * 0.15) - group.rotation.x) * 0.04;
  group.position.y = Math.sin(t * 0.8) * 0.08;

  wheels.forEach((w, i) => { w.rotation.z = t * (i % 2 ? -0.6 : 0.8); });
  needle.rotation.z = -0.6 + Math.sin(t * 1.3) * 0.5 + Math.sin(t * 3.7) * 0.08;

  drops.forEach(d => {
    const p = (t * 0.6 + d.userData.phase) % 1;
    const y = tip.y - p * p * 1.1;
    d.position.set(tip.x, y, tip.z);
    const s = p < 0.08 ? p / 0.08 : 1;
    d.scale.set(s * 0.9, s * (1 + p * 0.6), s * 0.9);
  });
  puddle.scale.setScalar(1 + Math.sin(t * 2.4) * 0.05);

  bubbles.forEach(b => {
    const u = b.userData;
    const y = ((t * u.speed + u.off) % 6) - 3;
    b.position.set(u.x + Math.sin(t + u.off) * 0.15, y, u.z);
  });

  renderer.render(scene, camera);
}

if (reduceMotion) {
  frame();
} else {
  renderer.setAnimationLoop(() => { if (visible) frame(); });
}
