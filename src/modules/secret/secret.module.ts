import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SecretController } from './secret.controller';
import { SecretService } from './secret.service';
import { SecretEntity } from './entities/secret.entity';
import { SecretHashBuilder } from './builders/secret-hash.builder';
import { SecretNormalizer } from './normalizers/secret.normalizer';
import { CommonModule } from 'src/common/common.module';
import { MailModule } from 'src/common/warnings/mail/mail.module';
import { SlackModule } from 'src/common/warnings/slack/slack.module';
import { ScheduleModule } from '@nestjs/schedule';
import { SecretExpiryJob } from './jobs/secret-expiry.job';


@Module({
  imports: [
    TypeOrmModule.forFeature([SecretEntity]),
    CommonModule,
    MailModule,
    SlackModule,
    ScheduleModule,
  ],
  
  providers: [
    SecretService,
    SecretHashBuilder,
    SecretNormalizer,
    SecretExpiryJob
  ],
  
  controllers: [SecretController],
  
})
export class SecretModule {}