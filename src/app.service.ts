import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AppService {
  private readonly telegramBotToken: string;
  private readonly telegramChatId: string;
  private readonly telegramApiUrl = 'https://api.telegram.org/bot';

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.telegramBotToken = this.configService.get<string>('TELEGRAM_BOT_TOKEN') || '';
    this.telegramChatId = this.configService.get<string>('TELEGRAM_CHAT_ID') || '';
    
    if (!this.telegramBotToken || !this.telegramChatId) {
      throw new Error('TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID must be set in .env file');
    }
  }

  async sendToTelegram(data: any, userInfo?: string): Promise<any> {
    try {
      const message = this.formatMessage(data, userInfo);
      const url = `${this.telegramApiUrl}${this.telegramBotToken}/sendMessage`;
      
      const response = await firstValueFrom(
        this.httpService.post(url, {
          chat_id: this.telegramChatId,
          text: message,
          parse_mode: 'HTML',
        }),
      );

      return { success: true, data: response.data };
    } catch (error) {
      throw new Error(`Failed to send message to Telegram: ${error.message}`);
    }
  }

  private formatMessage(data: any, userInfo?: string): string {
    let message = '<b>Новое сообщение с формы:</b>\n\n';
    
    const excludeFields = ['resolution', 'timezone'];
    const formData: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(data)) {
      if (!excludeFields.includes(key)) {
        formData[key] = value;
      }
    }
    
    for (const [key, value] of Object.entries(formData)) {
      message += `<b>${key}:</b> ${value}\n`;
    }

    if (userInfo) {
      message += `\n\n${userInfo}`;
    }

    return message;
  }
}
