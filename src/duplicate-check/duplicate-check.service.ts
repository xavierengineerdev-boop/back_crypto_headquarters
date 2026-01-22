import { Injectable } from '@nestjs/common';

interface IpRecord {
  ip: string;
  lastSubmissionTime: number;
}

@Injectable()
export class DuplicateCheckService {
  // Хранилище IP адресов и времени последней отправки
  private ipRecords: Map<string, number> = new Map();
  
  // Время в миллисекундах, в течение которого считается дубликатом (24 часа)
  private readonly DUPLICATE_WINDOW_MS = 24 * 60 * 60 * 1000;

  /**
   * Проверяет, является ли IP дубликатом
   * @param ip IP адрес для проверки
   * @returns true если это дубликат, false если можно отправлять
   */
  isDuplicate(ip: string): boolean {
    if (!ip || ip === 'Неизвестен') {
      // Если IP неизвестен, разрешаем отправку (но можно изменить логику)
      return false;
    }

    const lastSubmissionTime = this.ipRecords.get(ip);
    
    if (!lastSubmissionTime) {
      // IP не найден, можно отправлять
      return false;
    }

    const now = Date.now();
    const timeSinceLastSubmission = now - lastSubmissionTime;

    // Если прошло меньше времени окна дубликатов, это дубликат
    if (timeSinceLastSubmission < this.DUPLICATE_WINDOW_MS) {
      return true;
    }

    // Если прошло больше времени, удаляем старую запись
    this.ipRecords.delete(ip);
    return false;
  }

  /**
   * Регистрирует отправку с указанного IP
   * @param ip IP адрес
   */
  registerSubmission(ip: string): void {
    if (!ip || ip === 'Неизвестен') {
      return;
    }

    this.ipRecords.set(ip, Date.now());
  }

  /**
   * Очищает старые записи (старше окна дубликатов)
   * Можно вызывать периодически для очистки памяти
   */
  cleanOldRecords(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.ipRecords.forEach((timestamp, ip) => {
      if (now - timestamp >= this.DUPLICATE_WINDOW_MS) {
        keysToDelete.push(ip);
      }
    });

    keysToDelete.forEach(ip => this.ipRecords.delete(ip));
  }

  /**
   * Получает время до следующей возможной отправки для IP
   * @param ip IP адрес
   * @returns Время в миллисекундах до следующей отправки, или 0 если можно отправлять
   */
  getTimeUntilNextSubmission(ip: string): number {
    if (!ip || ip === 'Неизвестен') {
      return 0;
    }

    const lastSubmissionTime = this.ipRecords.get(ip);
    
    if (!lastSubmissionTime) {
      return 0;
    }

    const now = Date.now();
    const timeSinceLastSubmission = now - lastSubmissionTime;
    const timeUntilNext = this.DUPLICATE_WINDOW_MS - timeSinceLastSubmission;

    return timeUntilNext > 0 ? timeUntilNext : 0;
  }
}

