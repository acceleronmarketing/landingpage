// Signal Through Noise - Rebuilt for High Visibility & CLI Aesthetic
// Uses global THREE variables (r128)

class SignalNoiseScene {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;

        this.width = this.container.clientWidth;
        this.height = this.container.clientHeight;

        this.initScene();
        this.initCore();
        this.initNoise();
        this.initGlow(); // New sprite-based glow
        this.addEventListeners();
        this.animate();
    }

    initScene() {
        this.scene = new THREE.Scene();
        // No background color set on scene - lets CSS gradient show through
        // Subtle fog to fade distant objects matches the dark edge color
        this.scene.fog = new THREE.FogExp2(0x020817, 0.05);

        this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.1, 100);
        this.camera.position.set(0, 0, 12);

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.container.appendChild(this.renderer.domElement);
    }

    initCore() {
        this.coreGroup = new THREE.Group();
        this.scene.add(this.coreGroup);

        // Material for all wireframes - Self-illuminated (BasicMaterial)
        const coreMaterial = new THREE.LineBasicMaterial({
            color: 0x2E5CFF, // Bright Electric Blue
            transparent: true,
            opacity: 0.9,
            linewidth: 2
        });

        const secondaryMaterial = new THREE.LineBasicMaterial({
            color: 0x4B73FF,
            transparent: true,
            opacity: 0.5,
            linewidth: 1
        });

        // 1. Inner Nucleus
        const geo1 = new THREE.IcosahedronGeometry(0.8, 0); // Low poly
        const edges1 = new THREE.EdgesGeometry(geo1);
        this.core1 = new THREE.LineSegments(edges1, coreMaterial);
        this.coreGroup.add(this.core1);

        // 2. Middle Shell within
        const geo2 = new THREE.IcosahedronGeometry(1.4, 0);
        const edges2 = new THREE.EdgesGeometry(geo2);
        this.core2 = new THREE.LineSegments(edges2, secondaryMaterial);
        this.coreGroup.add(this.core2);

        // 3. Outer Geodesic Sphere
        const geo3 = new THREE.IcosahedronGeometry(2.0, 1); // More detail
        const edges3 = new THREE.EdgesGeometry(geo3);
        const outerMaterial = new THREE.LineBasicMaterial({
            color: 0x2E5CFF,
            transparent: true,
            opacity: 0.25
        });
        this.core3 = new THREE.LineSegments(edges3, outerMaterial);
        this.coreGroup.add(this.core3);
    }

    initNoise() {
        this.noiseGroup = new THREE.Group();
        this.scene.add(this.noiseGroup);
        this.noiseElements = [];

        // Materials
        const shapeMaterial = new THREE.LineBasicMaterial({
            color: 0x60A5FA, // Lighter blue for noise
            transparent: true,
            opacity: 0.6
        });

        const shapeMaterialDim = new THREE.LineBasicMaterial({
            color: 0x93C5FD,
            transparent: true,
            opacity: 0.3
        });

        // Geometries
        const geomTypes = [
            new THREE.BoxGeometry(0.5, 0.5, 0.5),
            new THREE.TetrahedronGeometry(0.6),
            new THREE.CylinderGeometry(0.4, 0.4, 0.1, 6), // Hexagon
            new THREE.BoxGeometry(0.1, 0.8, 0.5) // Card
        ];

        const count = 20;

        for (let i = 0; i < count; i++) {
            // Select random geometry
            const baseGeo = geomTypes[Math.floor(Math.random() * geomTypes.length)];
            const edgesGeo = new THREE.EdgesGeometry(baseGeo);

            const mat = Math.random() > 0.5 ? shapeMaterial : shapeMaterialDim;
            const mesh = new THREE.LineSegments(edgesGeo, mat);

            // Position randomly
            const angle = Math.random() * Math.PI * 2;
            const radius = 4 + Math.random() * 5;
            const y = (Math.random() - 0.5) * 8;

            mesh.position.set(
                Math.cos(angle) * radius,
                y,
                Math.sin(angle) * radius
            );

            mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);

            // Data for animation
            mesh.userData = {
                originalPos: mesh.position.clone(),
                speed: 0.002 + Math.random() * 0.003,
                rotSpeed: {
                    x: (Math.random() - 0.5) * 0.01,
                    y: (Math.random() - 0.5) * 0.01
                },
                offset: Math.random() * 100
            };

            this.noiseGroup.add(mesh);
            this.noiseElements.push(mesh);
        }
    }

    initGlow() {
        // Create a glow effect using a Sprite (simpler than post-processing, less issues)
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');

        // Radial gradient
        const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        gradient.addColorStop(0, 'rgba(46, 92, 255, 0.4)'); // Center blue
        gradient.addColorStop(0.5, 'rgba(46, 92, 255, 0.1)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 64, 64);

        const texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;

        const material = new THREE.SpriteMaterial({
            map: texture,
            color: 0xffffff,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });

        this.glowSprite = new THREE.Sprite(material);
        this.glowSprite.scale.set(8, 8, 1);
        this.scene.add(this.glowSprite);
    }

    addEventListeners() {
        window.addEventListener('resize', this.onResize.bind(this));
        document.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.mouseX = 0;
        this.mouseY = 0;
    }

    onMouseMove(event) {
        this.mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    onResize() {
        if (!this.container) return;
        this.width = this.container.clientWidth;
        this.height = this.container.clientHeight;
        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.width, this.height);
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));
        const time = performance.now() * 0.001;

        // Core Rotation
        this.core1.rotation.y = time * 0.2;
        this.core1.rotation.z = time * 0.1;

        this.core2.rotation.y = -time * 0.15;
        this.core2.rotation.x = Math.sin(time * 0.5) * 0.1;

        this.core3.rotation.y = time * 0.05;

        // Subtle Group Tilt based on Mouse
        this.scene.rotation.y = this.mouseX * 0.05;
        this.scene.rotation.x = -this.mouseY * 0.05;

        // Noise Animation
        this.noiseElements.forEach(mesh => {
            // Floating
            mesh.position.y = mesh.userData.originalPos.y + Math.sin(time + mesh.userData.offset) * 0.5;

            // Rotation
            mesh.rotation.x += mesh.userData.rotSpeed.x;
            mesh.rotation.y += mesh.userData.rotSpeed.y;

            // Repulsion (Simplified)
            // If mouse is near center, maybe push them? 
            // Or just keep them floating for now as requested "organic motion"
        });

        // Pulse the glow
        if (this.glowSprite) {
            const scale = 7 + Math.sin(time * 2) * 0.5;
            this.glowSprite.scale.set(scale, scale, 1);
        }

        this.renderer.render(this.scene, this.camera);
    }
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    // Add small delay
    setTimeout(() => {
        if (document.getElementById('signal-canvas-container')) {
            new SignalNoiseScene('signal-canvas-container');
        }
    }, 100);
});
