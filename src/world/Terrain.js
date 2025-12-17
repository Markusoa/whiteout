import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import modelUrl from '../assets/mountain.glb?url';
import treeUrl from '../assets/Snow Tree.glb?url';

export class Terrain {
    constructor(scene) {
        this.scene = scene;
        this.mesh = new THREE.Group();
        this.scene.add(this.mesh);
        this.isLoaded = false;
        this.init();
    }

    init() {
        const loader = new GLTFLoader();
        console.log("Loading terrain from:", modelUrl);

        loader.load(modelUrl, (gltf) => {
            const model = gltf.scene;
            console.log("Terrain GLB Loaded", model);

            // Custom Snow Material
            const snowMaterial = new THREE.MeshStandardMaterial({
                color: 0xffffff,
                roughness: 0.9,
                metalness: 0.1,
                flatShading: false
            });

            // Traverse to setup materials/shadows
            model.traverse((child) => {
                if (child.isMesh) {
                    child.material = snowMaterial; // Assign the new snow material
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            // Adjust Scale/Position
            model.scale.set(10, 10, 10);
            model.position.set(0, -1000, 200);

            this.mesh.add(model);
            this.isLoaded = true;
            this.populate();

        }, (xhr) => {
            // Progress
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        }, (error) => {
            console.error('An error happened loading the terrain:', error);
        });
    }

    populate() {
        const loader = new GLTFLoader();
        const raycaster = new THREE.Raycaster();
        const down = new THREE.Vector3(0, -1, 0);

        // Load and spawn trees
        loader.load(treeUrl, (gltf) => {
            const treeModel = gltf.scene;

            // Setup shadows for tree model
            treeModel.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            // Grid-based stratified sampling for even distribution
            const gridSize = 60; // 60x60 grid
            const cellSize = 70; // Size of each cell
            const areaWidth = gridSize * cellSize;
            const areaDepth = gridSize * cellSize;

            let treesPlaced = 0;
            console.log(`Attempting to place trees in ${gridSize}x${gridSize} grid...`);

            for (let gx = 0; gx < gridSize; gx++) {
                for (let gz = 0; gz < gridSize; gz++) {
                    // Random position within this grid cell
                    const x = (gx * cellSize) + (Math.random() * cellSize) - (areaWidth / 2);
                    const z = (gz * cellSize) + (Math.random() * cellSize) - (areaDepth / 2);

                    // Raycast from high above to find the mountain surface
                    raycaster.set(new THREE.Vector3(x, 2000, z), down);
                    const intersects = raycaster.intersectObject(this.mesh, true);

                    if (intersects.length > 0) {
                        const hit = intersects[0];

                        // Always place trees on mountain surface (removed slope check)
                        const tree = treeModel.clone();

                        // Position on mountain surface
                        tree.position.copy(hit.point);
                        tree.position.y += 7.0; // Lift above surface to prevent burial

                        // Random rotation
                        tree.rotation.y = Math.random() * Math.PI * 2;

                        // Random scale variation
                        const scale = 20.0 * (0.8 + Math.random() * 0.4);
                        tree.scale.set(scale, scale, scale);

                        this.mesh.add(tree);
                        treesPlaced++;
                    }
                }
            }

            console.log(`Trees spawned successfully! Placed ${treesPlaced} trees.`);
        }, undefined, (error) => {
            console.error('Failed to load tree model:', error);
        });
    }

    // Helper methods
    getHeight(x, z) {
        if (!this.mesh) return null;

        const raycaster = new THREE.Raycaster();
        const down = new THREE.Vector3(0, -1, 0);

        // Start high up
        raycaster.set(new THREE.Vector3(x, 2000, z), down);

        // Raycast against the terrain mesh
        const intersects = raycaster.intersectObject(this.mesh, true);

        if (intersects.length > 0) {
            return intersects[0].point.y;
        }

        return null; // Fallback
    }
    getNormal(x, z) { return new THREE.Vector3(0, 1, 0); }
}
