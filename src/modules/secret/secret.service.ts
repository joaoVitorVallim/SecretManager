import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createHash } from 'crypto';

import { SecretEntity } from './entities/secret.entity';
import { CreateSecretDto } from './dto/create-secret.dto';

@Injectable()
export class SecretService {
  constructor(
    @InjectRepository(SecretEntity)
    private readonly secretRepository: Repository<SecretEntity>,
  ) {}

  async register(data: CreateSecretDto) {
    const reference_row = this.normalizeReferenceRow(data.reference_row);
    const reference_hash = this.computeHash(reference_row);

    const existing = await this.secretRepository.findOne({
      where: { reference_hash, is_active: true },
    });

    if (existing) {
      throw new ConflictException('Cadastro ativo ja existe');
    }

    const secret = this.secretRepository.create({
      reference_row,
      reference_hash,
      credentials: data.credentials,
      expires_at: this.toDate(data.expires_at),
      is_active: true,
    });

    try {
      return await this.secretRepository.save(secret);
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException('Cadastro ativo ja existe');
      }

      throw error;
    }
  }

  async rotate(data: CreateSecretDto) {
    const reference_row = this.normalizeReferenceRow(data.reference_row);
    const reference_hash = this.computeHash(reference_row);

    return this.secretRepository.manager.transaction(async (manager) => {
      const repo = manager.getRepository(SecretEntity);

      const active = await repo.findOne({
        where: { reference_hash, is_active: true },
      });

      if (!active) {
        throw new NotFoundException('Cadastro ativo nao encontrado');
      }

      active.is_active = false;
      active.deactivated_at = new Date();
      await repo.save(active);

      const secret = repo.create({
        reference_row,
        reference_hash,
        credentials: data.credentials,
        expires_at: this.toDate(data.expires_at),
        is_active: true,
      });

      return repo.save(secret);
    });
  }

  async findActiveByRow(type?: string, system?: string, identifiers?: string | string[]) {
    const reference_row = this.buildReferenceRowFromQuery(type, system, identifiers);
    const reference_hash = this.computeHash(reference_row);

    const secret = await this.secretRepository.findOne({
      where: { reference_hash, reference_row, is_active: true },
    });

    if (!secret) {
      throw new NotFoundException('Cadastro ativo nao encontrado');
    }

    return secret;
  }

  async findActiveByHash(hash: string) {
    const secret = await this.secretRepository.findOne({
      where: { reference_hash: hash, is_active: true },
    });

    if (!secret) {
      throw new NotFoundException('Cadastro ativo nao encontrado');
    }

    return secret;
  }

  async findById(id: number) {
    const secret = await this.secretRepository.findOne({
      where: { id },
    });

    if (!secret) {
      throw new NotFoundException('Cadastro nao encontrado');
    }

    return secret;
  }

  async deactivateByRow(type?: string, system?: string, identifiers?: string | string[]) {
    const secret = await this.findActiveByRow(type, system, identifiers);
    return this.deactivateSecret(secret);
  }

  async deactivateByHash(hash: string) {
    const secret = await this.findActiveByHash(hash);
    return this.deactivateSecret(secret);
  }

  async deactivateById(id: number) {
    const secret = await this.findById(id);
    return this.deactivateSecret(secret);
  }

  private async deactivateSecret(secret: SecretEntity) {
    if (!secret.is_active) {
      return { message: 'Cadastro ja estava inativo' };
    }

    secret.is_active = false;
    secret.deactivated_at = new Date();

    await this.secretRepository.save(secret);

    return { message: 'Cadastro inativado' };
  }

  private normalizeReferenceRow(reference_row?: string) {
    const normalized = (reference_row ?? '').trim();

    if (!normalized) {
      throw new BadRequestException('Campo reference_row e obrigatorio');
    }

    return normalized;
  }

  private buildReferenceRowFromQuery(type?: string, system?: string, identifiers?: string | string[]) {
    const normalizedType = this.normalizeSegment(type, 'type');
    const normalizedSystem = this.normalizeSegment(system, 'system');
    const normalizedIdentifiers = this.normalizeIdentifiers(identifiers);

    return `${normalizedType}:${normalizedSystem}:${normalizedIdentifiers}`;
  }

  private normalizeSegment(value?: string, label?: string) {
    const normalized = (value ?? '').trim();

    if (!normalized) {
      throw new BadRequestException(`Parametro obrigatorio: ${label ?? 'valor'}`);
    }

    return normalized;
  }

  private normalizeIdentifiers(identifiers?: string | string[]) {
    if (!identifiers) {
      throw new BadRequestException('Parametro obrigatorio: identifiers');
    }

    const parts = Array.isArray(identifiers) ? identifiers : String(identifiers).split(',');
    const normalized = parts.map((item) => item.trim()).filter(Boolean).join(',');

    if (!normalized) {
      throw new BadRequestException('Parametro obrigatorio: identifiers');
    }

    return normalized;
  }

  private computeHash(reference_row: string) {
    return createHash('md5').update(reference_row).digest('hex');
  }

  private toDate(value?: string) {
    return value ? new Date(value) : null;
  }

  private isUniqueViolation(error: unknown) {
    if (!error || typeof error !== 'object') {
      return false;
    }

    const errorWithCode = error as { code?: string };
    return errorWithCode.code === '23505';
  }
}