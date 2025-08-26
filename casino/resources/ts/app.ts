/**
 * Casino Application Entry Point
 * 
 * This is the main TypeScript entry point for the casino frontend.
 * It imports the bootstrap configuration and sets up the global environment.
 */

import './bootstrap';

// Casino-specific initialization can go here
console.log('🎰 Casino Application Loaded with TypeScript!');

// Type-safe casino configuration
interface CasinoConfig {
    debug: boolean;
    currency: {
        gold: string;
        sweeps: string;
    };
    gameProviders: string[];
}

const casinoConfig: CasinoConfig = {
    debug: process.env.NODE_ENV === 'development',
    currency: {
        gold: 'Gold Coins',
        sweeps: 'Sweeps Coins'
    },
    gameProviders: ['PragmaticPlay', 'NetEnt', 'Microgaming', 'Evolution Gaming']
};

// Make casino config available globally with types
declare global {
    interface Window {
        casinoConfig: CasinoConfig;
    }
}

window.casinoConfig = casinoConfig;

export { CasinoConfig };
