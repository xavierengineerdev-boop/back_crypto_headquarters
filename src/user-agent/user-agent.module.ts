import { Module } from '@nestjs/common';
import { UserAgentService } from './user-agent.service';

@Module({
  providers: [UserAgentService],
  exports: [UserAgentService],
})
export class UserAgentModule {}

