import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { SecretEntity } from 'src/modules/secret/entities/secret.entity';
import { secretDisabledSlackMessage } from './templates/disabled-secret-slack.template';
import { expiringSecretSlackMessage } from './templates/expiring-secret-slack.template';
import { SecretPayload } from 'src/common/types/encrypted-payload.type';

@Injectable()
export class SlackService implements OnModuleInit {
  private readonly logger = new Logger(SlackService.name);

  private webhookUrl: string;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const webhookUrl = this.configService.get<string>('slack.webhookUrl');

    if (!webhookUrl) {
      this.logger.warn('Slack not configured. Skipping webhook setup.');
      return;
    }

    this.webhookUrl = webhookUrl;
  }

  async send(payload: object) {
    try {
      await axios.post(this.webhookUrl, payload);

      this.logger.log('Slack message sent.');
    } catch (error) {
      this.logger.error('Failed to send Slack message', error);
    }
  }

  async notifySecretDisabled(secret: SecretEntity) {
    const message = secretDisabledSlackMessage(secret);
    await this.send(message);
  }

  async notifySecretExpiring(decryptedSecrets: SecretPayload[]) {
  const message = expiringSecretSlackMessage(decryptedSecrets);
    await this.send(message);
  }

}