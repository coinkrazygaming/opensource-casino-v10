import { Transaction } from '../context/UserContext';

export interface TransactionRequest {
  userId: string;
  type: Transaction['type'];
  amount: number;
  description: string;
  gameId?: string;
  gameName?: string;
  metadata?: Transaction['metadata'];
}

export interface TransactionResponse {
  success: boolean;
  transaction?: Transaction;
  balance?: {
    real: number;
    bonus: number;
    total: number;
  };
  error?: string;
  errorCode?: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'credit_card' | 'debit_card' | 'bank_transfer' | 'e_wallet' | 'crypto';
  provider: string;
  icon: string;
  minAmount: number;
  maxAmount: number;
  processingTime: string;
  fees: {
    fixed: number;
    percentage: number;
  };
  isEnabled: boolean;
  supportedCurrencies: string[];
}

export interface TransactionLimit {
  daily: number;
  weekly: number;
  monthly: number;
  perTransaction: number;
  remainingDaily: number;
  remainingWeekly: number;
  remainingMonthly: number;
}

export interface TransactionStats {
  totalTransactions: number;
  totalDeposits: number;
  totalWithdrawals: number;
  averageDeposit: number;
  averageWithdrawal: number;
  largestDeposit: number;
  largestWithdrawal: number;
  mostUsedMethod: string;
  successRate: number;
}

class TransactionService {
  private baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
  private apiKey = process.env.REACT_APP_API_KEY || '';

  // Payment methods configuration
  private paymentMethods: PaymentMethod[] = [
    {
      id: 'visa',
      name: 'Visa',
      type: 'credit_card',
      provider: 'Visa',
      icon: '💳',
      minAmount: 10,
      maxAmount: 5000,
      processingTime: 'Instant',
      fees: { fixed: 0, percentage: 0.025 },
      isEnabled: true,
      supportedCurrencies: ['USD', 'EUR', 'GBP']
    },
    {
      id: 'mastercard',
      name: 'Mastercard',
      type: 'credit_card',
      provider: 'Mastercard',
      icon: '💳',
      minAmount: 10,
      maxAmount: 5000,
      processingTime: 'Instant',
      fees: { fixed: 0, percentage: 0.025 },
      isEnabled: true,
      supportedCurrencies: ['USD', 'EUR', 'GBP']
    },
    {
      id: 'paypal',
      name: 'PayPal',
      type: 'e_wallet',
      provider: 'PayPal',
      icon: '💰',
      minAmount: 5,
      maxAmount: 2500,
      processingTime: 'Instant',
      fees: { fixed: 0.30, percentage: 0.029 },
      isEnabled: true,
      supportedCurrencies: ['USD', 'EUR', 'GBP']
    },
    {
      id: 'skrill',
      name: 'Skrill',
      type: 'e_wallet',
      provider: 'Skrill',
      icon: '🏦',
      minAmount: 10,
      maxAmount: 10000,
      processingTime: 'Instant',
      fees: { fixed: 0, percentage: 0.015 },
      isEnabled: true,
      supportedCurrencies: ['USD', 'EUR', 'GBP']
    },
    {
      id: 'neteller',
      name: 'Neteller',
      type: 'e_wallet',
      provider: 'Neteller',
      icon: '💱',
      minAmount: 10,
      maxAmount: 10000,
      processingTime: 'Instant',
      fees: { fixed: 0, percentage: 0.015 },
      isEnabled: true,
      supportedCurrencies: ['USD', 'EUR', 'GBP']
    },
    {
      id: 'bitcoin',
      name: 'Bitcoin',
      type: 'crypto',
      provider: 'Bitcoin',
      icon: '₿',
      minAmount: 20,
      maxAmount: 50000,
      processingTime: '10-30 minutes',
      fees: { fixed: 0, percentage: 0.01 },
      isEnabled: true,
      supportedCurrencies: ['BTC']
    },
    {
      id: 'ethereum',
      name: 'Ethereum',
      type: 'crypto',
      provider: 'Ethereum',
      icon: '⟠',
      minAmount: 20,
      maxAmount: 50000,
      processingTime: '5-15 minutes',
      fees: { fixed: 0, percentage: 0.015 },
      isEnabled: true,
      supportedCurrencies: ['ETH']
    },
    {
      id: 'bank_transfer',
      name: 'Bank Transfer',
      type: 'bank_transfer',
      provider: 'Bank',
      icon: '🏦',
      minAmount: 50,
      maxAmount: 50000,
      processingTime: '1-3 business days',
      fees: { fixed: 5, percentage: 0 },
      isEnabled: true,
      supportedCurrencies: ['USD', 'EUR', 'GBP']
    }
  ];

