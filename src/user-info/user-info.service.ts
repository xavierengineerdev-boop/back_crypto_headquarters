import { Injectable } from '@nestjs/common';
import type { Request } from 'express';

export interface UserInfo {
  ip: string;
  language: string;
  platform: string;
  resolution?: string;
  timezone?: string;
  userAgent: string;
  timestamp: string;
}

@Injectable()
export class UserInfoService {
  getRealIp(req: Request): string {
    const forwardedFor = req.headers['x-forwarded-for'];
    if (forwardedFor) {
      const ips = Array.isArray(forwardedFor) 
        ? forwardedFor[0] 
        : forwardedFor.split(',')[0].trim();
      return ips || req.ip || 'Неизвестен';
    }

    const realIp = req.headers['x-real-ip'];
    if (realIp) {
      return Array.isArray(realIp) ? realIp[0] : realIp;
    }

    return req.ip || req.socket.remoteAddress || 'Неизвестен';
  }

  getLanguage(req: Request): string {
    const acceptLanguage = req.headers['accept-language'];
    if (!acceptLanguage) {
      return 'Не указан';
    }

    const languages = Array.isArray(acceptLanguage) 
      ? acceptLanguage[0] 
      : acceptLanguage;
    
    const primaryLang = languages.split(',')[0].split(';')[0].trim();
    return primaryLang || 'Не указан';
  }

  getPlatform(userAgent: string | undefined): string {
    if (!userAgent) {
      return 'Неизвестна';
    }

    const ua = userAgent;

    let os = '';
    let arch = '';

    if (ua.includes('Android')) {
      os = 'Android';
      if (ua.includes('x86_64')) {
        arch = 'x86_64';
      } else if (ua.includes('x86')) {
        arch = 'x86';
      } else if (ua.includes('arm64') || ua.includes('aarch64')) {
        arch = 'arm64';
      } else {
        arch = 'arm';
      }
    } else if (ua.includes('Windows')) {
      os = 'Windows';
      if (ua.includes('WOW64') || ua.includes('Win64')) {
        arch = 'x64';
      } else {
        arch = 'x86';
      }
    } else if (ua.includes('Mac OS X') || ua.includes('Macintosh')) {
      os = 'macOS';
      if (ua.includes('Intel')) {
        arch = 'x86_64';
      } else if (ua.includes('ARM')) {
        arch = 'arm64';
      }
    } else if (ua.includes('Linux')) {
      os = 'Linux';
      if (ua.includes('x86_64')) {
        arch = 'x86_64';
      } else if (ua.includes('x86')) {
        arch = 'x86';
      } else if (ua.includes('arm64') || ua.includes('aarch64')) {
        arch = 'arm64';
      } else if (ua.includes('arm')) {
        arch = 'arm';
      }
    } else if (ua.includes('iPhone') || ua.includes('iPad') || ua.includes('iOS')) {
      os = 'iOS';
    } else {
      os = 'Неизвестная';
    }

    return arch ? `${os} ${arch}` : os;
  }

  getCurrentTime(): string {
    return new Date().toISOString();
  }

  collectUserInfo(req: Request, data?: any): UserInfo {
    const userAgent = req.headers['user-agent'] || '';
    
    return {
      ip: this.getRealIp(req),
      language: this.getLanguage(req),
      platform: this.getPlatform(userAgent),
      resolution: data?.resolution || 'Не указано',
      timezone: data?.timezone || this.getTimezone(),
      userAgent: userAgent || 'Не указан',
      timestamp: this.getCurrentTime(),
    };
  }

  private getTimezone(): string {
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      return timezone || 'Не указан';
    } catch {
      return 'Не указан';
    }
  }

  formatUserInfo(userInfo: UserInfo): string {
    let info = '💻 <b>Информация о пользователе:</b>\n';
    info += `• Реальный IP: <code>${userInfo.ip}</code>\n`;
    info += `• Язык: ${userInfo.language}\n`;
    info += `• Платформа: ${userInfo.platform}\n`;
    info += `• Разрешение: ${userInfo.resolution}\n`;
    info += `• Часовой пояс: ${userInfo.timezone}\n`;
    info += `• User Agent: <code>${userInfo.userAgent}</code>\n`;
    info += `• Время: ${userInfo.timestamp}`;

    return info;
  }
}

