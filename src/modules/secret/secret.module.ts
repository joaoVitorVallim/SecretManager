import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SecretController } from './secret.controller';
import { SecretService } from './secret.service';
import { SecretEntity } from './entities/secret.entity';
import { SecretHashBuilder } from './builders/secret-hash.builder';
import { SecretNormalizer } from './normalizers/secret.normalizer';
import { CommonModule } from 'src/common/common.module';
import { WarningsModule } from 'src/common/warnings/warnings.module';
import { ScheduleModule } from '@nestjs/schedule';
import { SecretExpiryJob } from './jobs/secret-expiry.job';


@Module({
  imports: [
    TypeOrmModule.forFeature([SecretEntity]),
    CommonModule,
    WarningsModule,
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