  /**
   * Process a deposit transaction
   */
  async processDeposit(
    userId: string,
    amount: number,
    paymentMethodId: string,
    paymentDetails: any
  ): Promise<TransactionResponse> {
    try {
      const paymentMethod = this.getPaymentMethod(paymentMethodId);
      if (!paymentMethod) {
        throw new Error('Invalid payment method');
      }

      // Validate amount
      if (amount < paymentMethod.minAmount || amount > paymentMethod.maxAmount) {
        throw new Error(`Amount must be between ${paymentMethod.minAmount} and ${paymentMethod.maxAmount}`);
      }

      // Calculate fees
      const fees = this.calculateFees(amount, paymentMethod);
      const totalAmount = amount - fees;

      // Simulate API call to payment processor
      const response = await this.makeApiCall('/transactions/deposit', {
        userId,
        amount,
        paymentMethodId,
        paymentDetails,
        fees
      });

      if (response.success) {
        return {
          success: true,
          transaction: {
            id: this.generateTransactionId(),
            type: 'deposit',
            amount: totalAmount,
            description: `Deposit via ${paymentMethod.name}`,
            timestamp: Date.now(),
            balanceBefore: response.balanceBefore,
            balanceAfter: response.balanceAfter,
            status: 'completed',
            metadata: {
              paymentMethod: paymentMethod.name,
              fees,
              originalAmount: amount,
              provider: paymentMethod.provider
            }
          },
          balance: response.balance
        };
      } else {
        throw new Error(response.error || 'Deposit failed');
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        errorCode: 'DEPOSIT_FAILED'
      };
    }
  }

  /**
   * Process a withdrawal transaction
   */
  async processWithdrawal(
    userId: string,
    amount: number,
    paymentMethodId: string,
    withdrawalDetails: any
  ): Promise<TransactionResponse> {
    try {
      const paymentMethod = this.getPaymentMethod(paymentMethodId);
      if (!paymentMethod) {
        throw new Error('Invalid payment method');
      }

      // Validate amount
      if (amount < paymentMethod.minAmount || amount > paymentMethod.maxAmount) {
        throw new Error(`Amount must be between ${paymentMethod.minAmount} and ${paymentMethod.maxAmount}`);
      }

      // Calculate fees
      const fees = this.calculateFees(amount, paymentMethod);
      const netAmount = amount - fees;

      // Simulate API call to payment processor
      const response = await this.makeApiCall('/transactions/withdraw', {
        userId,
        amount,
        paymentMethodId,
        withdrawalDetails,
        fees
      });

      if (response.success) {
        return {
          success: true,
          transaction: {
            id: this.generateTransactionId(),
            type: 'withdrawal',
            amount: amount,
            description: `Withdrawal via ${paymentMethod.name}`,
            timestamp: Date.now(),
            balanceBefore: response.balanceBefore,
            balanceAfter: response.balanceAfter,
            status: paymentMethod.type === 'crypto' ? 'pending' : 'completed',
            metadata: {
              paymentMethod: paymentMethod.name,
              fees,
              netAmount,
              provider: paymentMethod.provider,
              processingTime: paymentMethod.processingTime
            }
          },
          balance: response.balance
        };
      } else {
        throw new Error(response.error || 'Withdrawal failed');
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        errorCode: 'WITHDRAWAL_FAILED'
      };
    }
  }

