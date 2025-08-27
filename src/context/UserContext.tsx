import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'bet' | 'win' | 'bonus' | 'refund';
  amount: number;
  description: string;
  timestamp: number;
  gameId?: string;
  gameName?: string;
  roundId?: string;
  balanceBefore: number;
  balanceAfter: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  metadata?: {
    paylines?: number;
    betPerLine?: number;
    multiplier?: number;
    jackpot?: boolean;
    bonusRound?: boolean;
    [key: string]: any;
  };
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  joinDate: number;
  lastLoginDate: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  vipLevel: number;
  totalWagered: number;
  totalWon: number;
  lifetimeDeposits: number;
  lifetimeWithdrawals: number;
  preferences: {
    currency: string;
    language: string;
    notifications: boolean;
    autoPlay: boolean;
    soundEnabled: boolean;
    animationsEnabled: boolean;
  };
  limits: {
    dailyDeposit: number;
    weeklyDeposit: number;
    monthlyDeposit: number;
    sessionTime: number;
    lossLimit: number;
  };
  bonuses: {
    welcomeBonus: number;
    loyalty: number;
    cashback: number;
    freeSpins: number;
  };
}

export interface UserState {
  isLoggedIn: boolean;
  profile: UserProfile | null;
  balance: {
    real: number;
    bonus: number;
    total: number;
    currency: string;
    lastUpdated: number;
  };
  transactions: Transaction[];
  sessionData: {
    startTime: number;
    totalWagered: number;
    totalWon: number;
    spinsPlayed: number;
    bigWins: number;
    bonusRounds: number;
    currentStreak: number;
    maxStreak: number;
    netProfit: number;
  };
  gameHistory: {
    [gameId: string]: {
      totalSpins: number;
      totalWagered: number;
      totalWon: number;
      biggestWin: number;
      lastPlayed: number;
      favoriteGame: boolean;
    };
  };
  loading: boolean;
  error: string | null;
}

type UserAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { profile: UserProfile; balance: UserState['balance'] } }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_BALANCE'; payload: { real?: number; bonus?: number } }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'UPDATE_PROFILE'; payload: Partial<UserProfile> }
  | { type: 'UPDATE_SESSION_DATA'; payload: Partial<UserState['sessionData']> }
  | { type: 'UPDATE_GAME_HISTORY'; payload: { gameId: string; data: Partial<UserState['gameHistory'][string]> } }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' };

const initialState: UserState = {
  isLoggedIn: false,
  profile: null,
  balance: {
    real: 0,
    bonus: 0,
    total: 0,
    currency: 'USD',
    lastUpdated: Date.now()
  },
  transactions: [],
  sessionData: {
    startTime: Date.now(),
    totalWagered: 0,
    totalWon: 0,
    spinsPlayed: 0,
    bigWins: 0,
    bonusRounds: 0,
    currentStreak: 0,
    maxStreak: 0,
    netProfit: 0
  },
  gameHistory: {},
  loading: false,
  error: null
};

function userReducer(state: UserState, action: UserAction): UserState {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true, error: null };

    case 'LOGIN_SUCCESS':
      return {
        ...state,
        loading: false,
        isLoggedIn: true,
        profile: action.payload.profile,
        balance: action.payload.balance,
        sessionData: {
          ...state.sessionData,
          startTime: Date.now()
        }
      };

    case 'LOGIN_FAILURE':
      return {
        ...state,
        loading: false,
        isLoggedIn: false,
        profile: null,
        error: action.payload
      };

    case 'LOGOUT':
      return {
        ...initialState,
        sessionData: {
          ...initialState.sessionData,
          startTime: Date.now()
        }
      };

    case 'UPDATE_BALANCE':
      const newBalance = {
        ...state.balance,
        ...action.payload,
        lastUpdated: Date.now()
      };
      newBalance.total = newBalance.real + newBalance.bonus;
      
      return {
        ...state,
        balance: newBalance
      };

    case 'ADD_TRANSACTION':
      return {
        ...state,
        transactions: [action.payload, ...state.transactions].slice(0, 1000), // Keep last 1000 transactions
        balance: {
          ...state.balance,
          real: action.payload.balanceAfter,
          total: action.payload.balanceAfter + state.balance.bonus,
          lastUpdated: Date.now()
        }
      };

    case 'UPDATE_PROFILE':
      return {
        ...state,
        profile: state.profile ? { ...state.profile, ...action.payload } : null
      };

    case 'UPDATE_SESSION_DATA':
      const updatedSessionData = { ...state.sessionData, ...action.payload };
      updatedSessionData.netProfit = updatedSessionData.totalWon - updatedSessionData.totalWagered;
      
      return {
        ...state,
        sessionData: updatedSessionData
      };

    case 'UPDATE_GAME_HISTORY':
      return {
        ...state,
        gameHistory: {
          ...state.gameHistory,
          [action.payload.gameId]: {
            totalSpins: 0,
            totalWagered: 0,
            totalWon: 0,
            biggestWin: 0,
            lastPlayed: Date.now(),
            favoriteGame: false,
            ...state.gameHistory[action.payload.gameId],
            ...action.payload.data
          }
        }
      };

    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };

    case 'CLEAR_ERROR':
      return { ...state, error: null };

    default:
      return state;
  }
}

