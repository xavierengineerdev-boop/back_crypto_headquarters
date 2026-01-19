import { Controller, Get, Post, Body, Res, Req, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service';
import { UserInfoService } from './user-info/user-info.service';
import type { Response, Request } from 'express';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly userInfoService: UserInfoService,
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

      const userInfo = this.userInfoService.collectUserInfo(req, data);
      const formattedUserInfo = this.userInfoService.formatUserInfo(userInfo);

      const result = await this.appService.sendToTelegram(data, formattedUserInfo);
      
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
