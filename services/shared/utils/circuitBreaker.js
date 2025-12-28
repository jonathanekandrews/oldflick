/**
 * Circuit Breaker pattern for microservice communication
 * Prevents cascading failures by stopping calls to failing services
 */

export class CircuitBreaker {
  constructor(options = {}) {
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = null;

    // Configuration
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeout = options.resetTimeout || 30000; // 30 seconds
    this.successThreshold = options.successThreshold || 2;
    this.serviceName = options.serviceName || 'unknown';
  }

  /**
   * Execute function with circuit breaker protection
   */
  async execute(fn) {
    // OPEN: Reject immediately
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.resetTimeout) {
        // Try to recover
        this.transition('HALF_OPEN');
      } else {
        throw new Error(
          `Circuit breaker OPEN for ${this.serviceName}. ` +
          `Service temporarily unavailable.`
        );
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  /**
   * Handle successful call
   */
  onSuccess() {
    this.failureCount = 0;

    if (this.state === 'HALF_OPEN') {
      this.successCount++;
      if (this.successCount >= this.successThreshold) {
        this.transition('CLOSED');
      }
    }
  }

  /**
   * Handle failed call
   */
  onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.failureThreshold) {
      this.transition('OPEN');
    }
  }

  /**
   * Change state and log transition
   */
  transition(newState) {
    if (newState !== this.state) {
      console.log(
        `[CircuitBreaker] ${this.serviceName}: ` +
        `${this.state} → ${newState}`
      );
      this.state = newState;

      if (newState === 'HALF_OPEN') {
        this.successCount = 0;
      }
    }
  }

  /**
   * Get circuit breaker status
   */
  getStatus() {
    return {
      serviceName: this.serviceName,
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastFailureTime: this.lastFailureTime
    };
  }

  /**
   * Reset circuit breaker
   */
  reset() {
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = null;
  }
}

/**
 * Create circuit breakers for all services
 */
export function createCircuitBreakers() {
  return {
    auth: new CircuitBreaker({
      serviceName: 'auth',
      failureThreshold: 5,
      resetTimeout: 30000
    }),
    content: new CircuitBreaker({
      serviceName: 'content',
      failureThreshold: 5,
      resetTimeout: 30000
    }),
    users: new CircuitBreaker({
      serviceName: 'users',
      failureThreshold: 5,
      resetTimeout: 30000
    }),
    payments: new CircuitBreaker({
      serviceName: 'payments',
      failureThreshold: 3,
      resetTimeout: 60000 // Longer timeout for payments
    }),
    media: new CircuitBreaker({
      serviceName: 'media',
      failureThreshold: 5,
      resetTimeout: 30000
    }),
    admin: new CircuitBreaker({
      serviceName: 'admin',
      failureThreshold: 5,
      resetTimeout: 30000
    })
  };
}

export default CircuitBreaker;
