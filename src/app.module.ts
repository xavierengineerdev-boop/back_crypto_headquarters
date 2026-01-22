import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserAgentModule } from './user-agent/user-agent.module';
import { UserInfoModule } from './user-info/user-info.module';
import { DuplicateCheckModule } from './duplicate-check/duplicate-check.module';
import { LeadsModule } from './leads/leads.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI') || 'mongodb://localhost:27017/crypto_headquarters',
      }),
      inject: [ConfigService],
    }),
    HttpModule,
    UserAgentModule,
    UserInfoModule,
    DuplicateCheckModule,
    LeadsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
