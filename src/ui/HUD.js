export class HUD {
    constructor() {
        // TOP LEFT Container
        this.container = document.createElement('div');
        this.container.style.position = 'absolute';
        this.container.style.top = '20px';
        this.container.style.left = '20px';
        this.container.style.color = 'white';
        this.container.style.fontFamily = 'Arial, sans-serif';
        this.container.style.userSelect = 'none';
        this.container.style.pointerEvents = 'none';
        this.container.style.zIndex = '1000'; // Ensure visibility
        document.body.appendChild(this.container);

        this.speedElement = document.createElement('div');
        this.speedElement.style.fontSize = '24px';
        this.speedElement.style.fontWeight = 'bold';
        this.speedElement.innerText = '0 km/h';
        this.container.appendChild(this.speedElement);

        this.scoreElement = document.createElement('div');
        this.scoreElement.style.fontSize = '24px';
        this.scoreElement.style.fontWeight = 'bold';
        this.scoreElement.style.color = '#ffcc00';
        this.scoreElement.innerText = 'SCORE: 0';
        this.container.appendChild(this.scoreElement);

        // BOTTOM CENTER Container for Jump Charge
        this.bottomContainer = document.createElement('div');
        this.bottomContainer.style.position = 'absolute';
        this.bottomContainer.style.bottom = '40px';
        this.bottomContainer.style.left = '50%';
        this.bottomContainer.style.transform = 'translateX(-50%)';
        this.bottomContainer.style.width = '300px';
        this.bottomContainer.style.textAlign = 'center';
        this.bottomContainer.style.pointerEvents = 'none';
        this.bottomContainer.style.zIndex = '1000'; // Ensure visibility
        document.body.appendChild(this.bottomContainer);

        // Label
        const label = document.createElement('div');
        label.innerText = "JUMP POWER";
        label.style.color = 'white';
        label.style.fontFamily = 'Arial, sans-serif';
        label.style.fontSize = '14px';
        label.style.fontWeight = 'bold';
        label.style.marginBottom = '5px';
        label.style.textShadow = '0 1px 2px black';
        this.bottomContainer.appendChild(label);

        // Bar Background
        const barBg = document.createElement('div');
        barBg.style.width = '100%';
        barBg.style.height = '20px';
        barBg.style.backgroundColor = 'rgba(0,0,0,0.6)';
        barBg.style.borderRadius = '10px';
        barBg.style.overflow = 'hidden';
        barBg.style.border = '2px solid white';
        this.bottomContainer.appendChild(barBg);

        // Bar Fill
        this.chargeBar = document.createElement('div');
        this.chargeBar.style.width = '0%';
        this.chargeBar.style.height = '100%';
        this.chargeBar.style.backgroundColor = '#00ffcc';
        this.chargeBar.style.transition = 'width 0.05s linear';
        barBg.appendChild(this.chargeBar);
    }

    update(speed, score, charge = 0) {
        this.speedElement.innerText = `${Math.floor(speed)} km/h`;
        this.scoreElement.innerText = `SCORE: ${Math.floor(score)}`;

        const pct = Math.min(1.0, Math.max(0, charge)) * 100;
        this.chargeBar.style.width = `${pct}%`;

        if (pct >= 99) {
            this.chargeBar.style.backgroundColor = '#ff0055';
            this.chargeBar.style.boxShadow = '0 0 15px #ff0055';
        } else {
            this.chargeBar.style.backgroundColor = '#00ffcc';
            this.chargeBar.style.boxShadow = 'none';
        }
    }
}