  /**
   * Process a game bet transaction
   */
  async processBet(request: TransactionRequest): Promise<TransactionResponse> {
    try {
      // Simulate API call
      const response = await this.makeApiCall('/transactions/bet', request);

      if (response.success) {
        return {
          success: true,
          transaction: {
            id: this.generateTransactionId(),
            type: 'bet',
            amount: request.amount,
            description: request.description,
            timestamp: Date.now(),
            balanceBefore: response.balanceBefore,
            balanceAfter: response.balanceAfter,
            status: 'completed',
            gameId: request.gameId,
            gameName: request.gameName,
            metadata: request.metadata
          },
          balance: response.balance
        };
      } else {
        throw new Error(response.error || 'Bet processing failed');
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        errorCode: 'BET_FAILED'
      };
    }
  }

  /**
   * Process a game win transaction
   */
  async processWin(request: TransactionRequest): Promise<TransactionResponse> {
    try {
      // Simulate API call
      const response = await this.makeApiCall('/transactions/win', request);

      if (response.success) {
        return {
          success: true,
          transaction: {
            id: this.generateTransactionId(),
            type: 'win',
            amount: request.amount,
            description: request.description,
            timestamp: Date.now(),
            balanceBefore: response.balanceBefore,
            balanceAfter: response.balanceAfter,
            status: 'completed',
            gameId: request.gameId,
            gameName: request.gameName,
            metadata: request.metadata
          },
          balance: response.balance
        };
      } else {
        throw new Error(response.error || 'Win processing failed');
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        errorCode: 'WIN_FAILED'
      };
    }
  }

  /**
   * Get transaction history
   */
  async getTransactionHistory(
    userId: string,
    limit: number = 50,
    offset: number = 0,
    type?: Transaction['type']
  ): Promise<Transaction[]> {
    try {
      const response = await this.makeApiCall('/transactions/history', {
        userId,
        limit,
        offset,
        type
      });

      return response.transactions || [];
    } catch (error) {
      console.error('Failed to fetch transaction history:', error);
      return [];
    }
  }

  /**
   * Get transaction statistics
   */
  async getTransactionStats(userId: string): Promise<TransactionStats> {
    try {
      const response = await this.makeApiCall('/transactions/stats', { userId });
      return response.stats;
    } catch (error) {
      console.error('Failed to fetch transaction stats:', error);
      return {
        totalTransactions: 0,
        totalDeposits: 0,
        totalWithdrawals: 0,
        averageDeposit: 0,
        averageWithdrawal: 0,
        largestDeposit: 0,
        largestWithdrawal: 0,
        mostUsedMethod: '',
        successRate: 0
      };
    }
  }

  /**
   * Get user transaction limits
   */
  async getTransactionLimits(userId: string): Promise<TransactionLimit> {
    try {
      const response = await this.makeApiCall('/transactions/limits', { userId });
      return response.limits;
    } catch (error) {
      console.error('Failed to fetch transaction limits:', error);
      return {
        daily: 1000,
        weekly: 5000,
        monthly: 20000,
        perTransaction: 5000,
        remainingDaily: 1000,
        remainingWeekly: 5000,
        remainingMonthly: 20000
      };
    }
  }

  /**
   * Get available payment methods
   */
  getPaymentMethods(type?: PaymentMethod['type']): PaymentMethod[] {
    let methods = this.paymentMethods.filter(method => method.isEnabled);
    
    if (type) {
      methods = methods.filter(method => method.type === type);
    }

    return methods;
  }

  /**
   * Get specific payment method
   */
  getPaymentMethod(id: string): PaymentMethod | undefined {
    return this.paymentMethods.find(method => method.id === id);
  }

  /**
   * Calculate transaction fees
   */
  calculateFees(amount: number, paymentMethod: PaymentMethod): number {
    const percentageFee = amount * paymentMethod.fees.percentage;
    const totalFee = paymentMethod.fees.fixed + percentageFee;
    return Math.round(totalFee * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Format currency amount
   */
  formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  /**
   * Validate transaction amount
   */
  validateAmount(amount: number, paymentMethod: PaymentMethod): { valid: boolean; error?: string } {
    if (amount <= 0) {
      return { valid: false, error: 'Amount must be greater than 0' };
    }

    if (amount < paymentMethod.minAmount) {
      return {
        valid: false,
        error: `Minimum amount is ${this.formatCurrency(paymentMethod.minAmount)}`
      };
    }

    if (amount > paymentMethod.maxAmount) {
      return {
        valid: false,
        error: `Maximum amount is ${this.formatCurrency(paymentMethod.maxAmount)}`
      };
    }

    return { valid: true };
  }

  /**
   * Generate unique transaction ID
   */
  private generateTransactionId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 9);
    return `txn_${timestamp}_${random}`.toUpperCase();
  }

