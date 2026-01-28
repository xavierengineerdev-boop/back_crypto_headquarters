import { Controller, Get, Post, Body, Res, Req, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service';
import { UserInfoService } from './user-info/user-info.service';
import { DuplicateCheckService } from './duplicate-check/duplicate-check.service';
import { LeadsService } from './leads/leads.service';
import type { Response, Request } from 'express';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly userInfoService: UserInfoService,
    private readonly duplicateCheckService: DuplicateCheckService,
    private readonly leadsService: LeadsService,
  ) {}

  @Get()
  getHello(): string {
    return 'API is running';
  }

  @Post('send')
  async sendMessage(@Body() data: any, @Req() req: Request, @Res() res: Response) {
    try {
      if (!data || Object.keys(data).length === 0) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: 'No data provided',
        });
      }

      // Извлекаем fbclid и utm_campaign из query параметров или body
      const fbclid = (req.query?.fbclid as string) || data.fbclid;
      const utm_campaign = (req.query?.utm_campaign as string) || data.utm_campaign;

      const userInfo = this.userInfoService.collectUserInfo(req, data);
      const ip = userInfo.ip;

      // Проверка на дубликаты по IP через MongoDB
      const isDuplicate = await this.leadsService.isDuplicate(ip);
      if (isDuplicate) {
        const timeUntilNext = await this.leadsService.getTimeUntilNextSubmission(ip);
        const hoursLeft = Math.ceil(timeUntilNext / (60 * 60 * 1000));
        
        return res.status(HttpStatus.CONFLICT).json({
          success: false,
          message: `Вы уже отправили заявку. Повторная отправка возможна через ${hoursLeft} ${hoursLeft === 1 ? 'час' : hoursLeft < 5 ? 'часа' : 'часов'}`,
          code: 'DUPLICATE_SUBMISSION',
        });
      }

      // Сохраняем лид в базу данных
      await this.leadsService.createLead({
        name: data.name,
        phone: data.phone,
        telegram: data.telegram,
        ip: userInfo.ip,
        language: userInfo.language,
        platform: userInfo.platform,
        resolution: userInfo.resolution,
        timezone: userInfo.timezone,
        userAgent: userInfo.userAgent,
        fbclid: fbclid,
        utm_campaign: utm_campaign,
      });

      // Также регистрируем в памяти для совместимости
      this.duplicateCheckService.registerSubmission(ip);

      // Добавляем fbclid и utm_campaign в данные для отправки в Telegram
      const telegramData = {
        ...data,
        ...(fbclid && { fbclid }),
        ...(utm_campaign && { utm_campaign }),
      };

      const formattedUserInfo = this.userInfoService.formatUserInfo(userInfo);
      const result = await this.appService.sendToTelegram(telegramData, formattedUserInfo);
      
      return res.status(HttpStatus.OK).json({
        success: true,
        message: 'Message sent to Telegram successfully',
        data: result,
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }
}
