import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';


export const RedisProvider = {
  
  provide: 'REDIS_CLIENT',
  inject: [ConfigService],

  useFactory: (configService: ConfigService) => {
    const redis = new Redis({
      host: configService.get<string>('redis.host'),
      port: configService.get<number>('redis.port'),
      password: configService.get<string>('redis.password'),
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });

    redis.on('connect', () => {
      console.log('Redis connected');
    });

    redis.on('ready', () => {
      console.log('Redis ready');
    });

    redis.on('error', (err) => {
      console.error('Redis error', err);
    });

    return redis;
  },
};