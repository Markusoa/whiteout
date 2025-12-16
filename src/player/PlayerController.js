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

        this.position = new THREE.Vector3(0, 10, 40);
        this.velocity = new THREE.Vector3();
        this.speed = 0;

        this.raycaster = new THREE.Raycaster();
        this.downVector = new THREE.Vector3(0, -1, 0);

        this.grounded = false;

        // Constants
        this.gravity = 30.0;
        this.friction = 0.2;
        this.turnSpeed = 3.0;
        this.maxSpeed = 60.0;
        this.jumpForce = 10.0; // Reduced to 25.0
        this.jumpCharge = 0;
        this.maxJumpCharge = 1.0;

        this.heading = 0;
        this.pitch = 0;
        this.roll = 0;

        this.airTime = 0;

        this.score = 0;
        this.lastTruncName = "";

        this.init();
    }

    init() {
        // Player Container (Pivot)
        this.mesh = new THREE.Group();
        this.mesh.castShadow = true;
        this.scene.add(this.mesh);

        // Load Snowman
        const loader = new GLTFLoader();
        loader.load(snowmanUrl, (gltf) => {
            const model = gltf.scene;
            this.body = model;

            // Visuals
            model.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            // Positioning
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

        // Snowboard - 2x Size
        const boardGeo = new THREE.BoxGeometry(0.8, 0.1, 3.2);
        const boardMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
        this.board = new THREE.Mesh(boardGeo, boardMat);
        this.board.position.y = 0.05;
        this.board.castShadow = true;
        this.board.receiveShadow = true;
        this.mesh.add(this.board);
    }

    update(dt) {
        this.handleInput(dt);
        this.handlePhysics(dt);

        // Apply position
        this.mesh.position.copy(this.position);

        // Visual Rotation
        this.mesh.rotation.order = 'YXZ';
        this.mesh.rotation.y = this.heading;
        this.mesh.rotation.x = this.pitch;

        // Bank (Tilt) / Roll
        if (this.grounded) {
            const lean = (this.input.actions.left ? 1 : 0) - (this.input.actions.right ? 1 : 0);
            const targetLean = lean * 0.5;
            this.roll = THREE.MathUtils.lerp(this.roll, targetLean, dt * 5);
        } else {
            // Air Roll Decay
            this.roll = THREE.MathUtils.lerp(this.roll, 0, dt * 2);
        }
        this.mesh.rotation.z = this.roll;
    }

    handleInput(dt) {
        let rotationDelta = 0;
        const isFlipping = this.input.actions.forward || this.input.actions.backward;
        const isSpinning = this.input.actions.left || this.input.actions.right;

        // Turning & Spinning
        let turn = 0;

        if (this.grounded) {
            // Ground Turning
            if (this.input.actions.left) { turn += 1; }
            if (this.input.actions.right) { turn -= 1; }
            rotationDelta = turn * this.turnSpeed * dt;
            this.heading += rotationDelta;
        } else {
            // AIR LOGIC - EXCLUSIVE TRICKS

            if (isFlipping) {
                // FLIP MODE
                rotationDelta = 0;

            } else if (isSpinning) {
                // SPIN MODE (Only if not flipping)
                if (this.input.actions.left) { turn += 1; }
                if (this.input.actions.right) { turn -= 1; }

                if (this.input.actions.spinLeft) turn += 2.0;
                else if (this.input.actions.spinRight) turn -= 2.0;

                turn *= 2.0;
                rotationDelta = turn * this.turnSpeed * dt;
                this.heading += rotationDelta;
            }
        }

        // Flips
        if (!this.grounded) {
            const flipSpeed = 5.0;
            if (this.input.actions.forward) { // Frontflip
                this.pitch -= flipSpeed * dt;
            } else if (this.input.actions.backward) { // Backflip
                this.pitch += flipSpeed * dt;
            }
        } else {
            // Reset Pitch
            this.pitch = THREE.MathUtils.lerp(this.pitch, 0, dt * 10);
            if (Math.abs(this.pitch) < 0.1) this.pitch = 0;
        }

        if (!this.grounded) {
            this.trickSystem.update(dt, rotationDelta);
        }

        // Jumping - Coyote Time Support
        if (this.grounded || this.airTime < 0.25) {
            if (this.input.actions.jump) {
                this.jumpCharge = Math.min(this.jumpCharge + dt * 1.5, this.maxJumpCharge);
                if (this.body) this.body.scale.y = 1.0 - (this.jumpCharge * 0.4);
            } else {
                if (this.jumpCharge > 0) {
                    this.grounded = false;
                    this.airTime = 1.0;

                    // Boosted Power Tuned
                    // Base 25. Multiplier 0.8 (20) to 2.5 (62.5).
                    const finalForce = this.jumpForce * (0.8 + this.jumpCharge * 1.5);
                    // Increased max multiplier slightly to ensure FULL charge is still fun

                    if (this.velocity.y < 0) this.velocity.y = 0;
                    this.velocity.y += finalForce;

                    this.jumpCharge = 0;
                    if (this.body) this.body.scale.y = 1.0;
                    this.trickSystem.startJump();
                }
                if (this.body) this.body.scale.y = 1.0;
            }
        } else {
            if (this.airTime > 0.25) {
                this.jumpCharge = 0;
                if (this.body) this.body.scale.y = 1.0;
            }
        }
    }

    handlePhysics(dt) {
        // Multi-point Raycast
        const offsets = [
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(-0.3, 0, -0.7),
            new THREE.Vector3(0.3, 0, -0.7),
            new THREE.Vector3(-0.3, 0, 0.7),
            new THREE.Vector3(0.3, 0, 0.7)
        ];

        const rotationMatrix = new THREE.Matrix4().makeRotationY(this.heading);

        let avgHeight = 0;
        let validHits = 0;
        let avgNormal = new THREE.Vector3(0, 0, 0);

        for (const offset of offsets) {
            const worldOffset = offset.clone().applyMatrix4(rotationMatrix);
            const rayOrigin = this.position.clone().add(worldOffset);
            rayOrigin.y += 3.0;

            this.raycaster.set(rayOrigin, this.downVector);
            const intersects = this.raycaster.intersectObject(this.terrain.mesh, true);

            if (intersects.length > 0) {
                if (validHits === 0) avgHeight = intersects[0].point.y;
                else avgHeight += intersects[0].point.y;

                const obj = intersects[0].object;
                const normalMatrix = new THREE.Matrix3().getNormalMatrix(obj.matrixWorld);
                const worldNormal = intersects[0].face.normal.clone().applyMatrix3(normalMatrix).normalize();

                avgNormal.add(worldNormal);
                validHits++;
            }
        }

        if (validHits > 1) avgHeight /= validHits;

        let groundHeight = -1000;
        let groundNormal = new THREE.Vector3(0, 1, 0);

        if (validHits > 0) {
            groundHeight = avgHeight;
            groundNormal = avgNormal.divideScalar(validHits).normalize();
        }

        const snapDistance = 0.5;
        const distToGround = this.position.y - groundHeight;

        // Check ground
        if (distToGround <= snapDistance + 0.5 && this.velocity.y <= 0.1) {
            if (!this.grounded) {
                const trick = this.trickSystem.land();
                if (trick.points > 0) {
                    this.score += trick.points;
                    this.lastTruncName = trick.name;
                    console.log("Trick:", trick.name);
                }
                this.pitch = 0;
                this.roll = 0;
            }

            this.grounded = true;
            this.airTime = 0;
            this.position.y = groundHeight;

            // Physics
            const gravityVec = new THREE.Vector3(0, -1, 0);
            const gravityComponent = gravityVec.clone().sub(groundNormal.clone().multiplyScalar(gravityVec.dot(groundNormal)));
            this.velocity.add(gravityComponent.multiplyScalar(this.gravity * dt));

            let currentFriction = this.friction;
            if (this.input.actions.backward) currentFriction = 5.0;
            this.velocity.multiplyScalar(1 - currentFriction * dt);

            // Switch & Steering
            const speed = this.velocity.length();
            if (speed > 0.1) {
                const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.heading);
                const velDir = this.velocity.clone().normalize();
                const dot = velDir.dot(forward);

                const targetFacing = dot >= 0 ? forward : forward.clone().negate();

                const slopeDir = targetFacing.clone().sub(groundNormal.clone().multiplyScalar(targetFacing.dot(groundNormal))).normalize();
                const grip = 8.0 * dt;
                this.velocity.copy(this.velocity.clone().normalize().lerp(slopeDir, grip).multiplyScalar(speed));
            }

            if (this.velocity.length() > this.maxSpeed) this.velocity.setLength(this.maxSpeed);

            const vn = this.velocity.dot(groundNormal);
            if (vn < 0) this.velocity.sub(groundNormal.clone().multiplyScalar(vn));

        } else {
            // AIR PHYSICS
            this.grounded = false;
            this.airTime += dt;

            this.velocity.y -= this.gravity * dt;

            // PURE MOMENTUM
            this.velocity.multiplyScalar(1 - 0.05 * dt);

            const isFlipping = this.input.actions.forward || this.input.actions.backward;
            if (isFlipping) {
                if (this.input.actions.left || this.input.actions.right) {
                    let steerDir = new THREE.Vector3();
                    if (this.input.actions.left) steerDir.set(-1, 0, 0);
                    if (this.input.actions.right) steerDir.set(1, 0, 0);
                    steerDir.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.heading);

                    const airSteerSpeed = 15.0;
                    this.velocity.add(steerDir.multiplyScalar(airSteerSpeed * dt));
                }
            }
        }

        this.position.add(this.velocity.clone().multiplyScalar(dt));
    }
}