interface UserContextType {
  state: UserState;
  login: (credentials: { username: string; password: string }) => Promise<void>;
  logout: () => void;
  updateBalance: (amount: number, type: 'real' | 'bonus') => void;
  placeBet: (amount: number, gameId: string, gameName: string, metadata?: Transaction['metadata']) => Promise<Transaction>;
  recordWin: (amount: number, gameId: string, gameName: string, metadata?: Transaction['metadata']) => Promise<Transaction>;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'timestamp' | 'balanceBefore' | 'balanceAfter'>) => Transaction;
  deposit: (amount: number, method: string) => Promise<void>;
  withdraw: (amount: number, method: string) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => void;
  recordGameSpin: (gameId: string, bet: number, win: number) => void;
  getTransactionHistory: (limit?: number, type?: Transaction['type']) => Transaction[];
  getSessionSummary: () => UserState['sessionData'];
  canAfford: (amount: number) => boolean;
  generateTransactionId: () => string;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(userReducer, initialState);

  // Load user data from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('casinoUser');
    const savedTransactions = localStorage.getItem('casinoTransactions');
    const savedSession = localStorage.getItem('casinoSession');
    
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            profile: userData.profile,
            balance: userData.balance
          }
        });
      } catch (error) {
        console.error('Failed to load user data:', error);
      }
    }

    if (savedTransactions) {
      try {
        const transactions = JSON.parse(savedTransactions);
        transactions.forEach((transaction: Transaction) => {
          dispatch({ type: 'ADD_TRANSACTION', payload: transaction });
        });
      } catch (error) {
        console.error('Failed to load transaction history:', error);
      }
    }

    if (savedSession) {
      try {
        const sessionData = JSON.parse(savedSession);
        dispatch({ type: 'UPDATE_SESSION_DATA', payload: sessionData });
      } catch (error) {
        console.error('Failed to load session data:', error);
      }
    }
  }, []);

  // Save user data to localStorage when state changes
  useEffect(() => {
    if (state.isLoggedIn && state.profile) {
      localStorage.setItem('casinoUser', JSON.stringify({
        profile: state.profile,
        balance: state.balance
      }));
    } else {
      localStorage.removeItem('casinoUser');
    }
  }, [state.isLoggedIn, state.profile, state.balance]);

  // Save transactions to localStorage
  useEffect(() => {
    if (state.transactions.length > 0) {
      localStorage.setItem('casinoTransactions', JSON.stringify(state.transactions));
    }
  }, [state.transactions]);

  // Save session data to localStorage
  useEffect(() => {
    localStorage.setItem('casinoSession', JSON.stringify(state.sessionData));
  }, [state.sessionData]);

  const generateTransactionId = (): string => {
    return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const login = async (credentials: { username: string; password: string }): Promise<void> => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Demo user data
      const profile: UserProfile = {
        id: 'user_demo_123',
        username: credentials.username,
        email: `${credentials.username}@example.com`,
        firstName: 'Casino',
        lastName: 'Player',
        joinDate: Date.now() - (365 * 24 * 60 * 60 * 1000), // 1 year ago
        lastLoginDate: Date.now(),
        tier: 'gold',
        vipLevel: 3,
        totalWagered: 25000,
        totalWon: 23500,
        lifetimeDeposits: 30000,
        lifetimeWithdrawals: 28500,
        preferences: {
          currency: 'USD',
          language: 'en',
          notifications: true,
          autoPlay: false,
          soundEnabled: true,
          animationsEnabled: true
        },
        limits: {
          dailyDeposit: 1000,
          weeklyDeposit: 5000,
          monthlyDeposit: 20000,
          sessionTime: 4 * 60 * 60 * 1000, // 4 hours
          lossLimit: 500
        },
        bonuses: {
          welcomeBonus: 0,
          loyalty: 250,
          cashback: 50,
          freeSpins: 10
        }
      };

      const balance = {
        real: 5000,
        bonus: 250,
        total: 5250,
        currency: 'USD',
        lastUpdated: Date.now()
      };

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { profile, balance }
      });
    } catch (error) {
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: 'Login failed. Please try again.'
      });
    }
  };

  const logout = (): void => {
    localStorage.removeItem('casinoUser');
    localStorage.removeItem('casinoTransactions');
    localStorage.removeItem('casinoSession');
    dispatch({ type: 'LOGOUT' });
  };

  const updateBalance = (amount: number, type: 'real' | 'bonus'): void => {
    dispatch({
      type: 'UPDATE_BALANCE',
      payload: { [type]: amount }
    });
  };

  const addTransaction = (transactionData: Omit<Transaction, 'id' | 'timestamp' | 'balanceBefore' | 'balanceAfter'>): Transaction => {
    const transaction: Transaction = {
      ...transactionData,
      id: generateTransactionId(),
      timestamp: Date.now(),
      balanceBefore: state.balance.real,
      balanceAfter: state.balance.real + (transactionData.type === 'win' || transactionData.type === 'deposit' ? transactionData.amount : -transactionData.amount)
    };

    dispatch({ type: 'ADD_TRANSACTION', payload: transaction });
    return transaction;
  };

  const placeBet = async (amount: number, gameId: string, gameName: string, metadata?: Transaction['metadata']): Promise<Transaction> => {
    if (!canAfford(amount)) {
      throw new Error('Insufficient balance');
    }

    const transaction = addTransaction({
      type: 'bet',
      amount: amount,
      description: `Bet placed on ${gameName}`,
      gameId,
      gameName,
      status: 'completed',
      metadata
    });

    // Update session data
    dispatch({
      type: 'UPDATE_SESSION_DATA',
      payload: {
        totalWagered: state.sessionData.totalWagered + amount,
        spinsPlayed: state.sessionData.spinsPlayed + 1
      }
    });

    return transaction;
  };

  const recordWin = async (amount: number, gameId: string, gameName: string, metadata?: Transaction['metadata']): Promise<Transaction> => {
    const transaction = addTransaction({
      type: 'win',
      amount: amount,
      description: `Win from ${gameName}`,
      gameId,
      gameName,
      status: 'completed',
      metadata
    });

    // Update session data
    const isBigWin = amount >= (metadata?.betPerLine || 1) * (metadata?.paylines || 1) * 10;
    const newStreak = state.sessionData.currentStreak + 1;
    
    dispatch({
      type: 'UPDATE_SESSION_DATA',
      payload: {
        totalWon: state.sessionData.totalWon + amount,
        bigWins: state.sessionData.bigWins + (isBigWin ? 1 : 0),
        currentStreak: newStreak,
        maxStreak: Math.max(state.sessionData.maxStreak, newStreak),
        bonusRounds: state.sessionData.bonusRounds + (metadata?.bonusRound ? 1 : 0)
      }
    });

    return transaction;
  };

  const deposit = async (amount: number, method: string): Promise<void> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    addTransaction({
      type: 'deposit',
      amount: amount,
      description: `Deposit via ${method}`,
      status: 'completed'
    });

    // Update profile lifetime deposits
    if (state.profile) {
      dispatch({
        type: 'UPDATE_PROFILE',
        payload: {
          lifetimeDeposits: state.profile.lifetimeDeposits + amount
        }
      });
    }
  };

  const withdraw = async (amount: number, method: string): Promise<void> => {
    if (!canAfford(amount)) {
      throw new Error('Insufficient balance');
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    addTransaction({
      type: 'withdrawal',
      amount: amount,
      description: `Withdrawal via ${method}`,
      status: 'completed'
    });

    // Update profile lifetime withdrawals
    if (state.profile) {
      dispatch({
        type: 'UPDATE_PROFILE',
        payload: {
          lifetimeWithdrawals: state.profile.lifetimeWithdrawals + amount
        }
      });
    }
  };

  const updateProfile = (updates: Partial<UserProfile>): void => {
    dispatch({ type: 'UPDATE_PROFILE', payload: updates });
  };

  const recordGameSpin = (gameId: string, bet: number, win: number): void => {
    const currentHistory = state.gameHistory[gameId] || {
      totalSpins: 0,
      totalWagered: 0,
      totalWon: 0,
      biggestWin: 0,
      lastPlayed: Date.now(),
      favoriteGame: false
    };

    dispatch({
      type: 'UPDATE_GAME_HISTORY',
      payload: {
        gameId,
        data: {
          totalSpins: currentHistory.totalSpins + 1,
          totalWagered: currentHistory.totalWagered + bet,
          totalWon: currentHistory.totalWon + win,
          biggestWin: Math.max(currentHistory.biggestWin, win),
          lastPlayed: Date.now()
        }
      }
    });
  };

  const getTransactionHistory = (limit: number = 50, type?: Transaction['type']): Transaction[] => {
    let transactions = state.transactions;
    
    if (type) {
      transactions = transactions.filter(t => t.type === type);
    }
    
    return transactions.slice(0, limit);
  };

  const getSessionSummary = (): UserState['sessionData'] => {
    return state.sessionData;
  };

  const canAfford = (amount: number): boolean => {
    return state.balance.real >= amount;
  };

  const contextValue: UserContextType = {
    state,
    login,
    logout,
    updateBalance,
    placeBet,
    recordWin,
    addTransaction,
    deposit,
    withdraw,
    updateProfile,
    recordGameSpin,
    getTransactionHistory,
    getSessionSummary,
    canAfford,
    generateTransactionId
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;
