/**
 * Centralized structured logging for all microservices
 * Provides consistent log format and context tracking
 */

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  FATAL: 4
};

const LEVEL_COLORS = {
  DEBUG: '\x1b[36m',  // Cyan
  INFO: '\x1b[32m',   // Green
  WARN: '\x1b[33m',   // Yellow
  ERROR: '\x1b[31m',  // Red
  FATAL: '\x1b[35m'   // Magenta
};

const RESET = '\x1b[0m';

class Logger {
  constructor(serviceName = 'app', minLevel = LOG_LEVELS.INFO) {
    this.serviceName = serviceName;
    this.minLevel = minLevel;
  }

  /**
   * Format log message with timestamp and context
   */
  formatMessage(level, message, context = {}) {
    const timestamp = new Date().toISOString();
    const color = LEVEL_COLORS[level] || '';

    const logObject = {
      timestamp,
      level,
      service: this.serviceName,
      message,
      ...context
    };

    // Development: Pretty print with colors
    if (process.env.NODE_ENV !== 'production') {
      const levelPadded = level.padEnd(5);
      const prefix = `${color}[${timestamp}] [${levelPadded}] [${this.serviceName}]${RESET}`;
      return { prefix, logObject };
    }

    // Production: JSON format for log aggregation
    return { prefix: '', logObject };
  }

  /**
   * Output log message
   */
  output(level, message, context) {
    const { prefix, logObject } = this.formatMessage(level, message, context);

    if (process.env.NODE_ENV === 'production') {
      console.log(JSON.stringify(logObject));
    } else {
      console.log(`${prefix} ${message}`, Object.keys(context).length > 0 ? context : '');
    }
  }

  /**
   * Debug level - detailed information for debugging
   */
  debug(message, context = {}) {
    if (this.minLevel <= LOG_LEVELS.DEBUG) {
      this.output('DEBUG', message, context);
    }
  }

  /**
   * Info level - general informational messages
   */
  info(message, context = {}) {
    if (this.minLevel <= LOG_LEVELS.INFO) {
      this.output('INFO', message, context);
    }
  }

  /**
   * Warn level - warning messages
   */
  warn(message, context = {}) {
    if (this.minLevel <= LOG_LEVELS.WARN) {
      this.output('WARN', message, context);
    }
  }

  /**
   * Error level - error messages
   */
  error(message, context = {}) {
    if (this.minLevel <= LOG_LEVELS.ERROR) {
      this.output('ERROR', message, context);
    }
  }

  /**
   * Fatal level - fatal errors requiring immediate attention
   */
  fatal(message, context = {}) {
    if (this.minLevel <= LOG_LEVELS.FATAL) {
      this.output('FATAL', message, context);
    }
  }

  /**
   * Log API request
   */
  request(method, path, statusCode, duration) {
    this.info(`${method} ${path}`, {
      statusCode,
      duration: `${duration}ms`,
      type: 'http_request'
    });
  }

  /**
   * Log API response error
   */
  responseError(method, path, statusCode, error) {
    this.error(`${method} ${path}`, {
      statusCode,
      error: error.message || error,
      type: 'http_error'
    });
  }

  /**
   * Log database query
   */
  query(query, duration, rowCount = 0) {
    this.debug('Database query', {
      query: query.substring(0, 100),
      duration: `${duration}ms`,
      rowCount,
      type: 'db_query'
    });
  }

  /**
   * Log service startup
   */
  serviceStarted(serviceName, port) {
    this.info(`Service started: ${serviceName}`, {
      port,
      pid: process.pid,
      type: 'service_start'
    });
  }

  /**
   * Log service health
   */
  health(serviceName, status, details = {}) {
    const logFn = status === 'healthy' ? this.info : this.warn;
    logFn.call(this, `Service health: ${serviceName}`, {
      status,
      ...details,
      type: 'health_check'
    });
  }
}

// Create service-specific loggers
const loggers = {};

export function createLogger(serviceName) {
  if (!loggers[serviceName]) {
    loggers[serviceName] = new Logger(
      serviceName,
      process.env.LOG_LEVEL ? LOG_LEVELS[process.env.LOG_LEVEL] : LOG_LEVELS.INFO
    );
  }
  return loggers[serviceName];
}

// Default logger
export const logger = createLogger('app');

export default createLogger;
