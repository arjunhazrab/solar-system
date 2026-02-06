// --- CONFIGURATION ---
const sceneConfig = {
    sunSize: 5,
    speedFactor: 0.5, // Global rotation speed
    orbitScale: 15,   // Distance multiplier to space out planets
    planetScale: 1    // Size multiplier for planets
};

// Planet Data (Simplified scale for visualization)
// distance: relative units from sun
// size: relative radius
// speed: orbit speed
const planetsData = [
    { name: "Sun", size: 5, distance: 0, speed: 0, color: 0xffaa00, type: "Star", radius: "696,340", period: "0", desc: "The star at the center of our Solar System. It is a nearly perfect sphere of hot plasma." },
    { name: "Mercury", size: 0.8, distance: 10, speed: 0.04, color: 0xA5A5A5, type: "Terrestrial", radius: "2,439", period: "88", desc: "The smallest planet in the Solar System and the closest to the Sun." },
    { name: "Venus", size: 1.2, distance: 15, speed: 0.015, color: 0xE3BB76, type: "Terrestrial", radius: "6,051", period: "225", desc: "Venus is the second planet from the Sun. It has a thick, toxic atmosphere that traps heat." },
    { name: "Earth", size: 1.3, distance: 22, speed: 0.01, color: 0x2233FF, type: "Terrestrial", radius: "6,371", period: "365", desc: "Our home planet is the third planet from the Sun, and the only place we know of so far that's inhabited by living things." },
    { name: "Mars", size: 1.0, distance: 30, speed: 0.008, color: 0xDD4422, type: "Terrestrial", radius: "3,389", period: "687", desc: "Mars is a dusty, cold, desert world with a very thin atmosphere. It is also a dynamic planet with seasons." },
    { name: "Jupiter", size: 3.5, distance: 45, speed: 0.002, color: 0xD9A066, type: "Gas Giant", radius: "69,911", period: "4,333", desc: "Jupiter is the largest planet in the Solar System. It is a gas giant with a mass more than two and a half times that of all the other planets combined." },
    { name: "Saturn", size: 3.0, distance: 60, speed: 0.0009, color: 0xF4D03F, type: "Gas Giant", radius: "58,232", period: "10,759", desc: "Saturn is the sixth planet from the Sun and the second-largest in the Solar System, after Jupiter. It is famous for its rings." },
    { name: "Uranus", size: 2.0, distance: 75, speed: 0.0004, color: 0x73C6B6, type: "Ice Giant", radius: "25,362", period: "30,687", desc: "Uranus is the seventh planet from the Sun. It has the third-largest planetary radius and fourth-largest planetary mass in the Solar System." },
    { name: "Neptune", size: 1.9, distance: 90, speed: 0.0001, color: 0x3498DB, type: "Ice Giant", radius: "24,622", period: "60,190", desc: "Neptune is the eighth and farthest-known Solar planet from the Sun. In the Solar System, it is the fourth-largest planet by diameter." }
];

// --- THREE.JS SETUP ---
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 60, 120); // Initial high angle view

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

// Controls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// --- LIGHTING ---
const ambientLight = new THREE.AmbientLight(0x404040, 1.5); // Soft white light
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xFFFFFF, 2, 300); // The Sun's light
scene.add(pointLight);

// --- STARFIELD BACKGROUND (THREE.JS) ---
// Using Three.js particles for the universe depth
function createStars() {
    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.1 });
    const starVertices = [];
    for(let i=0; i<10000; i++) {
        const x = (Math.random() - 0.5) * 2000;
        const y = (Math.random() - 0.5) * 2000;
        const z = (Math.random() - 0.5) * 2000;
        starVertices.push(x, y, z);
    }
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);
}
createStars();

// --- OBJECT CREATION ---
const planetMeshes = []; // To store meshes for raycasting
const planetObjects = []; // To store custom object data for animation

// Helper: Create Ring/Orbit
function createOrbit(radius) {
    const geometry = new THREE.RingGeometry(radius - 0.1, radius + 0.1, 64);
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, opacity: 0.2, transparent: true });
    const ring = new THREE.Mesh(geometry, material);
    ring.rotation.x = Math.PI / 2;
    scene.add(ring);
}

