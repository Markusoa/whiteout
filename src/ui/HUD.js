export class HUD {
    constructor(input) {
        this.input = input;
        // TOP LEFT Container
        this.container = document.createElement('div');
        this.container.style.position = 'absolute';
        this.container.style.top = '2vmin';
        this.container.style.left = '2vmin';
        this.container.style.color = 'white';
        this.container.style.fontFamily = 'Arial, sans-serif';
        this.container.style.userSelect = 'none';
        this.container.style.pointerEvents = 'none';
        this.container.style.zIndex = '1000'; // Ensure visibility
        document.body.appendChild(this.container);

        // BOTTOM RIGHT Container for Speed
        this.speedContainer = document.createElement('div');
        this.speedContainer.style.position = 'absolute';
        this.speedContainer.style.bottom = '2vmin';
        this.speedContainer.style.right = '2vmin';
        this.speedContainer.style.color = 'white';
        this.speedContainer.style.fontFamily = 'Arial, sans-serif';
        this.speedContainer.style.userSelect = 'none';
        this.speedContainer.style.pointerEvents = 'none';
        this.speedContainer.style.zIndex = '1000';
        document.body.appendChild(this.speedContainer);

        this.speedElement = document.createElement('div');
        this.speedElement.style.fontSize = 'min(32px, 5vmin)';
        this.speedElement.style.fontWeight = 'bold';
        this.speedElement.style.textAlign = 'right';
        this.speedElement.innerText = '0 km/h';
        this.speedContainer.appendChild(this.speedElement);

        this.scoreElement = document.createElement('div');
        this.scoreElement.style.fontSize = 'min(24px, 4vmin)';
        this.scoreElement.style.fontWeight = 'bold';
        this.scoreElement.style.color = '#ffcc00';
        this.scoreElement.innerText = 'SCORE: 0';
        this.container.appendChild(this.scoreElement);

        // Lives display
        this.livesElement = document.createElement('div');
        this.livesElement.style.fontSize = 'min(28px, 4.5vmin)';
        this.livesElement.style.fontWeight = 'bold';
        this.livesElement.style.color = '#ff4444';
        this.livesElement.style.marginTop = '1vmin';
        this.livesElement.innerText = '❤️ ❤️ ❤️';
        this.container.appendChild(this.livesElement);

        // BOTTOM LEFT Container for Stamina
        this.staminaContainer = document.createElement('div');
        this.staminaContainer.style.position = 'absolute';
        this.staminaContainer.style.bottom = '2vmin';
        this.staminaContainer.style.left = '2vmin';
        this.staminaContainer.style.width = 'min(300px, 30vw)';
        this.staminaContainer.style.textAlign = 'left';
        this.staminaContainer.style.pointerEvents = 'none';
        this.staminaContainer.style.zIndex = '1000';
        document.body.appendChild(this.staminaContainer);

        // Stamina Label
        const staminaLabel = document.createElement('div');
        staminaLabel.innerText = "STAMINA";
        staminaLabel.style.color = 'white';
        staminaLabel.style.fontFamily = 'Arial, sans-serif';
        staminaLabel.style.fontSize = '14px';
        staminaLabel.style.fontWeight = 'bold';
        staminaLabel.style.marginBottom = '5px';
        staminaLabel.style.textShadow = '0 1px 2px black';
        this.staminaContainer.appendChild(staminaLabel);

        // Stamina Bar Background
        const staminaBarBg = document.createElement('div');
        staminaBarBg.style.width = '100%';
        staminaBarBg.style.height = '20px';
        staminaBarBg.style.backgroundColor = 'rgba(0,0,0,0.6)';
        staminaBarBg.style.borderRadius = '10px';
        staminaBarBg.style.overflow = 'hidden';
        staminaBarBg.style.border = '2px solid white';
        this.staminaContainer.appendChild(staminaBarBg);

        // Stamina Bar Fill
        this.staminaBar = document.createElement('div');
        this.staminaBar.style.width = '100%';
        this.staminaBar.style.height = '100%';
        this.staminaBar.style.backgroundColor = '#00ff00';
        this.staminaBar.style.transition = 'width 0.05s linear';
        staminaBarBg.appendChild(this.staminaBar);

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
        this.crashMsg.style.fontSize = 'min(80px, 12vmin)';
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
        this.gameOverMsg.style.fontSize = 'min(100px, 15vmin)';
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
        this.winMsg.style.fontSize = 'min(100px, 15vmin)';
        this.winMsg.style.fontWeight = 'bold';
        this.winMsg.style.color = '#00ff00';
        this.winMsg.style.textShadow = '0 0 30px black';
        this.winMsg.style.display = 'none';
        this.winMsg.innerText = "YOU WIN!";
        document.body.appendChild(this.winMsg);

        // GAME COMPLETION SCREEN (for level 2)
        this.gameCompleteScreen = document.createElement('div');
        this.gameCompleteScreen.style.position = 'absolute';
        this.gameCompleteScreen.style.top = '0';
        this.gameCompleteScreen.style.left = '0';
        this.gameCompleteScreen.style.width = '100%';
        this.gameCompleteScreen.style.height = '100%';
        this.gameCompleteScreen.style.backgroundColor = 'rgba(0, 0, 0, 0.95)';
        this.gameCompleteScreen.style.display = 'none';
        this.gameCompleteScreen.style.flexDirection = 'column';
        this.gameCompleteScreen.style.justifyContent = 'center';
        this.gameCompleteScreen.style.alignItems = 'center';
        this.gameCompleteScreen.style.zIndex = '3500';
        this.gameCompleteScreen.style.pointerEvents = 'auto';

        const completeTitle = document.createElement('div');
        completeTitle.innerText = '🎉 GAME COMPLETE! 🎉';
        completeTitle.style.fontSize = 'min(80px, 10vmin)';
        completeTitle.style.fontWeight = 'bold';
        completeTitle.style.color = '#00ff00';
        completeTitle.style.marginBottom = '5vmin';
        completeTitle.style.textShadow = '0 0 30px #00ff00';
        this.gameCompleteScreen.appendChild(completeTitle);

        this.statsContainer = document.createElement('div');
        this.statsContainer.style.fontSize = 'min(32px, 5vmin)';
        this.statsContainer.style.color = 'white';
        this.statsContainer.style.textAlign = 'center';
        this.statsContainer.style.lineHeight = '1.8';
        this.statsContainer.style.marginBottom = '5vmin';
        this.statsContainer.style.width = '90%';
        this.gameCompleteScreen.appendChild(this.statsContainer);

        // Restart button for game completion
        const completeRestartBtn = document.createElement('button');
        completeRestartBtn.innerText = 'PLAY AGAIN';
        completeRestartBtn.style.fontSize = 'min(40px, 5vmin)';
        completeRestartBtn.style.fontWeight = 'bold';
        completeRestartBtn.style.padding = 'min(20px, 3vmin) min(60px, 8vmin)';
        completeRestartBtn.style.backgroundColor = '#00ffcc';
        completeRestartBtn.style.color = '#000';
        completeRestartBtn.style.border = 'none';
        completeRestartBtn.style.borderRadius = '10px';
        completeRestartBtn.style.cursor = 'pointer';
        completeRestartBtn.addEventListener('click', () => {
            window.location.reload();
        });
        completeRestartBtn.addEventListener('mouseenter', () => {
            completeRestartBtn.style.backgroundColor = '#00ddaa';
        });
        completeRestartBtn.addEventListener('mouseleave', () => {
            completeRestartBtn.style.backgroundColor = '#00ffcc';
        });
        this.gameCompleteScreen.appendChild(completeRestartBtn);

        document.body.appendChild(this.gameCompleteScreen);

        // RESTART BUTTON (for both game over and win)
        this.restartBtn = document.createElement('button');
        this.restartBtn.innerText = "RESTART";
        this.restartBtn.style.position = 'absolute';
        this.restartBtn.style.top = '60%';
        this.restartBtn.style.left = '50%';
        this.restartBtn.style.transform = 'translate(-50%, -50%)';
        this.restartBtn.style.fontSize = 'min(40px, 5vmin)';
        this.restartBtn.style.fontWeight = 'bold';
        this.restartBtn.style.padding = 'min(20px, 3vmin) min(60px, 8vmin)';
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

        // NEXT LEVEL BUTTON (shown on win screen)
        this.nextLevelBtn = document.createElement('button');
        this.nextLevelBtn.innerText = "NEXT LEVEL";
        this.nextLevelBtn.style.position = 'absolute';
        this.nextLevelBtn.style.top = '60%';
        this.nextLevelBtn.style.left = '35%';
        this.nextLevelBtn.style.transform = 'translate(-50%, -50%)';
        this.nextLevelBtn.style.fontSize = 'min(40px, 5vmin)';
        this.nextLevelBtn.style.fontWeight = 'bold';
        this.nextLevelBtn.style.padding = 'min(20px, 3vmin) min(60px, 8vmin)';
        this.nextLevelBtn.style.backgroundColor = '#ffcc00';
        this.nextLevelBtn.style.color = '#000';
        this.nextLevelBtn.style.border = 'none';
        this.nextLevelBtn.style.borderRadius = '10px';
        this.nextLevelBtn.style.cursor = 'pointer';
        this.nextLevelBtn.style.display = 'none';
        this.nextLevelBtn.style.pointerEvents = 'auto';
        this.nextLevelBtn.style.zIndex = '2000';
        this.nextLevelBtn.addEventListener('click', () => {
            if (this.game && this.game.levelManager) {
                const nextLevel = this.game.levelManager.currentLevel + 1;
                this.game.loadLevel(nextLevel);
                this.nextLevelBtn.style.display = 'none';
                this.restartBtn.style.display = 'none';
                this.winMsg.style.display = 'none';
                this.gameStarted = true;
                if (this.input) {
                    this.input.requestPointerLock();
                }
            }
        });
        this.nextLevelBtn.addEventListener('mouseenter', () => {
            this.nextLevelBtn.style.backgroundColor = '#ffaa00';
        });
        this.nextLevelBtn.addEventListener('mouseleave', () => {
            this.nextLevelBtn.style.backgroundColor = '#ffcc00';
        });
        // Adjust restart button position when next level is shown
        this.restartBtn.style.left = '65%';
        document.body.appendChild(this.nextLevelBtn);

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
        title.style.fontSize = 'min(80px, 10vmin)';
        title.style.fontWeight = 'bold';
        title.style.color = '#00ffcc';
        title.style.marginBottom = '5vmin';
        title.style.textShadow = '0 0 20px #00ffcc';
        title.style.textAlign = 'center';
        this.startScreen.appendChild(title);

        // Instructions
        const instructions = document.createElement('div');
        instructions.innerHTML = `
            <div style="font-size: min(24px, 4vmin); color: white; text-align: center; line-height: 1.8; max-width: 90%;">
                <p style="margin: 1vmin 0;"><strong style="color: #ffcc00;">OBJECTIVE:</strong></p>
                <p style="margin: 0.5vmin 0;">🏆 Reach <strong style="color: #00ff00;">6,000 points</strong> to WIN!</p>
                <p style="margin: 0.5vmin 0;">💀 Crash <strong style="color: #ff0000;">3 times</strong> and you LOSE!</p>
                <br>
                <p style="margin: 1vmin 0;"><strong style="color: #ffcc00;">CONTROLS:</strong></p>
                <p style="margin: 0.5vmin 0;">⌨️ <strong>WASD</strong> - Steer & Flip/Spin in air</p>
                <p style="margin: 0.5vmin 0;">⌨️ <strong>SPACE</strong> - Hold to charge jump</p>
                <p style="margin: 0.5vmin 0;">🎯 Land tricks to score points!</p>
            </div>
        `;
        this.startScreen.appendChild(instructions);

        // Play Button
        this.playBtn = document.createElement('button');
        this.playBtn.innerText = 'PLAY';
        this.playBtn.style.fontSize = 'min(50px, 8vmin)';
        this.playBtn.style.fontWeight = 'bold';
        this.playBtn.style.padding = 'min(20px, 3vmin) min(80px, 10vmin)';
        this.playBtn.style.marginTop = '5vmin';
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
                if (this.game) {
                    this.game.setTheme(theme);
                    // Update pause menu theme buttons if they exist
                    if (this.pauseThemeButtons) {
                        this.pauseThemeButtons.night.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                        this.pauseThemeButtons.night.style.color = 'white';
                        this.pauseThemeButtons.day.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                        this.pauseThemeButtons.day.style.color = 'white';
                        if (theme === 'Day') {
                            this.pauseThemeButtons.day.style.backgroundColor = 'white';
                            this.pauseThemeButtons.day.style.color = 'black';
                        } else {
                            this.pauseThemeButtons.night.style.backgroundColor = 'white';
                            this.pauseThemeButtons.night.style.color = 'black';
                        }
                    }
                }
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

        const darkBtn = createThemeBtn('Night', 'Night');
        darkBtn.style.backgroundColor = 'white'; // Default selected
        darkBtn.style.color = 'black';

        const brightBtn = createThemeBtn('Day', 'Day');

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
        pauseTitle.style.fontSize = 'min(80px, 12vmin)';
        pauseTitle.style.fontWeight = 'bold';
        pauseTitle.style.color = 'white';
        pauseTitle.style.marginBottom = '5vmin';
        pauseTitle.style.textShadow = '0 0 20px white';
        this.pauseMenu.appendChild(pauseTitle);

        // Resume Button
        this.resumeBtn = document.createElement('button');
        this.resumeBtn.innerText = 'RESUME';
        this.resumeBtn.style.fontSize = 'min(40px, 6vmin)';
        this.resumeBtn.style.fontWeight = 'bold';
        this.resumeBtn.style.padding = 'min(15px, 2.5vmin) min(60px, 8vmin)';
        this.resumeBtn.style.marginBottom = '3vmin';
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
        this.pauseRestartBtn.style.fontSize = 'min(40px, 6vmin)';
        this.pauseRestartBtn.style.fontWeight = 'bold';
        this.pauseRestartBtn.style.padding = 'min(15px, 2.5vmin) min(60px, 8vmin)';
        this.pauseRestartBtn.style.backgroundColor = '#ff4444';
        this.pauseRestartBtn.style.color = 'white';
        this.pauseRestartBtn.style.border = 'none';
        this.pauseRestartBtn.style.borderRadius = '10px';
        this.pauseRestartBtn.style.cursor = 'pointer';
        this.pauseRestartBtn.addEventListener('click', () => {
            window.location.reload();
        });
        this.pauseMenu.appendChild(this.pauseRestartBtn);

        // Theme Selection in Pause Menu
        const pauseThemeContainer = document.createElement('div');
        pauseThemeContainer.style.display = 'flex';
        pauseThemeContainer.style.gap = '20px';
        pauseThemeContainer.style.marginTop = '20px';
        pauseThemeContainer.style.marginBottom = '20px';

        const pauseThemeLabel = document.createElement('div');
        pauseThemeLabel.innerText = 'Theme:';
        pauseThemeLabel.style.fontSize = '24px';
        pauseThemeLabel.style.color = 'white';
        pauseThemeLabel.style.marginRight = '10px';
        pauseThemeLabel.style.alignSelf = 'center';
        pauseThemeContainer.appendChild(pauseThemeLabel);

        const createPauseThemeBtn = (text, theme) => {
            const btn = document.createElement('button');
            btn.innerText = text;
            btn.style.fontSize = 'min(24px, 4vmin)';
            btn.style.fontWeight = 'bold';
            btn.style.padding = 'min(10px, 1.5vmin) min(30px, 4vmin)';
            btn.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            btn.style.color = 'white';
            btn.style.border = '2px solid white';
            btn.style.borderRadius = '10px';
            btn.style.cursor = 'pointer';
            btn.addEventListener('click', () => {
                if (this.game) {
                    this.game.setTheme(theme);
                    // Update button highlights in pause menu
                    Array.from(pauseThemeContainer.children).forEach(c => {
                        if (c.tagName === 'BUTTON') {
                            c.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                            c.style.color = 'white';
                        }
                    });
                    btn.style.backgroundColor = 'white';
                    btn.style.color = 'black';
                    // Also update main menu buttons if they exist
                    const startThemeContainer = this.startScreen.querySelector('div[style*="gap: 20px"]');
                    if (startThemeContainer) {
                        Array.from(startThemeContainer.children).forEach(c => {
                            if (c.tagName === 'BUTTON') {
                                c.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                                c.style.color = 'white';
                            }
                        });
                        if (theme === 'Day') {
                            Array.from(startThemeContainer.children).find(c => c.innerText === 'Day').style.backgroundColor = 'white';
                            Array.from(startThemeContainer.children).find(c => c.innerText === 'Day').style.color = 'black';
                        } else {
                            Array.from(startThemeContainer.children).find(c => c.innerText === 'Night').style.backgroundColor = 'white';
                            Array.from(startThemeContainer.children).find(c => c.innerText === 'Night').style.color = 'black';
                        }
                    }
                }
            });
            return btn;
        };

        const pauseDarkBtn = createPauseThemeBtn('Night', 'Night');
        const pauseDayBtn = createPauseThemeBtn('Day', 'Day');

        // Set initial highlight based on current theme
        if (this.game && this.game.currentTheme === 'Day') {
            pauseDayBtn.style.backgroundColor = 'white';
            pauseDayBtn.style.color = 'black';
        } else {
            pauseDarkBtn.style.backgroundColor = 'white';
            pauseDarkBtn.style.color = 'black';
        }

        pauseThemeContainer.appendChild(pauseDarkBtn);
        pauseThemeContainer.appendChild(pauseDayBtn);
        this.pauseMenu.appendChild(pauseThemeContainer);

        // Store theme buttons for updating highlights
        this.pauseThemeButtons = { night: pauseDarkBtn, day: pauseDayBtn };

        document.body.appendChild(this.pauseMenu);

        this.gameStarted = false;
        this.isPaused = false;
        this.winCondition = 6000; // Default win condition
    }

    updateWinCondition(points) {
        this.winCondition = points;
    }

    togglePause(paused) {
        this.isPaused = paused;
        if (this.isPaused) {
            this.pauseMenu.style.display = 'flex';
            // Update theme button highlights to reflect current theme
            if (this.pauseThemeButtons && this.game) {
                if (this.game.currentTheme === 'Day') {
                    this.pauseThemeButtons.day.style.backgroundColor = 'white';
                    this.pauseThemeButtons.day.style.color = 'black';
                    this.pauseThemeButtons.night.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                    this.pauseThemeButtons.night.style.color = 'white';
                } else {
                    this.pauseThemeButtons.night.style.backgroundColor = 'white';
                    this.pauseThemeButtons.night.style.color = 'black';
                    this.pauseThemeButtons.day.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                    this.pauseThemeButtons.day.style.color = 'white';
                }
            }
            if (this.input) this.input.exitPointerLock();
        } else {
            this.pauseMenu.style.display = 'none';
            if (this.input) this.input.requestPointerLock();
        }
    }

    update(speed, score, charge = 0, crashed = false, lives = 3, dead = false, won = false, level = 1, stamina = 1.0) {
        this.speedElement.innerText = `${Math.floor(speed)} km/h`;
        this.scoreElement.innerText = `SCORE: ${Math.floor(score)}`;

        // Update lives display
        const hearts = '❤️ '.repeat(Math.max(0, lives));
        this.livesElement.innerText = hearts || '💀';

        // Update jump charge bar
        const pct = Math.min(1.0, Math.max(0, charge)) * 100;
        this.chargeBar.style.width = `${pct}%`;

        if (pct >= 99) {
            this.chargeBar.style.backgroundColor = '#ff0055';
            this.chargeBar.style.boxShadow = '0 0 15px #ff0055';
        } else {
            this.chargeBar.style.backgroundColor = '#00ffcc';
            this.chargeBar.style.boxShadow = 'none';
        }

        // Update stamina bar
        const staminaPct = Math.min(1.0, Math.max(0, stamina)) * 100;
        this.staminaBar.style.width = `${staminaPct}%`;

        // Change color based on stamina level
        if (staminaPct > 50) {
            this.staminaBar.style.backgroundColor = '#00ff00'; // Green
        } else if (staminaPct > 25) {
            this.staminaBar.style.backgroundColor = '#ffaa00'; // Orange
        } else {
            this.staminaBar.style.backgroundColor = '#ff0000'; // Red
        }

        // Handle game states
        if (won) {
            // Check if level 2 is complete (show game completion screen)
            if (level === 2 && this.game && this.game.player) {
                const player = this.game.player;
                const maxSpeed = Math.floor(player.maxSpeed || 0);
                const trickCount = player.trickCount || 0;
                const totalTrickPoints = player.totalTrickPoints || 0;
                const avgPointsPerTrick = trickCount > 0 ? Math.floor(totalTrickPoints / trickCount) : 0;

                this.statsContainer.innerHTML = `
                    <div style="margin-bottom: 20px;">
                        <div style="font-size: 48px; color: #ffcc00; margin-bottom: 30px; font-weight: bold;">FINAL STATISTICS</div>
                        <div style="color: #00ffcc; margin: 15px 0;">🏆 Max Speed: <strong style="color: white;">${maxSpeed} km/h</strong></div>
                        <div style="color: #00ffcc; margin: 15px 0;">🎯 Tricks Landed: <strong style="color: white;">${trickCount}</strong></div>
                        <div style="color: #00ffcc; margin: 15px 0;">💯 Total Trick Points: <strong style="color: white;">${totalTrickPoints}</strong></div>
                        <div style="color: #00ffcc; margin: 15px 0;">⭐ Average Points per Trick: <strong style="color: white;">${avgPointsPerTrick}</strong></div>
                        <div style="color: #ffcc00; margin: 15px 0; margin-top: 30px;">🎊 Final Score: <strong style="color: #00ff00; font-size: 40px;">${Math.floor(score)}</strong></div>
                    </div>
                `;

                this.gameCompleteScreen.style.display = 'flex';
                this.winMsg.style.display = 'none';
                this.restartBtn.style.display = 'none';
                this.nextLevelBtn.style.display = 'none';
            } else {
                // Level 1 win - show normal win screen
                this.gameCompleteScreen.style.display = 'none';
                this.winMsg.style.display = 'block';
                this.restartBtn.style.display = 'block';
                this.nextLevelBtn.style.display = 'block'; // Show next level button
            }
            this.crashMsg.style.display = 'none';
            this.gameOverMsg.style.display = 'none';
            if (this.input) {
                this.input.exitPointerLock();
            }
        } else if (dead) {
            this.gameCompleteScreen.style.display = 'none';
            this.gameOverMsg.style.display = 'block';
            this.restartBtn.style.display = 'block';
            this.crashMsg.style.display = 'none';
            this.winMsg.style.display = 'none';
            if (this.input) {
                this.input.exitPointerLock();
            }
        } else if (crashed) {
            this.gameCompleteScreen.style.display = 'none';
            this.crashMsg.style.display = 'block';
            this.gameOverMsg.style.display = 'none';
            this.winMsg.style.display = 'none';
            this.restartBtn.style.display = 'none';
        } else {
            this.gameCompleteScreen.style.display = 'none';
            this.crashMsg.style.display = 'none';
            this.gameOverMsg.style.display = 'none';
            this.winMsg.style.display = 'none';
            this.restartBtn.style.display = 'none';
        }
    }
    showTrickText(text) {
        const trickEl = document.createElement('div');
        trickEl.innerText = text;
        trickEl.style.position = 'absolute';
        trickEl.style.top = '40%';
        trickEl.style.left = '50%';
        trickEl.style.transform = 'translate(-50%, -50%)';
        trickEl.style.color = '#ffcc00';
        trickEl.style.fontFamily = 'Arial, sans-serif';
        trickEl.style.fontSize = 'min(32px, 5vmin)';
        trickEl.style.fontWeight = 'bold';
        trickEl.style.textShadow = '2px 2px 4px #000000';
        trickEl.style.pointerEvents = 'none';
        trickEl.style.opacity = '0';
        trickEl.style.transition = 'opacity 0.2s, transform 0.5s';

        document.body.appendChild(trickEl); // Append to body to ensure it's on top

        // Animate
        requestAnimationFrame(() => {
            trickEl.style.opacity = '1';
            trickEl.style.transform = 'translate(-50%, -100%) scale(1.2)';
        });

        // Remove after delay
        setTimeout(() => {
            trickEl.style.opacity = '0';
            setTimeout(() => {
                trickEl.remove();
            }, 500);
        }, 1500);
    }
}
