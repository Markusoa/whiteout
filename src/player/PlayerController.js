import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { TrickSystem } from './TrickSystem.js';
import snowmanUrl from '../assets/snowman.glb?url';

export class PlayerController {
    constructor(scene, input, terrain, game = null) {
        this.scene = scene;
        this.input = input;
        this.terrain = terrain;
        this.game = game;
        this.trickSystem = new TrickSystem();

        this.mesh = null;
        this.body = null;
        this.board = null;

        this.position = new THREE.Vector3(0, 100, 0); // Higher spawn to avoid underground
        this.velocity = new THREE.Vector3();
        this.quaternion = new THREE.Quaternion(); // Master Rotation
        this.angularVelocity = new THREE.Vector3(); // Physics Rotation

        this.speed = 0;

        this.raycaster = new THREE.Raycaster();
        this.downVector = new THREE.Vector3(0, -1, 0);

        this.grounded = false;

        // Constants
        this.gravity = 80.0; // Increased from 30.0 for faster acceleration
        this.friction = 0.2;
        this.turnSpeed = 2.0;
        this.maxSpeed = 200.0; // Increased from 60.0 for higher top speed
        this.jumpForce = 25.0;
        this.jumpCharge = 0;
        this.maxJumpCharge = 1.0;

        // Input Sensitivities (Torque)
        // Input Sensitivities (Torque)
        this.airSpinTorque = 45.0; // Increased significantly for faster spins
        this.airFlipTorque = 30.0; // Increased significantly for faster flips

        this.airTime = 0;
        this.score = 0;
        this.crashed = false;
        this.recoveryTimer = 0;
        this.lives = 3; // Lives system
        this.dead = false;
        this.won = false;

        // Statistics tracking
        this.maxSpeed = 0; // Max speed in km/h
        this.trickCount = 0; // Number of tricks landed
        this.totalTrickPoints = 0; // Total points from tricks

        // Stamina system
        this.stamina = 1.0; // Current stamina (0-1)
        this.maxStamina = 1.0;
        this.staminaDepletionRate = 2; // How fast stamina depletes when boosting (much faster now)
        this.staminaRegenRate = 0.5; // How fast stamina regenerates (faster regen to compensate)
        this.staminaRegenDelay = 1.0; // Delay in seconds before stamina starts regenerating
        this.staminaRegenTimer = 0; // Timer tracking time since last boost
        this.boostBaseSpeed = 100.0; // Fixed speed addition when boosting (helps when stationary/slow)
        this.boostMaxSpeed = 150.0; // Speed threshold where boost becomes less effective

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

    reset(startPosition = new THREE.Vector3(0, 50, 40)) {
        // Reset position and physics
        this.position.copy(startPosition);
        this.velocity.set(0, 0, 0);
        this.quaternion.identity();
        this.angularVelocity.set(0, 0, 0);

        // Reset game state
        this.score = 0;
        this.lives = 3;
        this.crashed = false;
        this.dead = false;
        this.won = false;
        this.grounded = false;
        this.airTime = 0;
        this.jumpCharge = 0;
        this.recoveryTimer = 0;

        // Reset statistics
        this.maxSpeed = 0;
        this.trickCount = 0;
        this.totalTrickPoints = 0;

        // Reset stamina
        this.stamina = 1.0;
        this.staminaRegenTimer = 0;

        // Reset trick system
        this.trickSystem = new TrickSystem();

        // Update mesh
        this.mesh.position.copy(this.position);
        this.mesh.quaternion.copy(this.quaternion);
    }


    update(dt) {
        // SAFETY: Wait for Terrain
        if (!this.terrain.isLoaded) return;

        // Check win condition
        const winCondition = this.game && this.game.levelManager
            ? this.game.levelManager.getWinCondition()
            : 6000;
        if (!this.won && !this.dead && this.score >= winCondition) {
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
        const snap = 5.0; // Increased significantly for high speed

        // --- 2. INTEGRATE VELOCITY ---
        this.velocity.y -= this.gravity * dt;
        this.position.add(this.velocity.clone().multiplyScalar(dt));

        // --- 3. GROUND / AIR LOGIC ---
        // Check if we hit ground and are failing downwards (or slightly up)
        if (dist < snap && this.velocity.y <= 10.0) { // Relaxed velocity check
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
                        this.trickCount++;
                        this.totalTrickPoints += trick.points;
                        console.log("LANDED:", trick.name, trick.points);
                        if (this.game && this.game.hud) {
                            this.game.hud.showTrickText(trick.name);
                        }
                    }
                }

                this.grounded = true;
                this.airTime = 0;
                this.angularVelocity.set(0, 0, 0); // Stop spinning
            }

            this.grounded = true;
            this.position.y = groundHeight;

            // Only kill Y velocity if it's negative (falling) or small positive
            // This prevents killing a big jump impulse if we were to add one here (though we don't)
            if (this.velocity.y < 0) this.velocity.y = 0;

            // Friction
            if (this.input.actions.backward) {
                this.velocity.multiplyScalar(1 - 5.0 * dt);
            } else {
                this.velocity.multiplyScalar(1 - this.friction * dt);
            }

            // Speed Boost (Shift key) - consumes stamina (more effective at low speeds, less at high speeds)
            // Only boost if stamina is available - if out of stamina, ignore shift input completely
            if (this.input.actions.boost && this.stamina > 0.01 && this.velocity.lengthSq() > 0.01) {
                const currentSpeed = this.velocity.length();
                const velDir = this.velocity.clone().normalize();

                // Calculate boost effectiveness based on current speed
                // More effective at low speeds, less effective at high speeds
                const speedRatio = Math.min(currentSpeed / this.boostMaxSpeed, 1.0);
                const boostEffectiveness = 1.0 - (speedRatio * 0.7); // Reduces to 30% effectiveness at max speed

                // Apply boost: fixed base speed + speed-dependent multiplier
                const baseBoost = this.boostBaseSpeed * boostEffectiveness;
                const speedBoost = currentSpeed * 0.025 * boostEffectiveness; // Small multiplier, scaled down at high speeds
                const totalBoost = baseBoost + speedBoost;

                // Apply boost in direction of movement
                this.velocity.add(velDir.multiplyScalar(totalBoost * dt));

                // Deplete stamina
                this.stamina = Math.max(0, this.stamina - this.staminaDepletionRate * dt);

                // Reset regeneration timer whenever boost is used
                this.staminaRegenTimer = 0;
            } else {
                // Update regeneration timer
                this.staminaRegenTimer += dt;

                // Regenerate stamina only after delay has passed
                if (this.staminaRegenTimer >= this.staminaRegenDelay && this.stamina < this.maxStamina) {
                    this.stamina = Math.min(this.maxStamina, this.stamina + this.staminaRegenRate * dt);
                }
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
