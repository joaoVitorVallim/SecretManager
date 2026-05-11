// src/common/common.module.ts
import { Module } from '@nestjs/common';
import { PaginationHelper } from './helpers/pagination.helper';
import { CryptoService } from './guards/crypto.service';
import { ApiKeyGuard } from './guards/api-key.guard';

@Module({
  providers: [
    PaginationHelper,
    CryptoService,
    ApiKeyGuard,
  ],
  exports: [
    PaginationHelper,
    CryptoService,
    ApiKeyGuard,
  ],
})
export class CommonModule {}