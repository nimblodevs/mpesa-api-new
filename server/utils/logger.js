import fs from 'fs';
import path from 'path';

class Logger {
  constructor() {
    this.logDir = path.join(process.cwd(), 'logs');
    this.ensureLogDirectory();
  }

  ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  formatMessage(level, message, meta = {}) {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      message,
      ...meta,
    }) + '\n';
  }

  writeToFile(filename, content) {
    const filePath = path.join(this.logDir, filename);
    fs.appendFileSync(filePath, content);
  }

  info(message, meta = {}) {
    const logMessage = this.formatMessage('INFO', message, meta);
    console.log(logMessage.trim());
    this.writeToFile('app.log', logMessage);
  }

  error(message, meta = {}) {
    const logMessage = this.formatMessage('ERROR', message, meta);
    console.error(logMessage.trim());
    this.writeToFile('error.log', logMessage);
  }

  warn(message, meta = {}) {
    const logMessage = this.formatMessage('WARN', message, meta);
    console.warn(logMessage.trim());
    this.writeToFile('app.log', logMessage);
  }

  debug(message, meta = {}) {
    if (process.env.NODE_ENV === 'development') {
      const logMessage = this.formatMessage('DEBUG', message, meta);
      console.debug(logMessage.trim());
      this.writeToFile('debug.log', logMessage);
    }
  }

  // Log M-Pesa specific events
  mpesaTransaction(type, data) {
    const logMessage = this.formatMessage('MPESA', `${type} transaction`, data);
    this.writeToFile('mpesa.log', logMessage);
  }
}

export default new Logger();