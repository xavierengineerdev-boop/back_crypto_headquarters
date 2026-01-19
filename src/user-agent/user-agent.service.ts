import { Injectable } from '@nestjs/common';

@Injectable()
export class UserAgentService {
  formatUserAgent(userAgent: string | undefined): string {
    if (!userAgent) {
      return 'Не указан';
    }

    const ua = userAgent.trim();
    
    let browser = 'Неизвестный';
    if (ua.includes('Chrome') && !ua.includes('Edg')) {
      browser = 'Chrome';
    } else if (ua.includes('Firefox')) {
      browser = 'Firefox';
    } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
      browser = 'Safari';
    } else if (ua.includes('Edg')) {
      browser = 'Edge';
    } else if (ua.includes('Opera') || ua.includes('OPR')) {
      browser = 'Opera';
    }

    let os = 'Неизвестная';
    if (ua.includes('Windows')) {
      os = 'Windows';
    } else if (ua.includes('Mac OS')) {
      os = 'macOS';
    } else if (ua.includes('Linux')) {
      os = 'Linux';
    } else if (ua.includes('Android')) {
      os = 'Android';
    } else if (ua.includes('iOS')) {
      os = 'iOS';
    }

    return `${browser} / ${os}`;
  }

  getUserAgentInfo(userAgent: string | undefined, full: boolean = false): string {
    if (!userAgent) {
      return 'Не указан';
    }

    if (full) {
      return userAgent;
    }

    return this.formatUserAgent(userAgent);
  }
}

