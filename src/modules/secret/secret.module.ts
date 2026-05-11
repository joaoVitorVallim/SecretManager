import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SecretController } from './secret.controller';
import { SecretService } from './secret.service';
import { SecretEntity } from './entities/secret.entity';
import { SecretHashBuilder } from './builders/secret-hash.builder';
import { SecretNormalizer } from './normalizers/secret.normalizer';
import { CommonModule } from 'src/common/common.module';


@Module({
  imports: [
    TypeOrmModule.forFeature([SecretEntity]),
    CommonModule,
  ],
  
  providers: [
    SecretService,
    SecretHashBuilder,
    SecretNormalizer,
  ],
  
  controllers: [SecretController],
  
})
export class SecretModule {}