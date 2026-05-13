import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';

import { SecretModule } from './modules/secret/secret.module';
import { ApiKeyGuard } from './common/guards/api-key.guard';
import envConfig from './config/env.config';
import { ScheduleModule } from '@nestjs/schedule';

import { RedisModule } from './infra/redis/redis.module';
import { SystemController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [envConfig],
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('database.host'),
        port: config.get<number>('database.port'),
        username: config.get<string>('database.username'),
        password: config.get<string>('database.password'),
        database: config.get<string>('database.name'),
        autoLoadEntities: true,
        synchronize: false,
      }),
    }),

    ScheduleModule.forRoot(),

    RedisModule,
    SecretModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ApiKeyGuard,
    },
  ],
  controllers: [SystemController],
})
export class AppModule {}