  /**
   * Make API call (simulated for demo)
   */
  private async makeApiCall(endpoint: string, data: any): Promise<any> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));

    // Simulate API response
    switch (endpoint) {
      case '/transactions/deposit':
        return {
          success: Math.random() > 0.05, // 95% success rate
          balanceBefore: 1000,
          balanceAfter: 1000 + data.amount,
          balance: {
            real: 1000 + data.amount,
            bonus: 0,
            total: 1000 + data.amount
          },
          error: Math.random() > 0.95 ? 'Payment method declined' : null
        };

      case '/transactions/withdraw':
        return {
          success: Math.random() > 0.1, // 90% success rate
          balanceBefore: 1000,
          balanceAfter: 1000 - data.amount,
          balance: {
            real: 1000 - data.amount,
            bonus: 0,
            total: 1000 - data.amount
          },
          error: Math.random() > 0.9 ? 'Insufficient funds' : null
        };

      case '/transactions/bet':
      case '/transactions/win':
        return {
          success: true,
          balanceBefore: 1000,
          balanceAfter: endpoint.includes('bet') ? 1000 - data.amount : 1000 + data.amount,
          balance: {
            real: endpoint.includes('bet') ? 1000 - data.amount : 1000 + data.amount,
            bonus: 0,
            total: endpoint.includes('bet') ? 1000 - data.amount : 1000 + data.amount
          }
        };

      case '/transactions/history':
        return {
          transactions: []
        };

      case '/transactions/stats':
        return {
          stats: {
            totalTransactions: 150,
            totalDeposits: 5000,
            totalWithdrawals: 3500,
            averageDeposit: 250,
            averageWithdrawal: 350,
            largestDeposit: 1000,
            largestWithdrawal: 800,
            mostUsedMethod: 'PayPal',
            successRate: 0.95
          }
        };

      case '/transactions/limits':
        return {
          limits: {
            daily: 1000,
            weekly: 5000,
            monthly: 20000,
            perTransaction: 5000,
            remainingDaily: 750,
            remainingWeekly: 4200,
            remainingMonthly: 18500
          }
        };

      default:
        throw new Error('Unknown endpoint');
    }
  }
}

// Export singleton instance
const transactionService = new TransactionService();
export default transactionService;

// Export utility functions
export const TransactionUtils = {
  getTransactionTypeIcon(type: Transaction['type']): string {
    const icons = {
      deposit: '💳',
      withdrawal: '💰',
      bet: '🎲',
      win: '🏆',
      bonus: '🎁',
      refund: '↩️'
    };
    return icons[type] || '📄';
  },

  getTransactionStatusColor(status: Transaction['status']): string {
    const colors = {
      pending: '#ffd700',
      completed: '#00b894',
      failed: '#ff6b6b',
      cancelled: '#636e72'
    };
    return colors[status] || '#74b9ff';
  },

  formatTransactionAmount(transaction: Transaction): string {
    const sign = ['deposit', 'win', 'bonus', 'refund'].includes(transaction.type) ? '+' : '-';
    return `${sign}$${transaction.amount.toLocaleString()}`;
  },

  getTransactionDescription(transaction: Transaction): string {
    if (transaction.description) {
      return transaction.description;
    }

    const descriptions = {
      deposit: 'Account deposit',
      withdrawal: 'Account withdrawal',
      bet: 'Game bet',
      win: 'Game win',
      bonus: 'Bonus credit',
      refund: 'Transaction refund'
    };

    return descriptions[transaction.type] || 'Transaction';
  }
};
