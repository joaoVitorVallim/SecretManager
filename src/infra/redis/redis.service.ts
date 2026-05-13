import { Inject, Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';


@Injectable()
export class RedisService {
  private readonly logger = new Logger(RedisService.name)
  constructor(
    @Inject('REDIS_CLIENT')
    private readonly redis: Redis,
    private readonly configService: ConfigService,
  ) {}

  // normalização de chaves para evitar duplicação e erros de digitação
  static activeHash(hash: string) {
    return `secret:active:${hash}`;
  }

  static activeId(id: number) {
    return `secret:active:id:${id}`;
  }

  // métodos genéricos de cache
  async get<T>(key: string): Promise<T | null> {
    const data = await this.redis.get(key);

    if (!data) {
        return null;
    }

    try {
        return JSON.parse(data);
    } catch {
        return null;
    };
  }

  async set(
    key: string,
    value: unknown,
    ttl: number = Number(this.configService.get<string>('redis.TTL')),
  ): Promise<void> {
    const payload = JSON.stringify(value);

    await this.redis.set(
        key, 
        payload,
        'EX',
        ttl,
    );
  }

  async delete(key: string): Promise<void> {
    await this.redis.del(key);
    this.logger.log(`Cache invalidated: ${key}`);
  }

  // método para obter do cache ou executar callback e armazenar resultado
  async getOrSetCache<T>(key: string, callback: () => Promise<T>): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null){
      this.logger.log(`Cache hit: ${key}`);
      return cached;
    }

    this.logger.log(`Cache miss: ${key}`);
    const result = await callback();
    await this.set(key, result);
    this.logger.log(`Data saved to cache: ${key}`);
    return result;
  }
}

