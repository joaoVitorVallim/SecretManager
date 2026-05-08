import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes, createCipheriv, createDecipheriv } from 'crypto';

import { EncryptedPayload } from 'src/common/types/encrypted-payload.type';

@Injectable()
export class CryptoService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly key: Buffer;

  constructor(private readonly configService: ConfigService) {
    this.key = Buffer.from(this.configService.get<string>('auth.secretEncryptionKey')!, 'hex');

    if (this.key.length !== 32) {
      throw new Error('SECRET_ENCRYPTION_KEY deve possuir 32 bytes');
    }
  }

  encrypt(value: unknown): EncryptedPayload {
    const iv = randomBytes(16);

    const cipher = createCipheriv(
      this.algorithm,
      this.key,
      iv
    );

    const encrypted = Buffer.concat([
      cipher.update(JSON.stringify(value), 'utf8'),
      cipher.final(),
    ]);

    const tag = cipher.getAuthTag();

    return {
      iv: iv.toString('hex'),
      tag: tag.toString('hex'),
      _enc: encrypted.toString('hex'),
    };
  }

  decrypt(payload: EncryptedPayload) {
    const decipher = createDecipheriv(
      this.algorithm,
      this.key,
      Buffer.from(payload.iv, 'hex'),
    );

    decipher.setAuthTag(
      Buffer.from(payload.tag, 'hex'),
    );

    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(payload._enc, 'hex')),
      decipher.final(),
    ]);

    return JSON.parse(decrypted.toString('utf8'));
  }
}