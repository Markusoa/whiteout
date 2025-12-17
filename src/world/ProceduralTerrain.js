import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import treeUrl from '../assets/Snow Tree.glb?url';

export class ProceduralTerrain {
    constructor(scene) {
        this.scene = scene;
        this.mesh = new THREE.Group();
        this.scene.add(this.mesh);
        this.isLoaded = false;
        this.init();
    }

    init() {
        // Create procedural mountain using heightmap
        const width = 400;
        const depth = 600;
        const widthSegments = 100;
        const depthSegments = 150;

        const geometry = new THREE.PlaneGeometry(width, depth, widthSegments, depthSegments);

        // Generate heightmap using noise
        const vertices = geometry.attributes.position.array;
        for (let i = 0; i < vertices.length; i += 3) {
            const x = vertices[i];
            const z = vertices[i + 1];

            // Multi-octave noise for natural terrain
            let height = 0;

            // Base mountain shape (large features)
            height += this.noise2D(x * 0.005, z * 0.005) * 80;

            // Medium details
            height += this.noise2D(x * 0.02, z * 0.02) * 20;

            // Fine details
            height += this.noise2D(x * 0.05, z * 0.05) * 5;

            // Create slope - higher at back, lower at front
            const slopeFactor = (z / depth) * 0.5 + 0.5; // 0 to 1
            height *= slopeFactor * 2;

            // Ensure some minimum height variation
            height = Math.max(height, -10);

            vertices[i + 2] = height; // Set Y (height)
        }

        geometry.computeVertexNormals();
        geometry.rotateX(-Math.PI / 2); // Rotate to be horizontal

        // Snow material
        const material = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.9,
            metalness: 0.1,
            flatShading: false
        });

        const terrain = new THREE.Mesh(geometry, material);
        terrain.castShadow = true;
        terrain.receiveShadow = true;
        terrain.position.set(0, -20, 100);

        this.mesh.add(terrain);
        this.isLoaded = true;

        // Add trees after terrain is ready
        this.populate();
    }

    // Simple noise function (Perlin-like)
    noise2D(x, y) {
        // Simple pseudo-random noise using sine waves
        const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
        return (n - Math.floor(n)) * 2 - 1; // -1 to 1
    }

    populate() {
        const loader = new GLTFLoader();
        const raycaster = new THREE.Raycaster();
        const down = new THREE.Vector3(0, -1, 0);

        loader.load(treeUrl, (gltf) => {
            const treeModel = gltf.scene;

            treeModel.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            // Smaller grid for procedural terrain
            const gridSize = 40;
            const cellSize = 50;
            const areaWidth = gridSize * cellSize;
            const areaDepth = gridSize * cellSize;

            let treesPlaced = 0;
            console.log(`Placing trees on procedural terrain...`);

            for (let gx = 0; gx < gridSize; gx++) {
                for (let gz = 0; gz < gridSize; gz++) {
                    const x = (gx * cellSize) + (Math.random() * cellSize) - (areaWidth / 2);
                    const z = (gz * cellSize) + (Math.random() * cellSize) - (areaDepth / 2);

                    raycaster.set(new THREE.Vector3(x, 2000, z), down);
                    const intersects = raycaster.intersectObject(this.mesh, true);

                    if (intersects.length > 0) {
                        const hit = intersects[0];

                        // Always place trees on mountain surface (removed slope check)
                        const tree = treeModel.clone();
                        tree.position.copy(hit.point);
                        tree.position.y += 7.0;
                        tree.rotation.y = Math.random() * Math.PI * 2;

                        const scale = 20.0 * (0.8 + Math.random() * 0.4);
                        tree.scale.set(scale, scale, scale);

                        this.mesh.add(tree);
                        treesPlaced++;
                    }
                }
            }

            console.log(`Procedural terrain: Placed ${treesPlaced} trees.`);
        }, undefined, (error) => {
            console.error('Failed to load tree model for procedural terrain:', error);
        });
    }

    getHeight(x, z) {
        if (!this.mesh) return null;

        const raycaster = new THREE.Raycaster();
        const down = new THREE.Vector3(0, -1, 0);

        raycaster.set(new THREE.Vector3(x, 2000, z), down);
        const intersects = raycaster.intersectObject(this.mesh, true);

        if (intersects.length > 0) {
            return intersects[0].point.y;
        }

        return null;
    }
    getNormal(x, z) { return new THREE.Vector3(0, 1, 0); }
}
