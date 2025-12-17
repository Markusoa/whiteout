import * as THREE from 'three';

export class LevelManager {
    constructor() {
        this.currentLevel = 1;
        this.levels = {
            1: {
                terrainType: 'model', // Uses mountain.glb
                skyColor: 0x1a1a2e,
                fogColor: 0x1a1a2e,
                fogDensity: 0.0015,
                ambientIntensity: 0.2,
                directionalIntensity: 0.3,
                winCondition: 6000,
                spawnPosition: { x: 0, y: 1, z: 40 },
                spawnHeightOffset: 0 // Lower spawn by subtracting from computed height
            },
            2: {
                terrainType: 'level2', // Uses Level2_Mountain.glb
                skyColor: 0x1a1a2e, // Match level 1 night sky
                fogColor: 0x1a1a2e,
                fogDensity: 0.0015,
                ambientIntensity: 0.2,
                directionalIntensity: 0.3,
                winCondition: 8000,
                spawnPosition: { x: 0, y: 500, z: 200 },
                spawnHeightOffset: 500 // Higher spawn by adding to computed height
            }
        };
    }

    getCurrentLevelConfig() {
        return this.levels[this.currentLevel];
    }

    nextLevel() {
        this.currentLevel++;
        if (!this.levels[this.currentLevel]) {
            // Loop back to level 1 if no more levels
            this.currentLevel = 1;
        }
        return this.getCurrentLevelConfig();
    }

    reset() {
        this.currentLevel = 1;
    }

    getWinCondition() {
        return this.levels[this.currentLevel].winCondition;
    }
}
