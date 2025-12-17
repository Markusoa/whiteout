import { MobileControls } from './MobileControls.js';

export class Input {
    constructor() {
        this.keys = {};
        this.actions = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            jump: false,
            spinLeft: false,
            spinRight: false,
            boost: false
        };

        this.mouse = { x: 0, y: 0 };
        this.mouseDelta = { x: 0, y: 0 };
        this.isLocked = false;

        this.init();
        this.mobileControls = new MobileControls(this);
    }

    init() {
        window.addEventListener('keydown', (e) => this.onKeyDown(e));
        window.addEventListener('keyup', (e) => this.onKeyUp(e));

        document.addEventListener('mousemove', (e) => this.onMouseMove(e));

        document.addEventListener('pointerlockchange', () => {
            this.isLocked = document.pointerLockElement === document.body;
        });
    }

    requestPointerLock() {
        if (!this.isLocked) {
            document.body.requestPointerLock();
        }
    }

    exitPointerLock() {
        if (this.isLocked && document.exitPointerLock) {
            document.exitPointerLock();
        }
    }

    onMouseMove(event) {
        if (this.isLocked) {
            this.mouseDelta.x = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
            this.mouseDelta.y = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
        }
    }

    resetDelta() {
        this.mouseDelta.x = 0;
        this.mouseDelta.y = 0;
    }

    onKeyDown(event) {
        this.keys[event.code] = true;
        this.updateActions();
    }

    onKeyUp(event) {
        this.keys[event.code] = false;
        this.updateActions();
    }

    updateActions() {
        this.actions.forward = this.keys['KeyW'] || this.keys['ArrowUp'];
        this.actions.backward = this.keys['KeyS'] || this.keys['ArrowDown'];
        this.actions.left = this.keys['KeyA'] || this.keys['ArrowLeft'];
        this.actions.right = this.keys['KeyD'] || this.keys['ArrowRight'];
        this.actions.jump = this.keys['Space'];
        this.actions.spinLeft = this.keys['KeyQ'];
        this.actions.spinRight = this.keys['KeyE'];
        this.actions.boost = this.keys['ShiftLeft'] || this.keys['ShiftRight'];
    }
}


