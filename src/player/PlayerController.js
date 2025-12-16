import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { TrickSystem } from './TrickSystem.js';
import snowmanUrl from '../assets/snowman.glb?url';

export class PlayerController {
    constructor(scene, input, terrain) {
        this.scene = scene;
        this.input = input;
        this.terrain = terrain;
        this.trickSystem = new TrickSystem();

        this.mesh = null;
        this.body = null;
        this.board = null;

        this.position = new THREE.Vector3(0, 50, 40); // Lowered from 10 to spawn on mountain
        this.velocity = new THREE.Vector3();
        this.quaternion = new THREE.Quaternion(); // Master Rotation
        this.angularVelocity = new THREE.Vector3(); // Physics Rotation

        this.speed = 0;

        this.raycaster = new THREE.Raycaster();
        this.downVector = new THREE.Vector3(0, -1, 0);

        this.grounded = false;

        // Constants
        this.gravity = 30.0;
        this.friction = 0.2;
        this.turnSpeed = 2.0;
        this.maxSpeed = 60.0;
        this.jumpForce = 25.0;
        this.jumpCharge = 0;
        this.maxJumpCharge = 1.0;

        // Input Sensitivities (Torque)
        this.airSpinTorque = 10.0;
        this.airFlipTorque = 8.0;

        this.airTime = 0;
        this.score = 0;
        this.crashed = false;
        this.recoveryTimer = 0;
        this.lives = 3; // Lives system
        this.dead = false;
        this.won = false;

        this.init();
    }

    init() {
        this.mesh = new THREE.Group();
        this.mesh.castShadow = true;
        this.scene.add(this.mesh);

        const loader = new GLTFLoader();
        loader.load(snowmanUrl, (gltf) => {
            const model = gltf.scene;
            this.body = model;
            model.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
            model.position.y = 0.1;
            model.scale.set(0.5, 0.5, 0.5);
            model.rotation.y = Math.PI;
            this.mesh.add(model);
        }, undefined, (err) => {
            console.error("Failed to load snowman:", err);
            const bodyGeo = new THREE.BoxGeometry(0.5, 1.8, 0.5);
            const bodyMat = new THREE.MeshStandardMaterial({ color: 0xff4444 });
            this.body = new THREE.Mesh(bodyGeo, bodyMat);
            this.body.position.y = 0.9;
            this.mesh.add(this.body);
        });

        const boardGeo = new THREE.BoxGeometry(0.8, 0.1, 3.2);
        const boardMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
        this.board = new THREE.Mesh(boardGeo, boardMat);
        this.board.position.y = 0.05;
        this.board.castShadow = true;
        this.board.receiveShadow = true;
        this.mesh.add(this.board);
    }

    update(dt) {
        // SAFETY: Wait for Terrain
        if (!this.terrain.isLoaded) return;

        // Check win condition
        if (!this.won && !this.dead && this.score >= 10000) {
            this.won = true;
            console.log("YOU WIN!");
        }

        // Freeze gameplay if won or dead
        if (this.won || this.dead) {
            return;
        }

        if (this.crashed) {
            this.handleCrash(dt);
            return;
        }

        this.handleInput(dt);
        this.handlePhysics(dt);

        // Apply Physics State to Visuals
        this.mesh.position.copy(this.position);
        this.mesh.quaternion.copy(this.quaternion);
    }

    handleInput(dt) {
        if (this.grounded) {
            // GROUND INPUT: Steering
            if (this.input.actions.left) {
                const axis = new THREE.Vector3(0, 1, 0);
                this.velocity.applyAxisAngle(axis, this.turnSpeed * dt);
            }
            if (this.input.actions.right) {
                const axis = new THREE.Vector3(0, 1, 0);
                this.velocity.applyAxisAngle(axis, -this.turnSpeed * dt);
            }

            // Jumping
            if (this.input.actions.jump) {
                this.jumpCharge = Math.min(this.jumpCharge + dt * 1.5, this.maxJumpCharge);
                if (this.body) this.body.scale.y = 1.0 - (this.jumpCharge * 0.4);
            } else {
                if (this.jumpCharge > 0) {
                    this.doJump();
                }
                if (this.body) this.body.scale.y = 1.0;
            }

        } else {
            // AIR INPUT: TORQUE
            const torque = new THREE.Vector3(0, 0, 0);

            if (this.input.actions.left) torque.y += 1;
            if (this.input.actions.right) torque.y -= 1;

            if (this.input.actions.forward) torque.x -= 1; // Frontflip
            if (this.input.actions.backward) torque.x += 1; // Backflip

            // Apply Torque (Local Space)
            if (torque.lengthSq() > 0) {
                torque.normalize();

                // Scale torque (Snappier response)
                torque.x *= 15.0 * dt; // Increased from 8
                torque.y *= 20.0 * dt; // Increased from 10

                const globalTorque = torque.clone().applyQuaternion(this.quaternion);
                this.angularVelocity.add(globalTorque);
            } else {
                // AUTO-LEVEL ASSIST (When no input)
                // Gently rotate towards nearest upright orientation to help landing
                // But we don't want to kill the "cool" off-axis state completely.
                // Just damp non-yaw rotation?
                // Let's damp Angular Velocity heavily first.
            }

            // Strong Damping (Stops spinning quickly when key released)
            // increasing damping "easier to control"
            this.angularVelocity.multiplyScalar(1.0 - 3.0 * dt);

            // Reset Charge
            if (this.airTime > 0.25) this.jumpCharge = 0;
            if (this.body) this.body.scale.y = 1.0;
        }
    }

