import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createHash } from 'crypto';

import { SecretEntity } from './entities/secret.entity';
import { CreateSecretDto } from './dto/create-secret.dto';
import { CryptoService } from 'src/common/guards/crypto.service';
import toResponse from './maps/secret.mapper';

@Injectable()
export class SecretService {
  constructor(
    @InjectRepository(SecretEntity)
    private readonly secretRepository: Repository<SecretEntity>,
    private readonly cryptoService: CryptoService,
  ) {}

  async register(data: CreateSecretDto) {
    const type = this.normalizeSegment(data.type, 'type');
    const system = this.normalizeSegment(data.system, 'system');
    const identifiers = this.normalizeIdentifiers(data.identifiers);
    const reference_hash = this.buildReferenceHash(type, system, identifiers);
    const encrypted = this.cryptoService.encrypt(data.credentials);

    const existing = await this.secretRepository.findOne({
      where: { reference_hash, is_active: true },
    });

    if (existing) {
      throw new ConflictException('Active secret already exists. Use /rotate to deactivate and create a new one.');
    }

    const secret = this.secretRepository.create({
      type,
      system,
      identifiers,
      reference_hash,
      credentials: encrypted,
      expires_at: this.toDate(data.expires_at),
      is_active: true,
    });

    const saved = await this.secretRepository.save(secret);
    return this.mapSecret(saved);
  }

  async rotate(data: CreateSecretDto) {
    const type = this.normalizeSegment(data.type, 'type');
    const system = this.normalizeSegment(data.system, 'system');
    const identifiers = this.normalizeIdentifiers(data.identifiers);
    const reference_hash = this.buildReferenceHash(type, system, identifiers);
    const encrypted = this.cryptoService.encrypt(data.credentials);

    return this.secretRepository.manager.transaction(async (manager) => {
      const repo = manager.getRepository(SecretEntity);

      const active = await repo.findOne({ where: { reference_hash, is_active: true } });

      if (!active) {
        throw new NotFoundException('No active secret found. Use /register to create one.');
      }

      await repo.update(active.id, {
        is_active: false,
        deactivated_at: new Date(),
      });

      const secret = repo.create({
        type,
        system,
        identifiers,
        reference_hash,
        credentials: encrypted,
        expires_at: this.toDate(data.expires_at),
        is_active: true,
      });

      const saved = await repo.save(secret);
      return this.mapSecret(saved);
    });
  }

  async findActiveByRow(type: string, system: string, identifiers: string[]) {
    const normalizedType = this.normalizeSegment(type, 'type');
    const normalizedSystem = this.normalizeSegment(system, 'system');
    const normalizedIdentifiers = this.normalizeIdentifiers(identifiers);
    const reference_hash = this.buildReferenceHash(normalizedType, normalizedSystem, normalizedIdentifiers);

    const secret = await this.secretRepository.findOne({ where: { reference_hash, is_active: true } });

    if (!secret) {
      throw new NotFoundException('Active secret not found');
    }

    return this.mapSecret(secret);
  }

  async findActiveByHash(hash: string) {
    const secret = await this.secretRepository.findOne({ where: { reference_hash: hash, is_active: true } });

    if (!secret) {
      throw new NotFoundException('Active secret not found');
    }

    return this.mapSecret(secret);
  }