// Generate Solar System
planetsData.forEach(data => {
    let geometry, material, mesh;

    // Texture Loader (Using colors for stability, but setup for textures)
    // To make it "Realistic" without external assets failing, we use detail materials
    
    if (data.name === "Sun") {
        geometry = new THREE.SphereGeometry(data.size, 32, 32);
        material = new THREE.MeshBasicMaterial({ color: data.color }); // Emissive look
        mesh = new THREE.Mesh(geometry, material);
        
        // Add a glow effect wrapper
        const glowGeo = new THREE.SphereGeometry(data.size * 1.2, 32, 32);
        const glowMat = new THREE.MeshBasicMaterial({ color: 0xffaa00, opacity: 0.3, transparent: true });
        const glowMesh = new THREE.Mesh(glowGeo, glowMat);
        mesh.add(glowMesh);
    } else {
        geometry = new THREE.SphereGeometry(data.size, 32, 32);
        // Using StandardMaterial for reaction to light
        material = new THREE.MeshStandardMaterial({ 
            color: data.color,
            roughness: 0.7,
            metalness: 0.1
        });
       
        mesh = new THREE.Mesh(geometry, material);
        
        // Add Orbit Ring
        createOrbit(data.distance);
        
        // Add Saturn's Rings
        if(data.name === "Saturn") {
            const ringGeo = new THREE.RingGeometry(data.size * 1.4, data.size * 2.2, 32);
            const ringMat = new THREE.MeshBasicMaterial({ color: 0xaa8866, side: THREE.DoubleSide, opacity: 0.6, transparent: true });
            const saturnRing = new THREE.Mesh(ringGeo, ringMat);
            saturnRing.rotation.x = Math.PI / 2;
            mesh.add(saturnRing);
        }
    }

    // Custom properties for animation
    mesh.userData = { 
        name: data.name, 
        distance: data.distance, 
        speed: data.speed, 
        angle: Math.random() * Math.PI * 2,
        info: data
    };
    
    // Set Initial Position
    mesh.position.x = data.distance;
    
    scene.add(mesh);
    planetMeshes.push(mesh); // For raycasting
    planetObjects.push(mesh); // For animation
});

// --- INTERACTION LOGIC ---
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let focusedPlanet = null; // Currently zoomed planet
let isPaused = false; // Pause orbit when focused

// Modal Elements
const modal = document.getElementById('planet-modal');
const closeBtn = document.getElementById('close-btn');

// Click Event
window.addEventListener('click', onMouseClick, false);

function onMouseClick(event) {
    // If clicking on UI, ignore
    if (event.target.closest('.modal') || event.target.closest('.hud')) return;

    // Calculate mouse position
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(planetMeshes);

    if (intersects.length > 0) {
        const object = intersects[0].object;
        focusOnPlanet(object);
    } else {
        // Clicking empty space resets view
        resetView();
    }
}

function focusOnPlanet(mesh) {
    focusedPlanet = mesh;
    isPaused = true;
    
    // Calculate new camera position: offset from planet
    // We need to find the planet's WORLD position
    const planetPos = new THREE.Vector3();
    mesh.getWorldPosition(planetPos);
    
    // Offset depends on planet size
    const offset = mesh.geometry.parameters.radius * 4 + 5; 
    
    // Smooth Camera Transition (Zoom)
    gsap.to(camera.position, {
        duration: 1.5,
        x: planetPos.x + offset,
        y: planetPos.y + offset/2,
        z: planetPos.z + offset,
        onUpdate: () => {
            controls.target.copy(planetPos);
        }
    });

    // Show UI
    showModal(mesh.userData.info);
}

function resetView() {
    focusedPlanet = null;
    isPaused = false;
    closeModal();

    gsap.to(camera.position, {
        duration: 1.5,
        x: 0,
        y: 60,
        z: 120,
        onUpdate: () => {
            controls.target.set(0, 0, 0);
        }
    });
}

// UI Functions
function showModal(data) {
    document.getElementById('planet-name').innerText = data.name;
    document.getElementById('planet-type').innerText = data.type;
    document.getElementById('planet-radius').innerText = data.radius;
    document.getElementById('planet-orbit').innerText = data.period;
    document.getElementById('planet-desc').innerText = data.desc;
    
    modal.classList.remove('hidden');
    
    // Trigger particles.js refresh if needed (optional)
}

function closeModal() {
    modal.classList.add('hidden');
}

closeBtn.addEventListener('click', resetView);

// --- ANIMATION LOOP ---
function animate() {
    requestAnimationFrame(animate);

    // Orbit Logic
    if (!isPaused) {
        planetObjects.forEach(planet => {
            if (planet.userData.distance > 0) { // Don't move the Sun
                planet.userData.angle += planet.userData.speed * sceneConfig.speedFactor;
                planet.position.x = Math.cos(planet.userData.angle) * planet.userData.distance;
                planet.position.z = Math.sin(planet.userData.angle) * planet.userData.distance;
            }
            // Self Rotation
            planet.rotation.y += 0.005;
        });
    } else if (focusedPlanet) {
        // Keep rotating focused planet for visual effect
        focusedPlanet.rotation.y += 0.002;
    }

    controls.update();
    renderer.render(scene, camera);
}

animate();

// --- RESIZE HANDLER ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- PARTICLES.JS INITIALIZATION (UI Background) ---
particlesJS("particles-js", {
  "particles": {
    "number": { "value": 50, "density": { "enable": true, "value_area": 800 } },
    "color": { "value": "#ffffff" },
    "shape": { "type": "circle" },
    "opacity": { "value": 0.5, "random": true },
    "size": { "value": 3, "random": true },
    "line_linked": { "enable": true, "distance": 150, "color": "#ffffff", "opacity": 0.2, "width": 1 },
    "move": { "enable": true, "speed": 1, "direction": "none", "random": false, "straight": false, "out_mode": "out", "bounce": false }
  },
  "interactivity": {
    "detect_on": "canvas",
    "events": { "onhover": { "enable": true, "mode": "grab" }, "onclick": { "enable": true, "mode": "push" }, "resize": true },
    "modes": { "grab": { "distance": 140, "line_linked": { "opacity": 0.5 } } }
  },
  "retina_detect": true
});
// --- ASTEROID BELT ---
