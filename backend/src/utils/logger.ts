export function maskAccessCode(code?: string): string {
  if (!code) return '';
  if (code.length <= 2) return '**';
  return code[0] + '*'.repeat(code.length - 2) + code[code.length - 1];
}

export function maskEmail(email?: string): string {
  if (!email || !email.includes('@')) return '***';
  const [local, domain] = email.split('@');
  if (local.length <= 2) {
    return `*@${domain}`;
  }
  return `${local[0]}***${local[local.length - 1]}@${domain}`;
}

export interface StructuredLog {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  action?: string;
  userId?: string;
  role?: string;
  targetId?: string;
  message: string;
  metadata?: Record<string, unknown>;
  error?: string;
}

class StructuredLogger {
  private log(level: StructuredLog['level'], payload: Omit<StructuredLog, 'timestamp' | 'level'>) {
    const entry: StructuredLog = {
      timestamp: new Date().toISOString(),
      level,
      ...payload,
    };

    const sanitized = this.sanitize(entry);
    const jsonString = JSON.stringify(sanitized);

    if (level === 'ERROR') {
      console.error(jsonString);
    } else if (level === 'WARN') {
      console.warn(jsonString);
    } else {
      console.log(jsonString);
    }
  }

  private sanitize(obj: unknown): unknown {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitize(item));
    }

    const res: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      const lowerKey = k.toLowerCase();
      if (lowerKey.includes('accesscode') || lowerKey === 'code') {
        res[k] = typeof v === 'string' ? maskAccessCode(v) : '***';
      } else if (lowerKey.includes('email')) {
        res[k] = typeof v === 'string' ? maskEmail(v) : '***';
      } else if (lowerKey.includes('password') || lowerKey.includes('token') || lowerKey.includes('secret')) {
        res[k] = '[REDACTED]';
      } else if (typeof v === 'object' && v !== null) {
        res[k] = this.sanitize(v);
      } else {
        res[k] = v;
      }
    }
    return res;
  }

  info(message: string, meta?: Partial<Omit<StructuredLog, 'timestamp' | 'level' | 'message'>>) {
    this.log('INFO', { message, ...meta });
  }

  warn(message: string, meta?: Partial<Omit<StructuredLog, 'timestamp' | 'level' | 'message'>>) {
    this.log('WARN', { message, ...meta });
  }

  error(message: string, meta?: Partial<Omit<StructuredLog, 'timestamp' | 'level' | 'message'>>) {
    this.log('ERROR', { message, ...meta });
  }

  debug(message: string, meta?: Partial<Omit<StructuredLog, 'timestamp' | 'level' | 'message'>>) {
    if (process.env.NODE_ENV !== 'production') {
      this.log('DEBUG', { message, ...meta });
    }
  }
}

export const logger = new StructuredLogger();