  async findByRow(type: string, system: string, identifiers: string[]) {
    const normalizedType = this.normalizeSegment(type, 'type');
    const normalizedSystem = this.normalizeSegment(system, 'system');
    const normalizedIdentifiers = this.normalizeIdentifiers(identifiers);
    const reference_hash = this.buildReferenceHash(normalizedType, normalizedSystem, normalizedIdentifiers);

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
      credentials,
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
      credentials,
    };
  }

  async findById(id: number) {
    const secret = await this.secretRepository.findOne({ where: { id } });

    if (!secret) {
      throw new NotFoundException('Secret not found');
    }

    const credentials = this.cryptoService.decrypt(secret.credentials);

    return {
      ...secret,
      credentials,
    };
  }

  async getAll(options?: {
    type?: string;
    system?: string;
    identifiers?: string[];
    active?: boolean;
    page?: string | number;
    limit?: string | number;
  }) {
    const { page, limit, skip } = this.parsePagination(options?.page, options?.limit);

    const query = this.secretRepository.createQueryBuilder('secret');

    const type = this.normalizeOptionalSegment(options?.type);
    if (type) {
      query.andWhere('secret.type ILIKE :type', {
        type: `%${type}%`,
      });
    }

    const system = this.normalizeOptionalSegment(options?.system);
    if (system) {
      query.andWhere('secret.system ILIKE :system', {
        system: `%${system}%`,
      });
    }

    const identifiers = this.normalizeOptionalIdentifiers(options?.identifiers);
    if (identifiers) {
      query.andWhere('secret.identifiers && :identifiers', { identifiers });
    }

    if (options?.active !== undefined) {
      query.andWhere('secret.is_active = :active', { active: options.active });
    }

    query.orderBy('secret.id', 'DESC').skip(skip).take(limit);

    const [secrets, total] = await query.getManyAndCount();

    const pages = total === 0 ? 0 : Math.ceil(total / limit);

    return {
      data: secrets.map((secret) => this.mapSecret(secret)),
      meta: {
        page,
        limit,
        total,
        pages,
      },
    };
  }

  async deactivateByRow(type: string, system: string, identifiers: string[]) {
    const secret = await this.findByRow(type, system, identifiers);
    return this.deactivateSecret(secret);
  }

  async deactivateByHash(hash: string) {
    const secret = await this.findByHash(hash);
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

    return { message: `Secret ${secret.type}:${secret.system}:${secret.identifiers} deactivated` };
  }

  private mapSecret(secret: SecretEntity) {
    return toResponse(secret, (payload) => this.cryptoService.decrypt(payload));
  }

  private buildReferenceHash(type: string, system: string, identifiers: string[]) {
    return this.computeHash(this.buildReferenceValue(type, system, identifiers));
  }

  private buildReferenceValue(type: string, system: string, identifiers: string[]) {
    return `${type}:${system}:${identifiers.join(':')}`;
  }

  private normalizeSegment(value: string, label: string) {
    const normalized = (value ?? '').trim();

    if (!normalized) {
      throw new BadRequestException(`Required parameter: ${label ?? 'value'}`);
    }

    return normalized;
  }

  private normalizeOptionalSegment(value?: string) {
    const normalized = (value ?? '').trim();
    return normalized ? normalized : undefined;
  }

  private parseIdentifiers(identifiers?: string[]) {
    if (!identifiers) {
      return [];
    }

    return identifiers.map((item) => String(item).trim()).filter(Boolean);
  }

  private normalizeIdentifiers(identifiers: string[]) {
    const normalized = this.parseIdentifiers(identifiers);

    if (!normalized.length) {
      throw new BadRequestException('Required parameter: identifiers');
    }

    return normalized;
  }

  private normalizeOptionalIdentifiers(identifiers?: string[]) {
    const normalized = this.parseIdentifiers(identifiers);
    return normalized.length ? normalized : undefined;
  }

  private computeHash(value: string) {
    return createHash('sha256').update(value).digest('hex');
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

  private parsePagination(pageValue?: string | number, limitValue?: string | number) {
    const page = this.parsePositiveInt(pageValue, 1, 'page');
    const limit = this.parsePositiveInt(limitValue, 20, 'limit');

    if (limit > 100) {
      throw new BadRequestException('limit must be less than or equal to 100');
    }

    return {
      page,
      limit,
      skip: (page - 1) * limit,
    };
  }

  private parsePositiveInt(value: string | number | undefined, fallback: number, label: string) {
    if (value === undefined || value === null || value === '') {
      return fallback;
    }

    const parsed = typeof value === 'number' ? value : Number.parseInt(String(value), 10);

    if (!Number.isFinite(parsed) || parsed <= 0) {
      throw new BadRequestException(`${label} must be a positive integer`);
    }

    return parsed;
  }

}