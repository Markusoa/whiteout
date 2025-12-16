import * as THREE from 'three';
import Stats from 'stats.js';
import { Input } from './Input.js';
import { Terrain } from '../world/Terrain.js';
import { PlayerController } from '../player/PlayerController.js';
import { CameraController } from '../camera/CameraController.js';
import { HUD } from '../ui/HUD.js';

export class Game {
    constructor() {
        this.container = document.getElementById('game-container');
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.stats = null;
        this.clock = new THREE.Clock();
        this.rafId = null;

        // Subsystems
        this.input = null;
        this.terrain = null;
        this.player = null;
        this.cameraController = null;
        this.hud = null;
        this.snowParticles = null;

        this.init();
    }

    init() {
        // Setup stats
        this.stats = new Stats();
        this.container.appendChild(this.stats.dom);

        // Setup Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1a1a2e); // Dark night sky
        this.scene.fog = new THREE.FogExp2(0x1a1a2e, 0.0015); // Darker fog

        // Setup Camera
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
        this.camera.position.set(0, 10, 20);

        // Setup Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.container.appendChild(this.renderer.domElement);

        // Handle Resize
        window.addEventListener('resize', this.onWindowResize.bind(this));

        // Lighting - Darker for night
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.2); // Reduced from 0.6
        this.scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 0.3); // Reduced from 0.8
        dirLight.position.set(50, 100, 50);
        dirLight.castShadow = true;
        this.scene.add(dirLight);

        // Initialize Subsystems
        this.input = new Input();
        this.terrain = new Terrain(this.scene);
        this.player = new PlayerController(this.scene, this.input, this.terrain);
        this.cameraController = new CameraController(this.camera, this.player.mesh, this.input);
        this.hud = new HUD();

        // Create Snowfall
        this.createSnowfall();
    }

    createSnowfall() {
        const particleCount = 2000;
        const particles = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const velocities = new Float32Array(particleCount);

        // Initialize particle positions and velocities (relative to particle system origin)
        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 200;     // x
            positions[i * 3 + 1] = Math.random() * 200;         // y
            positions[i * 3 + 2] = (Math.random() - 0.5) * 200; // z
            velocities[i] = Math.random() * 2 + 1; // Fall speed
        }

        particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particles.setAttribute('velocity', new THREE.BufferAttribute(velocities, 1));

        // Create snowflake texture
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');

        // Draw snowflake
        ctx.fillStyle = 'white';
        ctx.beginPath();

        // Center point
        const cx = 16;
        const cy = 16;

        // Draw 6 arms of snowflake
        for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3;

            // Main arm
            ctx.moveTo(cx, cy);
            ctx.lineTo(
                cx + Math.cos(angle) * 12,
                cy + Math.sin(angle) * 12
            );

            // Side branches
            for (let j = 0.4; j < 1; j += 0.3) {
                const branchX = cx + Math.cos(angle) * 12 * j;
                const branchY = cy + Math.sin(angle) * 12 * j;

                ctx.moveTo(branchX, branchY);
                ctx.lineTo(
                    branchX + Math.cos(angle + Math.PI / 4) * 4,
                    branchY + Math.sin(angle + Math.PI / 4) * 4
                );

                ctx.moveTo(branchX, branchY);
                ctx.lineTo(
                    branchX + Math.cos(angle - Math.PI / 4) * 4,
                    branchY + Math.sin(angle - Math.PI / 4) * 4
                );
            }
        }

        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Add center dot
        ctx.beginPath();
        ctx.arc(cx, cy, 2, 0, Math.PI * 2);
        ctx.fill();

        const snowTexture = new THREE.CanvasTexture(canvas);

        // Snow material with snowflake texture
        const snowMaterial = new THREE.PointsMaterial({
            map: snowTexture,
            size: 0.8,  // Smaller size
            transparent: true,
            opacity: 0.9,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        this.snowParticles = new THREE.Points(particles, snowMaterial);
        this.scene.add(this.snowParticles);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    update() {
        const dt = this.clock.getDelta();

        // Don't update game until start screen is dismissed
        if (this.hud && !this.hud.gameStarted) {
            return;
        }

        if (this.player) this.player.update(dt);
        if (this.cameraController) this.cameraController.update(dt);

        // Animate snowfall
        if (this.snowParticles && this.player) {
            // Move entire particle system to follow player
            this.snowParticles.position.copy(this.player.position);

            const positions = this.snowParticles.geometry.attributes.position.array;
            const velocities = this.snowParticles.geometry.attributes.velocity.array;
            const range = 200;

            for (let i = 0; i < positions.length / 3; i++) {
                // Fall down
                positions[i * 3 + 1] -= velocities[i] * dt * 20;

                // Reset when particle falls below player (relative coordinates)
                if (positions[i * 3 + 1] < -50) {
                    positions[i * 3 + 1] = 150;
                    // Randomize X and Z when respawning
                    positions[i * 3] = (Math.random() - 0.5) * range;
                    positions[i * 3 + 2] = (Math.random() - 0.5) * range;
                }
            }

            this.snowParticles.geometry.attributes.position.needsUpdate = true;
        }

        // Update HUD
        if (this.hud && this.player) {
            const speed = this.player.velocity ? this.player.velocity.length() : 0;
            const score = this.player.score || 0;
            const charge = this.player.jumpCharge || 0;
            const crashed = this.player.crashed || false;
            const lives = this.player.lives || 0;
            const dead = this.player.dead || false;
            const won = this.player.won || false;
            this.hud.update(speed * 3.6, score, charge, crashed, lives, dead, won);
        }
    }

    render() {
        this.renderer.render(this.scene, this.camera);
        this.stats.update();
    }

    loop() {
        this.rafId = requestAnimationFrame(this.loop.bind(this));
        this.update();
        this.render();
    }

    start() {
        this.loop();
    }
}
