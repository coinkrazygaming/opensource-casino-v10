/**
 * Casino-specific type definitions
 */

// Game types
export interface Game {
    id: number;
    name: string;
    slug: string;
    provider: string;
    category: string;
    gameType: 'slot' | 'table' | 'live' | 'instant';
    thumbnailUrl?: string;
    minBet: number;
    maxBet: number;
    rtp: number;
    volatility: 'low' | 'medium' | 'high';
    hasJackpot: boolean;
    jackpotAmount?: number;
    isActive: boolean;
    isFeatured: boolean;
    isNew: boolean;
    isPopular: boolean;
}

// User types
export interface User {
    id: number;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    isActive: boolean;
    isVerified: boolean;
    isVip: boolean;
    vipTier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';
    level: number;
    experiencePoints: number;
    goldCoins: number;
    sweepsCoins: number;
    kycStatus: 'pending' | 'approved' | 'rejected';
}

// Transaction types
export interface Transaction {
    id: number;
    userId: number;
    type: 'deposit' | 'withdrawal' | 'bet' | 'win' | 'bonus';
    amount: number;
    currency: 'gold' | 'sweeps';
    status: 'pending' | 'completed' | 'failed' | 'cancelled';
    createdAt: string;
    updatedAt: string;
}

// Game session types
export interface GameSession {
    id: number;
    userId: number;
    gameId: number;
    betAmount: number;
    winAmount: number;
    currency: 'gold' | 'sweeps';
    startTime: string;
    endTime?: string;
    isActive: boolean;
}

// API Response types
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    meta: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
    };
}

// Laravel-specific types
export interface LaravelValidationError {
    message: string;
    errors: Record<string, string[]>;
}

// jQuery extensions for casino
export interface JQuery {
    casinoGame?(options?: any): JQuery;
    paymentForm?(options?: any): JQuery;
}
