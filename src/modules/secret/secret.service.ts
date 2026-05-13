import { ConflictException, Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SecretEntity } from './entities/secret.entity';
import { CreateSecretDto } from './dto/create-secret.dto';
import { CryptoService } from 'src/common/guards/crypto.service';
import { SecretHashBuilder } from './builders/secret-hash.builder';
import { SecretNormalizer } from './normalizers/secret.normalizer';
import { PaginationHelper } from 'src/common/helpers/pagination.helper';
import toResponse from './maps/secret.mapper';

import { RedisService } from 'src/infra/redis/redis.service'; 

@Injectable()
export class SecretService {
  private readonly logger = new Logger(SecretService.name)

  constructor(
    @InjectRepository(SecretEntity)
    private readonly secretRepository: Repository<SecretEntity>,
    private readonly cryptoService: CryptoService,
    private readonly hashBuilder: SecretHashBuilder,
    private readonly normalizer: SecretNormalizer,
    private readonly pagination: PaginationHelper,
    private readonly redisService: RedisService,
  ) {}

  async register(data: CreateSecretDto) {
    const { type, system, identifiers, reference_hash } = this.resolveKey(data);
    const encrypted = this.cryptoService.encrypt(data.credentials);

    const existing = await this.secretRepository.findOne({ where: { reference_hash, is_active: true } });
    if (existing) {
      throw new ConflictException('Active secret already exists. Use /rotate to deactivate and create a new one.');
    }

    const saved = await this.secretRepository.save(
      this.secretRepository.create({
        type, system, identifiers, reference_hash,
        credentials: encrypted,
        expires_at: this.normalizer.date(data.expires_at),
        is_active: true,
      }),
    );

    return this.mapSecret(saved);
  }

  async rotate(data: CreateSecretDto) {
    const { type, system, identifiers, reference_hash } = this.resolveKey(data);
    const encrypted = this.cryptoService.encrypt(data.credentials);

    const secretRotate = await this.secretRepository.manager.transaction(async (manager) => {
      const repo = manager.getRepository(SecretEntity);

      const active = await repo.findOne({ where: { reference_hash, is_active: true } });
      if (!active) throw new NotFoundException('No active secret found. Use /register to create one.');

      await repo.update(active.id, { is_active: false, deactivated_at: new Date() });

      const saved = await repo.save(
        repo.create({
          type, system, identifiers, reference_hash,
          credentials: encrypted,
          expires_at: this.normalizer.date(data.expires_at),
          is_active: true,
        }),
      );

      return this.mapSecret(saved);
    });
    
    const cacheKey = RedisService.activeHash(reference_hash);
    await this.redisService.delete(cacheKey);

    return secretRotate;
  }

  async findActiveByRow(type: string, system: string, identifiers: string[]) {
    const hash = this.resolveHashFromRaw(type, system, identifiers);
    return this.findActiveByHash(hash);
  }

  async findActiveByHash(hash: string) {
    const cacheKey = RedisService.activeHash(hash);

    const secret = await this.redisService.getOrSetCache(
      cacheKey,
      async () => {
        const secret = await this.secretRepository.findOne({ where: { reference_hash: hash, is_active: true } });
        if (!secret) throw new NotFoundException('Active secret not found');
        return secret;
      },
    );
    return this.mapSecret(secret)
  }

  async findActiveById(id: number) {
    const cacheKey = RedisService.activeId(id);

    const secret = await this.redisService.getOrSetCache(
      cacheKey,
      async () => {
        const secret = await this.secretRepository.findOne({ where: { id, is_active: true } });
        if (!secret) throw new NotFoundException('Active secret not found');
        return secret;
      }
    );
    return this.mapSecret(secret);
  }

  async findByRow(type: string, system: string, identifiers: string[]) {
    const hash = this.resolveHashFromRaw(type, system, identifiers);
    return this.findByHash(hash);
  }

  async findByHash(hash: string) {
    const secret = await this.secretRepository.findOne({
      where: { reference_hash: hash },
      order: { is_active: 'DESC', id: 'DESC' },
    });
    if (!secret) throw new NotFoundException('Secret not found');
    return secret;
  }

  async findById(id: number) {
    const secret = await this.secretRepository.findOne({ where: { id } });
    if (!secret) throw new NotFoundException('Secret not found');
    return secret;
  }

  async getAll(options?: {
    type?: string; system?: string; identifiers?: string[];
    active?: boolean; page?: string | number; limit?: string | number;
  }) {
    const { page, limit, skip } = this.pagination.parse(options?.page, options?.limit);
    const query = this.secretRepository.createQueryBuilder('secret');

    const type = this.normalizer.optionalSegment(options?.type);
    if (type) query.andWhere('secret.type ILIKE :type', { type: `%${type}%` });

    const system = this.normalizer.optionalSegment(options?.system);
    if (system) query.andWhere('secret.system ILIKE :system', { system: `%${system}%` });

    const identifiers = this.normalizer.optionalIdentifiers(options?.identifiers);
    if (identifiers) query.andWhere('secret.identifiers && :identifiers', { identifiers });

    if (options?.active !== undefined) query.andWhere('secret.is_active = :active', { active: options.active });

    query.orderBy('secret.id', 'DESC').skip(skip).take(limit);

    const [secrets, total] = await query.getManyAndCount();
    const pages = total === 0 ? 0 : Math.ceil(total / limit);

    return {
      data: secrets.map((s) => this.mapSecret(s)),
      meta: { page, limit, total, pages },
    };
  }

  async deactivateByRow(type: string, system: string, identifiers: string[]) {
    return this.deactivateSecret(await this.findByRow(type, system, identifiers));
  }

  async deactivateByHash(hash: string) {
    return this.deactivateSecret(await this.findByHash(hash));
  }

  async deactivateById(id: number) {
    return this.deactivateSecret(await this.findById(id));
  }

  
  // ─── Privados ────────────────────────────────────────────────

  private resolveKey(data: CreateSecretDto) {
    const type = this.normalizer.segment(data.type, 'type');
    const system = this.normalizer.segment(data.system, 'system');
    const identifiers = this.normalizer.identifiers(data.identifiers);
    const reference_hash = this.hashBuilder.build(type, system, identifiers);
    return { type, system, identifiers, reference_hash };
  }

  private resolveHashFromRaw(type: string, system: string, identifiers: string[]) {
    return this.hashBuilder.build(
      this.normalizer.segment(type, 'type'),
      this.normalizer.segment(system, 'system'),
      this.normalizer.identifiers(identifiers),
    );
  }

  private async deactivateSecret(secret: SecretEntity) {
    if (!secret.is_active) return { message: 'Secret already inactive' };

    await this.secretRepository.update(secret.id, { is_active: false, deactivated_at: new Date() });
    await Promise.all([
      this.redisService.delete(RedisService.activeHash(secret.reference_hash)),
      this.redisService.delete(RedisService.activeId(secret.id)),
    ]);

    return { message: `Secret ${secret.type}:${secret.system}:${secret.identifiers.join(':')} deactivated` };
  }

  private mapSecret(secret: SecretEntity) {
    return toResponse(secret, (payload) => this.cryptoService.decrypt(payload));
  }
}