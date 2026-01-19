import { Module } from '@nestjs/common';
import { UserInfoService } from './user-info.service';

@Module({
  providers: [UserInfoService],
  exports: [UserInfoService],
})
export class UserInfoModule {}

