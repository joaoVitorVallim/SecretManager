import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailService } from './mail/mail.service';
import { SlackService } from './slack/slack.service';

@Module({
  imports: [ConfigModule],

  providers: [MailService, SlackService],

  exports: [MailService, SlackService],

})
export class WarningsModule {}



