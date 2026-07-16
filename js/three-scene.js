/**
 * Ted Portfolio — Three.js Particle System
 * Spherical particle cloud + torus knot with mouse and scroll parallax.
 * Canvas: transparent background, particles render on top of CSS background.
 */

(function () {
  'use strict';

  // --- DOM Element ---
  const container = document.getElementById('three-container');
  if (!container) return;

  // --- Scene Setup ---
  const scene = new THREE.Scene();

  // --- Camera ---
  const camera = new THREE.PerspectiveCamera(
    60, // FOV
    container.clientWidth / container.clientHeight,
    0.1,
    100
  );
  camera.position.z = 8;

  // --- Renderer ---
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0); // Transparent background
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);

  // --- Particle System ---
  const PARTICLE_COUNT = 800;
  const PARTICLE_RADIUS = 5.5;

  const particleGeometry = new THREE.BufferGeometry();
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const colors = new Float32Array(PARTICLE_COUNT * 3);
  const sizes = new Float32Array(PARTICLE_COUNT);

  // Color palette
  const palette = [
    new THREE.Color('#00E5CF'), // Cyan
    new THREE.Color('#E0F7F6'), // Light cyan-white
    new THREE.Color('#0077B6'), // Deep blue
  ];

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    // Spherical distribution with slight clustering
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = PARTICLE_RADIUS * (0.5 + Math.random() * 0.5);

    positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);

    // Pick a color from palette with weights
    const colorRand = Math.random();
    let color;
    if (colorRand < 0.4) {
      color = palette[0].clone(); // Cyan (40%)
    } else if (colorRand < 0.75) {
      color = palette[1].clone(); // Light (35%)
    } else {
      color = palette[2].clone(); // Blue (25%)
    }

    // Slight random variation
    color.r += (Math.random() - 0.5) * 0.08;
    color.g += (Math.random() - 0.5) * 0.08;
    color.b += (Math.random() - 0.5) * 0.08;

    colors[i * 3]     = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;

    // Sizes: visible range (0.15 - 0.2)
    sizes[i] = 0.15 + Math.random() * 0.05;
  }

  particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  // Circular particle texture (soft dot)
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.9)');
  gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.4)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 32, 32);

  const particleTexture = new THREE.CanvasTexture(canvas);

  const particleMaterial = new THREE.PointsMaterial({
    size: 0.18,
    map: particleTexture,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    transparent: true,
    opacity: 0.85,
  });

  const particles = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(particles);

  // --- Torus Knot ---
  const torusKnotGeo = new THREE.TorusKnotGeometry(1.4, 0.35, 180, 24);
  const torusKnotMat = new THREE.MeshStandardMaterial({
    color: 0x00E5CF,
    emissive: 0x0077B6,
    emissiveIntensity: 0.5,
    roughness: 0.4,
    metalness: 0.3,
    transparent: true,
    opacity: 0.25,
  });
  const torusKnot = new THREE.Mesh(torusKnotGeo, torusKnotMat);
  scene.add(torusKnot);

  // Wireframe overlay
  const wireframeGeo = new THREE.TorusKnotGeometry(1.42, 0.36, 120, 16);
  const wireframeMat = new THREE.MeshBasicMaterial({
    color: 0x00E5CF,
    wireframe: true,
    transparent: true,
    opacity: 0.1,
  });
  const wireframe = new THREE.Mesh(wireframeGeo, wireframeMat);
  scene.add(wireframe);

  // --- Lighting (for torus knot) ---
  const ambientLight = new THREE.AmbientLight(0x222244, 1.5);
  scene.add(ambientLight);
  const pointLight = new THREE.PointLight(0x00E5CF, 2, 15);
  pointLight.position.set(3, 3, 5);
  scene.add(pointLight);
  const pointLight2 = new THREE.PointLight(0x0077B6, 1.5, 12);
  pointLight2.position.set(-3, -2, -3);
  scene.add(pointLight2);

  // --- Mouse Parallax ---
  const mouse = { x: 0, y: 0 };
  const target = { x: 0, y: 0 };

  document.addEventListener('mousemove', function (e) {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  // Touch support
  document.addEventListener('touchmove', function (e) {
    if (e.touches.length > 0) {
      mouse.x = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.touches[0].clientY / window.innerHeight) * 2 + 1;
    }
  }, { passive: true });

  // --- Scroll Parallax ---
  let scrollFactor = 0;
  let targetScrollFactor = 0;

  window.addEventListener('scroll', function () {
    const scrollY = window.scrollY;
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    targetScrollFactor = maxScroll > 0 ? scrollY / maxScroll : 0;
  });

  // --- Resize ---
  window.addEventListener('resize', function () {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });

  // --- Animation Loop ---
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const dt = Math.min(clock.getDelta(), 0.1);
    const elapsed = performance.now() * 0.001;

    // Smooth mouse follow
    target.x += (mouse.x - target.x) * 0.05;
    target.y += (mouse.y - target.y) * 0.05;

    // Smooth scroll
    scrollFactor += (targetScrollFactor - scrollFactor) * 0.05;

    // Rotate particles slowly
    particles.rotation.y += dt * 0.08;
    particles.rotation.x += dt * 0.04;

    // Mouse parallax on particles
    particles.rotation.y += target.x * dt * 0.3;
    particles.rotation.x += target.y * dt * 0.2;

    // Scroll: expand/contract particles
    const scaleBase = 1.0 + scrollFactor * 0.5;
    const scalePulse = 1.0 + Math.sin(elapsed * 0.5) * 0.03;
    particles.scale.setScalar(scaleBase * scalePulse);

    // Torus knot rotation
    torusKnot.rotation.x += dt * 0.15;
    torusKnot.rotation.y += dt * 0.2;
    torusKnot.rotation.z += dt * 0.1;

    // Torus knot mouse influence
    torusKnot.rotation.y += target.x * dt * 0.5;
    torusKnot.rotation.x += target.y * dt * 0.3;

    // Wireframe follows torus knot
    wireframe.rotation.copy(torusKnot.rotation);

    // Torus knot scale with scroll
    const knotScale = 1.0 + scrollFactor * 0.3;
    torusKnot.scale.setScalar(knotScale);
    wireframe.scale.setScalar(knotScale);

    // Camera subtle parallax
    camera.position.x += (target.x * 0.8 - camera.position.x) * 0.03;
    camera.position.y += (target.y * 0.5 - camera.position.y) * 0.03;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }

  animate();
})();
