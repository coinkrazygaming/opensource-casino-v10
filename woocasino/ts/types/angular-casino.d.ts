/**
 * Type definitions for AngularJS Casino Components
 */

import * as angular from 'angular';

// AngularJS Lazy Image module
declare module 'angular-lazy-img' {
    // Add specific types if needed
}

// Casino-specific AngularJS interfaces
export interface ICasinoScope extends angular.IScope {
    games?: Game[];
    user?: User;
    selectedGame?: Game;
    balance?: {
        goldCoins: number;
        sweepsCoins: number;
    };
    
    // Methods
    playGame?(gameId: number): void;
    loadGames?(): void;
    updateBalance?(): void;
}

export interface ICasinoController {
    scope: ICasinoScope;
    http: angular.IHttpService;
    location: angular.ILocationService;
    
    // Controller methods
    init(): void;
    handleGameSelection(gameId: number): void;
    processPayment(amount: number, currency: string): void;
}

// Game interface for AngularJS components
export interface Game {
    id: number;
    name: string;
    slug: string;
    provider: string;
    category: string;
    thumbnailUrl?: string;
    isActive: boolean;
    isFeatured: boolean;
    minBet: number;
    maxBet: number;
    rtp: number;
}

// User interface for AngularJS components
export interface User {
    id: number;
    username: string;
    goldCoins: number;
    sweepsCoins: number;
    isAuthenticated: boolean;
    vipLevel: number;
}

// Payment interface
export interface PaymentRequest {
    amount: number;
    currency: 'gold' | 'sweeps';
    method: string;
    metadata?: Record<string, any>;
}

export interface PaymentResponse {
    success: boolean;
    transactionId?: string;
    message?: string;
    redirectUrl?: string;
}

// AngularJS service interfaces
export interface ICasinoApiService {
    getGames(): angular.IPromise<Game[]>;
    getUser(): angular.IPromise<User>;
    processPayment(request: PaymentRequest): angular.IPromise<PaymentResponse>;
    updateBalance(): angular.IPromise<{goldCoins: number; sweepsCoins: number}>;
}

export interface ICasinoStorageService {
    setItem(key: string, value: any): void;
    getItem(key: string): any;
    removeItem(key: string): void;
    clear(): void;
}
