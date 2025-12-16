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

        this.init();
    }

    init() {
        // Setup stats
        this.stats = new Stats();
        this.container.appendChild(this.stats.dom);

        // Setup Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xd6eaf8); // Sky blue
        this.scene.fog = new THREE.FogExp2(0xd6eaf8, 0.002);

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

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(50, 100, 50);
        dirLight.castShadow = true;
        this.scene.add(dirLight);

        // Initialize Subsystems
        this.input = new Input();
        this.terrain = new Terrain(this.scene);
        this.player = new PlayerController(this.scene, this.input, this.terrain);
        this.cameraController = new CameraController(this.camera, this.player.mesh, this.input);
        this.hud = new HUD();
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    update() {
        const dt = this.clock.getDelta();

        if (this.player) this.player.update(dt);
        if (this.cameraController) this.cameraController.update(dt);

        // Update HUD
        if (this.hud && this.player) {
            const speed = this.player.velocity ? this.player.velocity.length() : 0;
            const score = this.player.score || 0;
            const charge = this.player.jumpCharge || 0;
            this.hud.update(speed * 3.6, score, charge);
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
