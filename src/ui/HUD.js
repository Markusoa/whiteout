export class HUD {
    constructor(input) {
        this.input = input;
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

        // BOTTOM RIGHT Container for Speed
        this.speedContainer = document.createElement('div');
        this.speedContainer.style.position = 'absolute';
        this.speedContainer.style.bottom = '20px';
        this.speedContainer.style.right = '20px';
        this.speedContainer.style.color = 'white';
        this.speedContainer.style.fontFamily = 'Arial, sans-serif';
        this.speedContainer.style.userSelect = 'none';
        this.speedContainer.style.pointerEvents = 'none';
        this.speedContainer.style.zIndex = '1000';
        document.body.appendChild(this.speedContainer);

        this.speedElement = document.createElement('div');
        this.speedElement.style.fontSize = '32px';
        this.speedElement.style.fontWeight = 'bold';
        this.speedElement.style.textAlign = 'right';
        this.speedElement.innerText = '0 km/h';
        this.speedContainer.appendChild(this.speedElement);

        this.scoreElement = document.createElement('div');
        this.scoreElement.style.fontSize = '24px';
        this.scoreElement.style.fontWeight = 'bold';
        this.scoreElement.style.color = '#ffcc00';
        this.scoreElement.innerText = 'SCORE: 0';
        this.container.appendChild(this.scoreElement);

        // Lives display
        this.livesElement = document.createElement('div');
        this.livesElement.style.fontSize = '28px';
        this.livesElement.style.fontWeight = 'bold';
        this.livesElement.style.color = '#ff4444';
        this.livesElement.style.marginTop = '10px';
        this.livesElement.innerText = '❤️ ❤️ ❤️';
        this.container.appendChild(this.livesElement);

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

        // CRASH MESSAGE
        this.crashMsg = document.createElement('div');
        this.crashMsg.style.position = 'absolute';
        this.crashMsg.style.top = '50%';
        this.crashMsg.style.left = '50%';
        this.crashMsg.style.transform = 'translate(-50%, -50%)';
        this.crashMsg.style.fontSize = '80px';
        this.crashMsg.style.fontWeight = 'bold';
        this.crashMsg.style.color = '#ff0000';
        this.crashMsg.style.textShadow = '0 0 20px black';
        this.crashMsg.style.display = 'none'; // Hidden by default
        this.crashMsg.innerText = "CRASHED!";
        document.body.appendChild(this.crashMsg);

        // GAME OVER MESSAGE
        this.gameOverMsg = document.createElement('div');
        this.gameOverMsg.style.position = 'absolute';
        this.gameOverMsg.style.top = '50%';
        this.gameOverMsg.style.left = '50%';
        this.gameOverMsg.style.transform = 'translate(-50%, -50%)';
        this.gameOverMsg.style.fontSize = '100px';
        this.gameOverMsg.style.fontWeight = 'bold';
        this.gameOverMsg.style.color = '#ff0000';
        this.gameOverMsg.style.textShadow = '0 0 30px black';
        this.gameOverMsg.style.display = 'none';
        this.gameOverMsg.innerText = "GAME OVER";
        document.body.appendChild(this.gameOverMsg);

        // WIN MESSAGE
        this.winMsg = document.createElement('div');
        this.winMsg.style.position = 'absolute';
        this.winMsg.style.top = '40%';
        this.winMsg.style.left = '50%';
        this.winMsg.style.transform = 'translate(-50%, -50%)';
        this.winMsg.style.fontSize = '100px';
        this.winMsg.style.fontWeight = 'bold';
        this.winMsg.style.color = '#00ff00';
        this.winMsg.style.textShadow = '0 0 30px black';
        this.winMsg.style.display = 'none';
        this.winMsg.innerText = "YOU WIN!";
        document.body.appendChild(this.winMsg);

        // RESTART BUTTON (for both game over and win)
        this.restartBtn = document.createElement('button');
        this.restartBtn.innerText = "RESTART";
        this.restartBtn.style.position = 'absolute';
        this.restartBtn.style.top = '60%';
        this.restartBtn.style.left = '50%';
        this.restartBtn.style.transform = 'translate(-50%, -50%)';
        this.restartBtn.style.fontSize = '40px';
        this.restartBtn.style.fontWeight = 'bold';
        this.restartBtn.style.padding = '20px 60px';
        this.restartBtn.style.backgroundColor = '#00ffcc';
        this.restartBtn.style.color = '#000';
        this.restartBtn.style.border = 'none';
        this.restartBtn.style.borderRadius = '10px';
        this.restartBtn.style.cursor = 'pointer';
        this.restartBtn.style.display = 'none';
        this.restartBtn.style.pointerEvents = 'auto';
        this.restartBtn.style.zIndex = '2000';
        this.restartBtn.addEventListener('click', () => {
            window.location.reload();
        });
        this.restartBtn.addEventListener('mouseenter', () => {
            this.restartBtn.style.backgroundColor = '#00ddaa';
        });
        this.restartBtn.addEventListener('mouseleave', () => {
            this.restartBtn.style.backgroundColor = '#00ffcc';
        });
        document.body.appendChild(this.restartBtn);

        // START SCREEN
        this.startScreen = document.createElement('div');
        this.startScreen.style.position = 'absolute';
        this.startScreen.style.top = '0';
        this.startScreen.style.left = '0';
        this.startScreen.style.width = '100%';
        this.startScreen.style.height = '100%';
        this.startScreen.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
        this.startScreen.style.display = 'flex';
        this.startScreen.style.flexDirection = 'column';
        this.startScreen.style.justifyContent = 'center';
        this.startScreen.style.alignItems = 'center';
        this.startScreen.style.zIndex = '3000';
        this.startScreen.style.pointerEvents = 'auto';

        // Title
        const title = document.createElement('div');
        title.innerText = 'SNOWBOARD SHRED';
        title.style.fontSize = '80px';
        title.style.fontWeight = 'bold';
        title.style.color = '#00ffcc';
        title.style.marginBottom = '40px';
        title.style.textShadow = '0 0 20px #00ffcc';
        this.startScreen.appendChild(title);

        // Instructions
        const instructions = document.createElement('div');
        instructions.innerHTML = `
            <div style="font-size: 24px; color: white; text-align: center; line-height: 1.8; max-width: 600px;">
                <p style="margin: 10px 0;"><strong style="color: #ffcc00;">OBJECTIVE:</strong></p>
                <p style="margin: 5px 0;">🏆 Reach <strong style="color: #00ff00;">6,000 points</strong> to WIN!</p>
                <p style="margin: 5px 0;">💀 Crash <strong style="color: #ff0000;">3 times</strong> and you LOSE!</p>
                <br>
                <p style="margin: 10px 0;"><strong style="color: #ffcc00;">CONTROLS:</strong></p>
                <p style="margin: 5px 0;">⌨️ <strong>WASD</strong> - Steer & Flip/Spin in air</p>
                <p style="margin: 5px 0;">⌨️ <strong>SPACE</strong> - Hold to charge jump</p>
                <p style="margin: 5px 0;">🎯 Land tricks to score points!</p>
            </div>
        `;
        this.startScreen.appendChild(instructions);

        // Play Button
        this.playBtn = document.createElement('button');
        this.playBtn.innerText = 'PLAY';
        this.playBtn.style.fontSize = '50px';
        this.playBtn.style.fontWeight = 'bold';
        this.playBtn.style.padding = '20px 80px';
        this.playBtn.style.marginTop = '40px';
        this.playBtn.style.backgroundColor = '#00ffcc';
        this.playBtn.style.color = '#000';
        this.playBtn.style.border = 'none';
        this.playBtn.style.borderRadius = '15px';
        this.playBtn.style.cursor = 'pointer';
        this.playBtn.style.boxShadow = '0 0 30px #00ffcc';
        this.playBtn.addEventListener('click', () => {
            this.startScreen.style.display = 'none';
            this.gameStarted = true;
            if (this.input) {
                this.input.requestPointerLock();
            }
        });
        this.playBtn.addEventListener('mouseenter', () => {
            this.playBtn.style.backgroundColor = '#00ddaa';
        });
        this.playBtn.addEventListener('mouseleave', () => {
            this.playBtn.style.backgroundColor = '#00ffcc';
        });
        // Theme Selection
        const themeContainer = document.createElement('div');
        themeContainer.style.display = 'flex';
        themeContainer.style.gap = '20px';
        themeContainer.style.marginBottom = '20px';

        const createThemeBtn = (text, theme) => {
            const btn = document.createElement('button');
            btn.innerText = text;
            btn.style.fontSize = '20px';
            btn.style.fontWeight = 'bold';
            btn.style.padding = '10px 30px';
            btn.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            btn.style.color = 'white';
            btn.style.border = '2px solid white';
            btn.style.borderRadius = '10px';
            btn.style.cursor = 'pointer';
            btn.addEventListener('click', () => {
                if (this.game) this.game.setTheme(theme);
                // Highlight selected
                Array.from(themeContainer.children).forEach(c => {
                    c.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                    c.style.color = 'white';
                });
                btn.style.backgroundColor = 'white';
                btn.style.color = 'black';
            });
            return btn;
        };

        const darkBtn = createThemeBtn('DARK MODE', 'dark');
        darkBtn.style.backgroundColor = 'white'; // Default selected
        darkBtn.style.color = 'black';

        const brightBtn = createThemeBtn('BRIGHT MODE', 'bright');

        themeContainer.appendChild(darkBtn);
        themeContainer.appendChild(brightBtn);
        this.startScreen.appendChild(themeContainer);

        this.startScreen.appendChild(this.playBtn);

        document.body.appendChild(this.startScreen);

        // PAUSE MENU
        this.pauseMenu = document.createElement('div');
        this.pauseMenu.style.position = 'absolute';
        this.pauseMenu.style.top = '0';
        this.pauseMenu.style.left = '0';
        this.pauseMenu.style.width = '100%';
        this.pauseMenu.style.height = '100%';
        this.pauseMenu.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        this.pauseMenu.style.display = 'none'; // Hidden by default
        this.pauseMenu.style.flexDirection = 'column';
        this.pauseMenu.style.justifyContent = 'center';
        this.pauseMenu.style.alignItems = 'center';
        this.pauseMenu.style.zIndex = '2500';
        this.pauseMenu.style.pointerEvents = 'auto';

        const pauseTitle = document.createElement('div');
        pauseTitle.innerText = 'PAUSED';
        pauseTitle.style.fontSize = '80px';
        pauseTitle.style.fontWeight = 'bold';
        pauseTitle.style.color = 'white';
        pauseTitle.style.marginBottom = '40px';
        pauseTitle.style.textShadow = '0 0 20px white';
        this.pauseMenu.appendChild(pauseTitle);

        // Resume Button
        this.resumeBtn = document.createElement('button');
        this.resumeBtn.innerText = 'RESUME';
        this.resumeBtn.style.fontSize = '40px';
        this.resumeBtn.style.fontWeight = 'bold';
        this.resumeBtn.style.padding = '15px 60px';
        this.resumeBtn.style.marginBottom = '20px';
        this.resumeBtn.style.backgroundColor = '#00ffcc';
        this.resumeBtn.style.color = '#000';
        this.resumeBtn.style.border = 'none';
        this.resumeBtn.style.borderRadius = '10px';
        this.resumeBtn.style.cursor = 'pointer';
        this.resumeBtn.addEventListener('click', () => {
            this.togglePause(false);
        });
        this.pauseMenu.appendChild(this.resumeBtn);

        // Restart Button (Pause Menu)
        this.pauseRestartBtn = document.createElement('button');
        this.pauseRestartBtn.innerText = 'RESTART';
        this.pauseRestartBtn.style.fontSize = '40px';
        this.pauseRestartBtn.style.fontWeight = 'bold';
        this.pauseRestartBtn.style.padding = '15px 60px';
        this.pauseRestartBtn.style.backgroundColor = '#ff4444';
        this.pauseRestartBtn.style.color = 'white';
        this.pauseRestartBtn.style.border = 'none';
        this.pauseRestartBtn.style.borderRadius = '10px';
        this.pauseRestartBtn.style.cursor = 'pointer';
        this.pauseRestartBtn.addEventListener('click', () => {
            window.location.reload();
        });
        this.pauseMenu.appendChild(this.pauseRestartBtn);

        document.body.appendChild(this.pauseMenu);

        this.gameStarted = false;
        this.isPaused = false;
    }

    togglePause(paused) {
        this.isPaused = paused;
        if (this.isPaused) {
            this.pauseMenu.style.display = 'flex';
            if (this.input) this.input.exitPointerLock();
        } else {
            this.pauseMenu.style.display = 'none';
            if (this.input) this.input.requestPointerLock();
        }
    }

    update(speed, score, charge = 0, crashed = false, lives = 3, dead = false, won = false) {
        this.speedElement.innerText = `${Math.floor(speed)} km/h`;
        this.scoreElement.innerText = `SCORE: ${Math.floor(score)}`;

        // Update lives display
        const hearts = '❤️ '.repeat(Math.max(0, lives));
        this.livesElement.innerText = hearts || '💀';

        const pct = Math.min(1.0, Math.max(0, charge)) * 100;
        this.chargeBar.style.width = `${pct}%`;

        if (pct >= 99) {
            this.chargeBar.style.backgroundColor = '#ff0055';
            this.chargeBar.style.boxShadow = '0 0 15px #ff0055';
        } else {
            this.chargeBar.style.backgroundColor = '#00ffcc';
            this.chargeBar.style.boxShadow = 'none';
        }

        // Handle game states
        if (won) {
            this.winMsg.style.display = 'block';
            this.restartBtn.style.display = 'block';
            this.crashMsg.style.display = 'none';
            this.gameOverMsg.style.display = 'none';
            if (this.input) {
                this.input.exitPointerLock();
            }
        } else if (dead) {
            this.gameOverMsg.style.display = 'block';
            this.restartBtn.style.display = 'block';
            this.crashMsg.style.display = 'none';
            this.winMsg.style.display = 'none';
            if (this.input) {
                this.input.exitPointerLock();
            }
        } else if (crashed) {
            this.crashMsg.style.display = 'block';
            this.gameOverMsg.style.display = 'none';
            this.winMsg.style.display = 'none';
            this.restartBtn.style.display = 'none';
        } else {
            this.crashMsg.style.display = 'none';
            this.gameOverMsg.style.display = 'none';
            this.winMsg.style.display = 'none';
            this.restartBtn.style.display = 'none';
        }
    }
}