    doJump() {
        this.grounded = false;
        this.airTime = 1.0;

        const force = this.jumpForce * (0.8 + this.jumpCharge * 1.5);
        this.velocity.y = Math.max(0, this.velocity.y) + force;

        this.jumpCharge = 0;
        if (this.body) this.body.scale.y = 1.0;
        this.trickSystem.startJump();
    }

    handlePhysics(dt) {
        // --- 1. MULTI-POINT RAYCAST GROUND CHECK ---
        const offsets = [
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(-0.3, 0, -0.7),
            new THREE.Vector3(0.3, 0, -0.7),
            new THREE.Vector3(-0.3, 0, 0.7),
            new THREE.Vector3(0.3, 0, 0.7)
        ];

        let validHits = 0;
        let avgHeight = 0;
        let avgNormal = new THREE.Vector3(0, 0, 0);

        for (const offset of offsets) {
            // Transform offset by player rotation to cast relative to board
            const worldOffset = offset.clone().applyQuaternion(this.quaternion);
            const rayOrigin = this.position.clone().add(worldOffset);

            // Start higher to prevent clipping
            rayOrigin.y += 5.0;

            this.raycaster.set(rayOrigin, this.downVector);
            const intersects = this.raycaster.intersectObject(this.terrain.mesh, true);

            if (intersects.length > 0) {
                const hit = intersects[0];
                if (validHits === 0) avgHeight = hit.point.y;
                else avgHeight += hit.point.y;

                // Normal
                const obj = hit.object;
                const nMat = new THREE.Matrix3().getNormalMatrix(obj.matrixWorld);
                const wNorm = hit.face.normal.clone().applyMatrix3(nMat).normalize();

                avgNormal.add(wNorm);
                validHits++;
            }
        }

        let groundHeight = -1000;
        let groundNormal = new THREE.Vector3(0, 1, 0);

        if (validHits > 0) {
            avgHeight /= validHits;
            groundHeight = avgHeight;
            groundNormal = avgNormal.divideScalar(validHits).normalize();
        }

        const dist = this.position.y - groundHeight;
        const snap = 0.5;

        // --- 2. INTEGRATE VELOCITY ---
        this.velocity.y -= this.gravity * dt;
        this.position.add(this.velocity.clone().multiplyScalar(dt));

        // --- 3. GROUND / AIR LOGIC ---
        // Check if we hit ground and are failing downwards (or slightly up)
        if (dist < snap && this.velocity.y <= 0.1) {
            // === LANDING / GROUND ===

            if (!this.grounded) {
                // Just Landed: CHECK ALIGNMENT
                const up = new THREE.Vector3(0, 1, 0).applyQuaternion(this.quaternion);
                const alignment = up.dot(groundNormal);

                if (alignment < 0.2) { // Relaxed from 0.5
                    // CRASH! (Too angled)
                    this.crash();
                    return;
                } else {
                    // SUCCESSFUL LANDING
                    const trick = this.trickSystem.land(this.quaternion); // Pass current Rot
                    if (trick.points > 0) {
                        this.score += trick.points;
                        console.log("LANDED:", trick.name, trick.points);
                    }
                }

                this.grounded = true;
                this.airTime = 0;
                this.angularVelocity.set(0, 0, 0); // Stop spinning
            }

            this.grounded = true;
            this.position.y = groundHeight;
            this.velocity.y = 0;

            // Friction
            if (this.input.actions.backward) {
                this.velocity.multiplyScalar(1 - 5.0 * dt);
            } else {
                this.velocity.multiplyScalar(1 - this.friction * dt);
            }

            // Slope Gravity
            const gravityVec = new THREE.Vector3(0, -1, 0);
            const slopeForce = gravityVec.clone().sub(groundNormal.clone().multiplyScalar(gravityVec.dot(groundNormal)));
            this.velocity.add(slopeForce.multiplyScalar(this.gravity * dt));

            // ORIENTATION ALIGNMENT
            if (this.velocity.lengthSq() > 0.1) {
                const velDir = this.velocity.clone().normalize();

                // Construct target rotation
                const targetMx = new THREE.Matrix4().lookAt(
                    new THREE.Vector3(0, 0, 0),
                    velDir,
                    groundNormal
                );
                const targetQ = new THREE.Quaternion().setFromRotationMatrix(targetMx);
                this.quaternion.slerp(targetQ, dt * 10);
            }

        } else {
            // === AIR ===
            this.grounded = false;
            this.airTime += dt;

            // Apply Quaternion Rotation from Angular Velocity
            if (this.angularVelocity.lengthSq() > 0.0001) {
                const rotStep = this.angularVelocity.length() * dt;
                const axis = this.angularVelocity.clone().normalize();
                const dQ = new THREE.Quaternion().setFromAxisAngle(axis, rotStep);
                this.quaternion.premultiply(dQ);
            }
            this.trickSystem.update(dt, this.quaternion);
        }
    }

    crash() {
        this.crashed = true;
        this.recoveryTimer = 2.0;
        this.lives--;
        console.log(`CRASHED! Lives remaining: ${this.lives}`);

        if (this.lives <= 0) {
            this.dead = true;
            console.log("GAME OVER!");
        }

        this.velocity.set(0, 0, 0);
        this.angularVelocity.set(0, 0, 0);
        this.mesh.rotation.z = Math.PI / 2; // Lie on side (visual only? No, this messes with Quaternion tracking but ok for now)
        // Better to set Quaternion to 'side'
        const sideQ = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 2);
        this.quaternion.multiply(sideQ);
    }

    handleCrash(dt) {
        if (this.dead) {
            // Stay crashed if dead
            return;
        }

        this.recoveryTimer -= dt;
        if (this.recoveryTimer <= 0) {
            this.crashed = false;
            // Reset Orientation to upright
            this.quaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), 0);
            this.position.y += 2.0;
            this.velocity.set(0, 0, 10);
        }
    }
}
