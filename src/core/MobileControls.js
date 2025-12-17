export class MobileControls {
    constructor(input) {
        this.input = input;
        this.touchIdLeft = null;
        this.touchIdRight = null;
        this.touchStartLeft = { x: 0, y: 0 }; // Joystick center
        this.touchStartRight = { x: 0, y: 0 }; // Camera look start

        // Joystick Visuals
        this.leftStick = null;
        this.leftStickKnob = null;

        // Settings
        this.joystickRadius = 50; // Max distance for knob
        this.joystickThreshold = 10; // Deadzone
        this.lookSensitivity = 2.0;

        console.log("MobileControls constructed");
        if (this.isMobile()) {
            this.init();
        }
    }

    isMobile() {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('mobile') === 'true') return true;

        return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || (window.innerWidth <= 1024 && 'ontouchstart' in window);
    }

    init() {
        console.log("Mobile device detected. Initializing touch controls...");

        // Prevent default touch actions (scrolling/zoom)
        document.body.style.touchAction = 'none';

        // --- UI ELEMENTS ---

        // Left Joystick Container
        this.leftStick = document.createElement('div');
        this.leftStick.style.position = 'absolute';
        this.leftStick.style.bottom = '50px';
        this.leftStick.style.left = '50px';
        this.leftStick.style.width = '120px';
        this.leftStick.style.height = '120px';
        this.leftStick.style.borderRadius = '50%';
        this.leftStick.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        this.leftStick.style.border = '2px solid rgba(255, 255, 255, 0.3)';
        this.leftStick.style.zIndex = '2000';
        this.leftStick.style.pointerEvents = 'none'; // Touch handled by screen overlay or global listener
        this.leftStick.style.display = 'none'; // Show on touch
        document.body.appendChild(this.leftStick);

        // Left Joystick Knob
        this.leftStickKnob = document.createElement('div');
        this.leftStickKnob.style.position = 'absolute';
        this.leftStickKnob.style.top = '50%';
        this.leftStickKnob.style.left = '50%';
        this.leftStickKnob.style.width = '50px';
        this.leftStickKnob.style.height = '50px';
        this.leftStickKnob.style.borderRadius = '50%';
        this.leftStickKnob.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
        this.leftStickKnob.style.transform = 'translate(-50%, -50%)';
        this.leftStick.appendChild(this.leftStickKnob);

        // Jump Button
        this.jumpBtn = document.createElement('div');
        this.jumpBtn.innerText = 'JUMP';
        this.jumpBtn.style.position = 'absolute';
        this.jumpBtn.style.bottom = '10vh';
        this.jumpBtn.style.right = '5vw';
        this.jumpBtn.style.width = 'min(100px, 20vw)';
        this.jumpBtn.style.height = 'min(100px, 20vw)';
        this.jumpBtn.style.borderRadius = '50%';
        this.jumpBtn.style.backgroundColor = 'rgba(0, 255, 204, 0.5)'; // More visible
        this.jumpBtn.style.border = '3px solid rgba(0, 255, 204, 0.8)';
        this.jumpBtn.style.color = 'white';
        this.jumpBtn.style.display = 'flex';
        this.jumpBtn.style.justifyContent = 'center';
        this.jumpBtn.style.alignItems = 'center';
        this.jumpBtn.style.fontWeight = 'bold';
        this.jumpBtn.style.fontSize = 'min(18px, 4vw)';
        this.jumpBtn.style.zIndex = '9999'; // Max z-index
        this.jumpBtn.style.userSelect = 'none';
        this.jumpBtn.style.touchAction = 'none'; // Prevent browser handling
        document.body.appendChild(this.jumpBtn);

        // Event Listeners
        document.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: false });
        document.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: false });
        document.addEventListener('touchend', (e) => this.onTouchEnd(e), { passive: false });
    }

    onTouchStart(e) {
        // Don't prevent default everywhere, might break UI clicks if not careful.
        // But for game controls area, we usually want to.

        for (let i = 0; i < e.changedTouches.length; i++) {
            const touch = e.changedTouches[i];
            const x = touch.clientX;
            const y = touch.clientY;

            // Check Jump Button
            const jumpRect = this.jumpBtn.getBoundingClientRect();
            if (x >= jumpRect.left && x <= jumpRect.right &&
                y >= jumpRect.top && y <= jumpRect.bottom) {
                this.input.keys['Space'] = true; // Simulate Space
                this.input.updateActions();
                this.jumpBtn.style.backgroundColor = 'rgba(0, 255, 204, 0.6)';
                continue;
            }

            // Left side of screen -> Joystick
            if (x < window.innerWidth / 2 && this.touchIdLeft === null) {
                this.touchIdLeft = touch.identifier;
                this.touchStartLeft = { x: x, y: y };

                // Position Joystick Visual
                this.leftStick.style.left = (x - 60) + 'px'; // Center it
                this.leftStick.style.top = (y - 60) + 'px'; // Center it
                this.leftStick.style.bottom = 'auto'; // Reset bottom
                this.leftStick.style.display = 'block';
                this.leftStickKnob.style.transform = 'translate(-50%, -50%)'; // Reset knob
                continue;
            }

            // Right side of screen -> Camera Look
            if (x > window.innerWidth / 2 && this.touchIdRight === null &&
                !(x >= jumpRect.left && x <= jumpRect.right && y >= jumpRect.top && y <= jumpRect.bottom)) {
                this.touchIdRight = touch.identifier;
                this.touchStartRight = { x: x, y: y }; // Just used for delta tracking
                continue;
            }
        }
    }

    onTouchMove(e) {
        e.preventDefault(); // Prevent scrolling

        for (let i = 0; i < e.changedTouches.length; i++) {
            const touch = e.changedTouches[i];

            if (touch.identifier === this.touchIdLeft) {
                // Joystick Move
                const dx = touch.clientX - this.touchStartLeft.x;
                const dy = touch.clientY - this.touchStartLeft.y;

                const distance = Math.sqrt(dx * dx + dy * dy);
                const angle = Math.atan2(dy, dx);

                const clampedDist = Math.min(distance, this.joystickRadius);
                const knobX = Math.cos(angle) * clampedDist;
                const knobY = Math.sin(angle) * clampedDist;

                // Visual Update
                this.leftStickKnob.style.transform = `translate(calc(-50% + ${knobX}px), calc(-50% + ${knobY}px))`;

                // Input Update (Normalized -1 to 1)
                const normX = knobX / this.joystickRadius;
                const normY = knobY / this.joystickRadius;

                // Deadzone
                if (distance > this.joystickThreshold) {
                    // Update Input class virtual axes if added there, or just map to keys
                    // Mapping to keys is trickier for analog feel, but Input class likely expects booleans for keys.
                    // Ideally Input class should handle analog values.
                    // For now, let's map simple directions

                    this.input.keys['KeyW'] = normY < -0.3;
                    this.input.keys['KeyS'] = normY > 0.3;
                    this.input.keys['KeyA'] = normX < -0.3;
                    this.input.keys['KeyD'] = normX > 0.3;
                    this.input.updateActions();
                } else {
                    this.input.keys['KeyW'] = false;
                    this.input.keys['KeyS'] = false;
                    this.input.keys['KeyA'] = false;
                    this.input.keys['KeyD'] = false;
                    this.input.updateActions();
                }
            }

            if (touch.identifier === this.touchIdRight) {
                // Camera Look directly to update mouse helper
                // Calculate delta from PREVIOUS event would be better but simple start:
                // We barely track previous position in touchmove easily without state.
                // Actually, let's just use movementX if available or diff from last valid frame.
                // Standard shim:

                // We need to store previous position for right touch to calculate delta
                // Let's add a property: this.lastTouchRight = {x, y}
            }
        }
    }

    onTouchEnd(e) {
        for (let i = 0; i < e.changedTouches.length; i++) {
            const touch = e.changedTouches[i];

            if (touch.identifier === this.touchIdLeft) {
                this.touchIdLeft = null;
                this.leftStick.style.display = 'none';

                // Reset Movement
                this.input.keys['KeyW'] = false;
                this.input.keys['KeyS'] = false;
                this.input.keys['KeyA'] = false;
                this.input.keys['KeyD'] = false;
                this.input.updateActions();
            }

            if (touch.identifier === this.touchIdRight) {
                this.touchIdRight = null;
            }

            // Check Jump Release logic if needed (handled by bounds check on start/end?)
            // Usually valid to check release anywhere for generic input, or specifically on button.
            // Simple approach: reset jump if we think it was the jump finger?
            // Actually, for jump button we should probably reset it if ANY finger lifts?
            // Or better: reset jump key always on end if not held?
            // Let's rely on button bounds or just clear it.
            // Simplified: Just clear Jump on any end for now? No, that kills hold.
            // Let's re-verify bounding box on end.
            const jumpRect = this.jumpBtn.getBoundingClientRect();
            const x = touch.clientX;
            const y = touch.clientY;

            // If this touch started on jump, release it
            // (We don't track which ID pressed jump, assuming simple case)
            // Let's just reset jump state if this touch was likely the jumper.
            if (x >= jumpRect.left && x <= jumpRect.right &&
                y >= jumpRect.top && y <= jumpRect.bottom) {
                this.input.keys['Space'] = false;
                this.input.updateActions();
                this.jumpBtn.style.backgroundColor = 'rgba(0, 255, 204, 0.3)';
            }
            // Fallback: If no touches left, clear jump
            if (e.touches.length === 0) {
                this.input.keys['Space'] = false;
                this.input.updateActions();
                this.jumpBtn.style.backgroundColor = 'rgba(0, 255, 204, 0.3)';
            }
        }
    }

    update() {
        // Because touchmove doesn't give clean deltas like mousemovement,
        // we might need to manually calc delta and feed it to input system every frame if holding.
        // Or just rely on touchMove event stream.
        // For 'Look', Input.js resets mouseDelta every frame usually? 
        // Input.js resets delta via 'resetDelta' called by CameraController possibly?
        // We should inject values into Input.mouseDelta
    }
}
