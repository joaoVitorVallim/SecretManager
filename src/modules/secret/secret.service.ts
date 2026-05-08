import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createHash } from 'crypto';

import { SecretEntity } from './entities/secret.entity';
import { CreateSecretDto } from './dto/create-secret.dto';
import { CryptoService } from 'src/common/guards/crypto.service';

@Injectable()
export class SecretService {
  constructor(
    @InjectRepository(SecretEntity)
    private readonly secretRepository: Repository<SecretEntity>,
    private readonly cryptoService: CryptoService,
  ) {}

  async register(data: CreateSecretDto) {
    const reference_row = this.normalizeReferenceRow(data.reference_row);
    const reference_hash = this.computeHash(reference_row);
    const encrypted = this.cryptoService.encrypt(data.credentials);

    const existing = await this.secretRepository.findOne({
      where: { reference_hash, is_active: true },
    });

    if (existing) {
      throw new ConflictException('Active secret already exists. Use /rotate to deactivate and create a new one.');
    }

    const secret = this.secretRepository.create({
      reference_row,
      reference_hash,
      credentials: encrypted,
      expires_at: this.toDate(data.expires_at),
      is_active: true,
    });

    return await this.secretRepository.save(secret);
  }

  async rotate(data: CreateSecretDto) {
    const reference_row = this.normalizeReferenceRow(data.reference_row);
    const reference_hash = this.computeHash(reference_row);
    const encrypted = this.cryptoService.encrypt(data.credentials);

    return this.secretRepository.manager.transaction(async (manager) => {
      const repo = manager.getRepository(SecretEntity);

      const active = await repo.findOne({where: { reference_hash, is_active: true }});

      if (!active) {
        throw new NotFoundException('No active secret found. Use /register to create one.');
      }

      await this.secretRepository.update(active.id, {
        is_active: false,
        deactivated_at: new Date(),
      });

      const secret = repo.create({
        reference_row,
        reference_hash,
        credentials: encrypted,
        expires_at: this.toDate(data.expires_at),
        is_active: true,
      });

      return repo.save(secret);
    });
  }

  async findActiveByRow(type: string, system: string, identifiers: string | string[]) {
    const reference_row = this.buildReferenceRowFromQuery(type, system, identifiers);
    const reference_hash = this.computeHash(reference_row);

    const secret = await this.secretRepository.findOne({where: { reference_hash, is_active: true }});

    if (!secret) {
      throw new NotFoundException('Active secret not found');
    }

    const credentials = this.cryptoService.decrypt(secret.credentials);

    return {
      ...secret,
      credentials
    };
  }

  async findActiveByHash(hash: string) {
    const secret = await this.secretRepository.findOne({where: { reference_hash: hash, is_active: true }});

    if (!secret) {
      throw new NotFoundException('Active secret not found');
    }

    const credentials = this.cryptoService.decrypt(secret.credentials);

    return {
      ...secret,
      credentials
    };
  }

  async findByRow(type: string, system: string, identifiers: string | string[]) {
    const reference_row = this.buildReferenceRowFromQuery(type, system, identifiers);
    const reference_hash = this.computeHash(reference_row);

    const secret = await this.secretRepository.findOne({
      where: { reference_hash },
      order: { is_active: 'DESC', id: 'DESC' },
    });

    if (!secret) {
      throw new NotFoundException('Secret not found');
    }

    const credentials = this.cryptoService.decrypt(secret.credentials);

    return {
      ...secret,
      credentials
    };
  }

  async findByHash(hash: string) {
    const secret = await this.secretRepository.findOne({
      where: { reference_hash: hash },
      order: { is_active: 'DESC', id: 'DESC' },
    });

    if (!secret) {
      throw new NotFoundException('Secret not found');
    }

    const credentials = this.cryptoService.decrypt(secret.credentials);

    return {
      ...secret,
      credentials
    };
  }

  async findById(id: number) {
    const secret = await this.secretRepository.findOne({where: { id }});

    if (!secret) {
      throw new NotFoundException('Secret not found');
    }

    const credentials = this.cryptoService.decrypt(secret.credentials);

    return {
      ...secret,
      credentials
    };

  }

  async deactivateByRow(type: string, system: string, identifiers: string | string[]) {
    const secret = await this.findByRow(type, system, identifiers);
    return this.deactivateSecret(secret);
  }

  async deactivateByHash(hash: string) {
    const secret = await this.findByHash(hash);
    console.log(secret)
    return this.deactivateSecret(secret);
  }

  async deactivateById(id: number) {
    const secret = await this.findById(id);
    return this.deactivateSecret(secret);
  }

  private async deactivateSecret(secret: SecretEntity) {
    if (!secret.is_active) {
      return { message: 'Secret already inactive' };
    }

    await this.secretRepository.update(secret.id, {
      is_active: false,
      deactivated_at: new Date(),
    });

    return { message: 'Secret deactivated' };
  }

  private normalizeReferenceRow(reference_row: string) {
    const normalized = (reference_row ?? '').trim();

    if (!normalized) {
      throw new BadRequestException('reference_row is required');
    }

    const parts = normalized
      .split(':')
      .map((part) => part.trim())
      .filter(Boolean);

    if (parts.length < 3) {
      throw new BadRequestException(
        'reference_row must have at least 3 segments: type:system:identifiers',
      );
    }

    return parts.join(':');
  }

  private buildReferenceRowFromQuery(type: string, system: string, identifiers: string | string[]) {
    const normalizedType = this.normalizeSegment(type, 'type');
    const normalizedSystem = this.normalizeSegment(system, 'system');
    const normalizedIdentifiers = this.normalizeIdentifiers(identifiers);

    return `${normalizedType}:${normalizedSystem}:${normalizedIdentifiers}`;
  }

  private normalizeSegment(value: string, label: string) {
    const normalized = (value ?? '').trim();

    if (!normalized) {
      throw new BadRequestException(`Required parameter: ${label ?? 'value'}`);
    }

    return normalized;
  }

  private normalizeIdentifiers(identifiers: string | string[]) {
    if (!identifiers) {
      throw new BadRequestException('Required parameter: identifiers');
    }

    const parts = Array.isArray(identifiers) ? identifiers : String(identifiers).split(',');
    const normalized = parts.map((item) => item.trim()).filter(Boolean).join(':');

    if (!normalized) {
      throw new BadRequestException('Invalid identifiers format');
    }

    return normalized;
  }

  private computeHash(reference_row: string) {
    return createHash('sha256').update(reference_row).digest('hex');
  }

  private toDate(value?: string) {
    if (!value) {
      return null;
    }

    const normalized = value.trim();

    const dateOnlyRegex = /^\d{4}-\d{2}-\d{2}$/;

    if (dateOnlyRegex.test(normalized)) {
      return new Date(`${normalized}T00:00:00-03:00`);
    }

    const parsed = new Date(normalized);

    if (Number.isNaN(parsed.getTime())) {
      throw new BadRequestException('expires_at is invalid');
    }

    return parsed;
  }

}