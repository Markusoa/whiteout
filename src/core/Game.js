import * as THREE from 'three';
import Stats from 'stats.js';
import { Input } from './Input.js';
import { Terrain } from '../world/Terrain.js';
import { PlayerController } from '../player/PlayerController.js';
import { CameraController } from '../camera/CameraController.js';
import { HUD } from '../ui/HUD.js';
import { LevelManager } from './LevelManager.js';
import { ProceduralTerrain } from '../world/ProceduralTerrain.js';
import { Level2Terrain } from '../world/Level2Terrain.js';

export class Game {
    constructor() {
        this.container = document.getElementById('game-container');
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.stats = null;
        this.clock = new THREE.Clock();
        this.escapePressed = false;
        this.rafId = null;

        // Subsystems
        this.input = null;
        this.terrain = null;
        this.player = null;
        this.cameraController = null;
        this.hud = null;
        this.snowParticles = null;
        this.levelManager = null;
        this.currentTheme = 'Night'; // Default theme

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
        this.ambientLight = new THREE.AmbientLight(0xffffff, 0.2); // Reduced from 0.6
        this.scene.add(this.ambientLight);

        this.dirLight = new THREE.DirectionalLight(0xffffff, 0.3); // Reduced from 0.8
        this.dirLight.position.set(50, 100, 50);
        this.dirLight.castShadow = true;
        this.scene.add(this.dirLight);

        // Initialize Subsystems
        this.input = new Input();
        this.levelManager = new LevelManager();
        this.loadLevel(1);

        // Create Snowfall
        this.createSnowfall();


    }

    loadLevel(levelNum) {
        console.log(`Loading level ${levelNum}...`);

        // Clear existing terrain if any
        if (this.terrain) {
            this.scene.remove(this.terrain.mesh);
            this.terrain = null;
        }

        // Get level config
        this.levelManager.currentLevel = levelNum;
        const config = this.levelManager.getCurrentLevelConfig();

        // Create terrain based on type
        if (config.terrainType === 'model') {
            this.terrain = new Terrain(this.scene);
        } else if (config.terrainType === 'procedural') {
            this.terrain = new ProceduralTerrain(this.scene);
        } else if (config.terrainType === 'level2') {
            this.terrain = new Level2Terrain(this.scene);
        }

        // Apply stored theme instead of level config (allows theme to persist across levels)
        this.setTheme(this.currentTheme);

        this.dirLight.color = new THREE.Color(0xffffff);

        // Initialize or reset player
        const applySpawnPosition = () => {
            const spawnPos = this.computeSpawnPosition(config);
            if (this.player) {
                this.player.reset(spawnPos);
            }
        };

        if (!this.player) {
            this.player = new PlayerController(this.scene, this.input, this.terrain, this);
            applySpawnPosition();
            this.cameraController = new CameraController(this.camera, this.player.mesh, this.input);
        } else {
            this.player.terrain = this.terrain;
            this.player.game = this;
            applySpawnPosition();
        }

        // Ensure we relocate the player above the final terrain height once it finishes loading
        const terrainRef = this.terrain;
        if (terrainRef && !terrainRef.isLoaded) {
            const waitForTerrain = () => {
                if (terrainRef !== this.terrain) return; // Level switched while waiting
                if (terrainRef.isLoaded) {
                    applySpawnPosition();
                } else {
                    requestAnimationFrame(waitForTerrain);
                }
            };
            requestAnimationFrame(waitForTerrain);
        }

        // Initialize or update HUD
        if (!this.hud) {
            this.hud = new HUD(this.input);
            this.hud.game = this;
        }
        this.hud.updateWinCondition(config.winCondition);

        console.log(`Level ${levelNum} loaded!`);
    }

    computeSpawnPosition(config) {
        const baseSpawn = config && config.spawnPosition
            ? new THREE.Vector3(config.spawnPosition.x, config.spawnPosition.y, config.spawnPosition.z)
            : new THREE.Vector3(0, 100, 40);

        if (this.terrain && this.terrain.isLoaded) {
            const bounds = new THREE.Box3().setFromObject(this.terrain.mesh);
            const safeY = Number.isFinite(bounds.max.y) ? bounds.max.y + 20 : baseSpawn.y;
            baseSpawn.y = Math.max(baseSpawn.y, safeY);
            
            // Apply level-specific height offset after computing spawn height
            const heightOffset = config && config.spawnHeightOffset ? config.spawnHeightOffset : 0;
            baseSpawn.y += heightOffset;
        }

        return baseSpawn;
    }

    setTheme(theme) {
        this.currentTheme = theme; // Store the current theme
        
        if (theme === 'Day') {
            // Bright Day Theme
            const skyColor = 0xd6eaf8;
            this.scene.background = new THREE.Color(skyColor);
            this.scene.fog = new THREE.FogExp2(skyColor, 0.002);

            // Update lights
            if (this.ambientLight) this.ambientLight.intensity = 0.6;
            if (this.dirLight) this.dirLight.intensity = 0.8;

        } else {
            // Dark Night Theme (Default)
            const skyColor = 0x1a1a2e;
            this.scene.background = new THREE.Color(skyColor);
            this.scene.fog = new THREE.FogExp2(skyColor, 0.0015);

            if (this.ambientLight) this.ambientLight.intensity = 0.2;
            if (this.dirLight) this.dirLight.intensity = 0.3;
        }
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

        // Toggle Pause
        if (this.input.keys['Escape'] && !this.escapePressed) {
            this.escapePressed = true;
            if (this.hud && this.hud.gameStarted) {
                this.hud.togglePause(!this.hud.isPaused);
            }
        }
        if (!this.input.keys['Escape']) {
            this.escapePressed = false;
        }

        // Don't update game until start screen is dismissed OR if paused
        if (this.hud && (!this.hud.gameStarted || this.hud.isPaused)) {
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
            const speedKmh = speed * 3.6;
            
            // Track max speed
            if (speedKmh > (this.player.maxSpeed || 0)) {
                this.player.maxSpeed = speedKmh;
            }
            
            const score = this.player.score || 0;
            const charge = this.player.jumpCharge || 0;
            const stamina = this.player.stamina !== undefined ? this.player.stamina : 1.0;
            const crashed = this.player.crashed || false;
            const lives = this.player.lives || 0;
            const dead = this.player.dead || false;
            const won = this.player.won || false;
            const currentLevel = this.levelManager ? this.levelManager.currentLevel : 1;
            this.hud.update(speedKmh, score, charge, crashed, lives, dead, won, currentLevel, stamina);
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
