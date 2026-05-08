import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SecretController } from './secret.controller';
import { SecretService } from './secret.service';
import { SecretEntity } from './entities/secret.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SecretEntity]),
  ],

  controllers: [SecretController],

  providers: [SecretService],
})
export class SecretModule {}