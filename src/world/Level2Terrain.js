import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import modelUrl from '../assets/Level2_Mountain.glb?url';
import treeUrl from '../assets/Snow Tree.glb?url';

export class Level2Terrain {
    constructor(scene) {
        this.scene = scene;
        this.mesh = new THREE.Group();
        this.scene.add(this.mesh);
        this.isLoaded = false;
        this.init();
    }

    init() {
        const loader = new GLTFLoader();
        console.log("Loading Level 2 terrain from:", modelUrl);

        loader.load(modelUrl, (gltf) => {
            const model = gltf.scene;
            console.log("Level 2 Terrain GLB Loaded", model);

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
                    child.material = snowMaterial;
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            // Adjust Scale/Position (may need tuning)
            model.scale.set(1000, 1000, 1000);
            model.position.set(0, -5000, 5);

            this.mesh.add(model);
            this.isLoaded = true;
            this.populate();

        }, (xhr) => {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        }, (error) => {
            console.error('An error happened loading Level 2 terrain:', error);
        });
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

            // Grid-based stratified sampling for even distribution
            const gridSize = 60;
            const cellSize = 70;
            const areaWidth = gridSize * cellSize;
            const areaDepth = gridSize * cellSize;

            let treesPlaced = 0;
            console.log(`Placing trees on Level 2 terrain...`);

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

            console.log(`Level 2 terrain: Placed ${treesPlaced} trees.`);
        }, undefined, (error) => {
            console.error('Failed to load tree model for Level 2 terrain:', error);
        });
    }

    getHeight(x, z) {
        if (!this.mesh) return null;

        const raycaster = new THREE.Raycaster();
        const down = new THREE.Vector3(0, -1, 0);

        raycaster.set(new THREE.Vector3(x, 50000, z), down); // Higher start for Level 2
        const intersects = raycaster.intersectObject(this.mesh, true); // true for recursive

        if (intersects.length > 0) {
            console.log(`[Level2Terrain] Hit at Y: ${intersects[0].point.y} on object: ${intersects[0].object.name}`);
            return intersects[0].point.y;
        } else {
            console.warn(`[Level2Terrain] Raycast miss at ${x}, ${z}`);
        }

        return null;
    }
    getNormal(x, z) { return new THREE.Vector3(0, 1, 0); }
}
